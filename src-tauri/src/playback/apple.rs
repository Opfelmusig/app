//! Apple-specific requests. DRM hosting, buffering and audio output live in separate modules.
use super::{stream::Media, PlayRequest};
use crate::drm::{self, Cdm};
use anyhow::{ensure, Context, Result};
use base64::{engine::general_purpose::STANDARD, Engine};
use reqwest::{Client, RequestBuilder};
use serde::Deserialize;
use std::time::Duration;
use tauri::AppHandle;
use tokio_util::sync::CancellationToken;

const PLAYBACK: &str = "https://play.music.apple.com/WebObjects/MZPlay.woa/wa/webPlayback";
const LICENSE: &str =
    "https://play.itunes.apple.com/WebObjects/MZPlay.woa/wa/acquireWebPlaybackLicense";
const AGENT: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";

#[derive(Deserialize)]
struct PlaybackResponse {
    #[serde(rename = "songList", default)]
    songs: Vec<Song>,
    #[serde(rename = "failureType")]
    failure: Option<String>,
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
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LicenseResponse {
    license: Option<String>,
    error_code: Option<i64>,
    status: Option<i64>,
}

pub struct Prepared {
    pub media: Media,
}

pub fn client() -> Result<Client> {
    Ok(Client::builder()
        .user_agent(AGENT)
        .connect_timeout(Duration::from_secs(10))
        .read_timeout(Duration::from_secs(20))
        .build()?)
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
    let http = client()?;
    let mut body = serde_json::Map::new();
    if let Some(id) = &request.catalog_id {
        body.insert(
            if request.library_id.is_some() {
                "subscriptionAdamId"
            } else {
                "salableAdamId"
            }
            .into(),
            id.clone().into(),
        );
    }
    if let Some(id) = &request.library_id {
        body.insert("universalLibraryId".into(), id.clone().into());
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
        "Apple refused this track"
    );
    let song = playback
        .songs
        .into_iter()
        .next()
        .context("Apple returned no playable song")?;
    let protected = song.reporting != Some(false);
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
    let media = Media::start(response, protected, cancel.clone());
    if let Some((uri, key_id)) = key {
        // The media body keeps arriving while the CDM is opened and licensed.
        let path = drm::ensure(app, &http).await?;
        ensure!(!cancel.is_cancelled(), "Playback cancelled");
        let (cdm, challenge) = tauri::async_runtime::spawn_blocking(move || -> Result<_> {
            let cdm = Cdm::open(&path)?;
            let challenge = cdm.challenge(&drm::pssh(&key_id))?;
            Ok((cdm, challenge))
        })
        .await??;
        let license_url = song.license.as_deref().unwrap_or(LICENSE);
        let endpoint = reqwest::Url::parse(license_url)?;
        ensure!(
            endpoint.scheme() == "https"
                && endpoint
                    .host_str()
                    .is_some_and(|host| host.ends_with(".apple.com")),
            "Invalid Apple licence endpoint"
        );
        let adam_id = match &song.id {
            serde_json::Value::String(id) => id.clone(),
            serde_json::Value::Number(id) => id.to_string(),
            _ => anyhow::bail!("Apple returned no playback song ID"),
        };
        let envelope = serde_json::json!({ "challenge": STANDARD.encode(challenge), "key-system": "com.widevine.alpha",
            "uri": uri, "adamId": adam_id, "isLibrary": request.library_id.is_some(), "user-initiated": true });
        let response = authenticated(&http, license_url, request)
            .json(&envelope)
            .send()
            .await
            .map_err(|error| error.without_url())?;
        ensure!(
            response.status().is_success(),
            "Apple licence request failed ({})",
            response.status()
        );
        let answer: LicenseResponse = response.json().await?;
        ensure!(
            answer.error_code.or(answer.status).unwrap_or(0) == 0,
            "Apple refused the playback licence"
        );
        let license = STANDARD.decode(
            answer
                .license
                .context("Apple returned no playback licence")?,
        )?;
        let cdm = tauri::async_runtime::spawn_blocking(move || -> Result<_> {
            cdm.accept(&license)?;
            Ok(cdm)
        })
        .await??;
        media.license(cdm, key_id);
    }
    let priming = media.clone();
    tauri::async_runtime::spawn_blocking(move || priming.prime()).await??;
    Ok(Prepared { media })
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
