//! Apple-specific requests. DRM hosting, buffering and audio output live in separate modules.
use super::{
    license::{License, LicenseSource},
    stream::Media,
    PlayRequest,
};
use anyhow::{ensure, Context, Result};
use base64::{engine::general_purpose::STANDARD, Engine};
use reqwest::{Client, RequestBuilder};
use serde::Deserialize;
use std::time::{Duration, Instant};
use tauri::AppHandle;
use tokio_util::sync::CancellationToken;

const PLAYBACK: &str = "https://play.music.apple.com/WebObjects/MZPlay.woa/wa/webPlayback";
const AGENT: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
static HTTP: tokio::sync::OnceCell<Client> = tokio::sync::OnceCell::const_new();

#[derive(Deserialize)]
struct PlaybackResponse {
    #[serde(rename = "songList", default)]
    songs: Vec<Song>,
    #[serde(rename = "failureType")]
    failure: Option<String>,
    #[serde(rename = "customerMessage")]
    message: Option<String>,
}
#[derive(Deserialize)]
struct Song {
    #[serde(default)]
    assets: Vec<Asset>,
    #[serde(rename = "songId")]
    id: serde_json::Value,
    #[serde(rename = "needsPlaybackReporting")]
    reporting: Option<bool>,
    #[serde(rename = "hls-key-server-url")]
    license: Option<String>,
}
#[derive(Deserialize)]
struct Asset {
    #[serde(rename = "URL")]
    url: String,
    flavor: Option<String>,
}
pub struct Prepared {
    pub media: Media,
    pub reporting: Option<bool>,
}

async fn client() -> Result<Client> {
    let client = HTTP
        .get_or_try_init(|| async {
            Client::builder()
                .user_agent(AGENT)
                .connect_timeout(Duration::from_secs(10))
                .read_timeout(Duration::from_secs(20))
                .build()
        })
        .await?;
    Ok(client.clone())
}

fn authenticated(http: &Client, url: &str, request: &PlayRequest) -> RequestBuilder {
    http.post(url)
        .bearer_auth(&request.developer_token)
        .header("x-apple-music-user-token", &request.user_token)
        .header("media-user-token", &request.user_token)
        .header("origin", "https://music.apple.com")
        .header("referer", "https://music.apple.com/")
        .timeout(Duration::from_secs(30))
}

pub async fn prepare(
    app: &AppHandle,
    request: &PlayRequest,
    cancel: CancellationToken,
) -> Result<Prepared> {
    let started = Instant::now();
    let params = request.song.play_params()?;
    let http = client().await?;
    let mut body = serde_json::Map::new();
    if let Some(id) = params.catalog_id() {
        body.insert(
            if params.is_library {
                "subscriptionAdamId"
            } else {
                "salableAdamId"
            }
            .into(),
            id.into(),
        );
    }
    if let Some(id) = params.library_id() {
        body.insert("universalLibraryId".into(), id.into());
    }
    ensure!(!body.is_empty(), "A catalog or library song ID is required");
    let response = authenticated(&http, PLAYBACK, request)
        .json(&body)
        .send()
        .await
        .map_err(|error| error.without_url())?;
    ensure!(
        response.status().is_success(),
        "Apple playback request failed ({})",
        response.status()
    );
    let playback: PlaybackResponse = response.json().await?;
    ensure!(
        playback.failure.as_deref().unwrap_or_default().is_empty(),
        "Apple refused this track (failureType: {}): {}",
        playback.failure.as_deref().unwrap_or_default(),
        playback
            .message
            .as_deref()
            .unwrap_or("No explanation provided")
    );
    let song = playback
        .songs
        .into_iter()
        .next()
        .context("Apple returned no playable song")?;
    let reporting = song.reporting.or(params.reporting);
    let protected = reporting != Some(false);
    let asset = if protected {
        song.assets
            .iter()
            .find(|asset| asset.flavor.as_deref() == Some("28:ctrp256"))
    } else {
        song.assets.first()
    }
    .context("This song has no supported audio asset")?;
    let (url, key) = if protected {
        let response = http
            .get(&asset.url)
            .timeout(Duration::from_secs(30))
            .send()
            .await
            .map_err(|error| error.without_url())?;
        ensure!(
            response.status().is_success(),
            "Audio playlist request failed ({})",
            response.status()
        );
        let mut response = response;
        let mut bytes = Vec::new();
        while let Some(chunk) = response.chunk().await? {
            ensure!(
                bytes.len() + chunk.len() <= 1024 * 1024,
                "Audio playlist is too large"
            );
            bytes.extend_from_slice(&chunk);
        }
        let playlist = String::from_utf8(bytes)?;
        let (url, uri, id) = playlist_data(&playlist, &asset.url)?;
        (url, Some((uri, id)))
    } else {
        (asset.url.clone(), None)
    };
    ensure!(!cancel.is_cancelled(), "Playback cancelled");
    log::debug!(
        "Playback {}: source resolved in {} ms",
        request.id,
        started.elapsed().as_millis()
    );
    let media_request = async {
        let response = http
            .get(&url)
            .send()
            .await
            .map_err(|error| error.without_url())?;
        ensure!(
            response.status().is_success(),
            "Audio download failed ({})",
            response.status()
        );
        log::debug!(
            "Playback {}: media response at {} ms",
            request.id,
            started.elapsed().as_millis()
        );
        Ok::<_, anyhow::Error>(Media::start(response, protected, cancel.clone()))
    };
    let licensing = async {
        if let Some((uri, key_id)) = key {
            let license = License::acquire(
                app,
                http.clone(),
                request,
                LicenseSource {
                    uri,
                    key_id,
                    song_id: &song.id,
                    url: song.license.as_deref(),
                },
                cancel.clone(),
            )
            .await?;
            log::debug!(
                "Playback {}: licence ready at {} ms",
                request.id,
                started.elapsed().as_millis()
            );
            Ok::<_, anyhow::Error>(Some(license))
        } else {
            Ok(None)
        }
    };
    let (media, license) = tokio::try_join!(media_request, licensing)?;
    if let Some(license) = license {
        media.license(license);
    }
    let priming = media.clone();
    tauri::async_runtime::spawn_blocking(move || priming.prime()).await??;
    log::debug!(
        "Playback {}: prepared in {} ms",
        request.id,
        started.elapsed().as_millis()
    );
    Ok(Prepared { media, reporting })
}

fn attributes(tag: &str) -> Vec<(&str, &str)> {
    let mut rest = tag;
    let mut pairs = Vec::new();
    while let Some((key, value)) = rest.split_once('=') {
        let (value, tail) = if let Some(quoted) = value.strip_prefix('"') {
            match quoted.split_once('"') {
                Some(pair) => pair,
                None => break,
            }
        } else {
            value.split_once(',').unwrap_or((value, ""))
        };
        pairs.push((key.trim(), value));
        rest = tail.trim_start_matches(',');
    }
    pairs
}

fn playlist_data(playlist: &str, base: &str) -> Result<(String, String, [u8; 16])> {
    let mut uri = None;
    let mut media = None;
    for line in playlist.lines().map(str::trim) {
        if let Some(tag) = line.strip_prefix("#EXT-X-KEY:") {
            let pairs = attributes(tag);
            let value = |key| {
                pairs
                    .iter()
                    .find(|(name, _)| *name == key)
                    .map(|(_, value)| *value)
            };
            if value("METHOD") == Some("ISO-23001-7")
                || value("KEYFORMAT") == Some("urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed")
            {
                uri = value("URI")
                    .filter(|uri| uri.starts_with("data:"))
                    .map(str::to_owned);
            }
        }
        if let Some(tag) = line.strip_prefix("#EXT-X-MAP:") {
            media = attributes(tag)
                .into_iter()
                .find(|(key, _)| *key == "URI")
                .map(|(_, value)| value.to_owned());
        }
    }
    let uri = uri.context("Playlist has no Widevine CENC key")?;
    let encoded = uri.rsplit_once(',').context("Invalid CENC key URI")?.1;
    let key_id: [u8; 16] = STANDARD
        .decode(encoded)?
        .try_into()
        .map_err(|_| anyhow::anyhow!("Invalid CENC key ID length"))?;
    let url = reqwest::Url::parse(base)?.join(&media.context("Playlist has no media URL")?)?;
    ensure!(url.scheme() == "https", "Audio must use HTTPS");
    Ok((url.into(), uri, key_id))
}
