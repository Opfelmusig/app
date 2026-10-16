//! Apple licence lifecycle. Renew or replace the CDM without replacing the audio reader.
use super::PlayRequest;
use crate::drm::{self, Cdm, MissingKey};
use anyhow::{ensure, Context, Result};
use base64::{engine::general_purpose::STANDARD, Engine};
use reqwest::Client;
use serde::Deserialize;
use std::{
    path::PathBuf,
    time::{Duration, Instant},
};
use tauri::AppHandle;
use tokio_util::sync::CancellationToken;

const LICENSE_URL: &str =
    "https://play.itunes.apple.com/WebObjects/MZPlay.woa/wa/acquireWebPlaybackLicense";
static LICENSING: tokio::sync::Mutex<()> = tokio::sync::Mutex::const_new(());

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LicenseResponse {
    license: Option<String>,
    error_code: Option<i64>,
    status: Option<i64>,
}

struct AppleLicense {
    http: Client,
    url: String,
    developer_token: String,
    user_token: String,
    uri: String,
    adam_id: String,
    is_library: bool,
    cancel: CancellationToken,
}

impl AppleLicense {
    async fn exchange(&self, challenge: Vec<u8>) -> Result<Vec<u8>> {
        let exchange = async {
            let envelope = serde_json::json!({
                "challenge": STANDARD.encode(challenge), "key-system": "com.widevine.alpha",
                "uri": self.uri, "adamId": self.adam_id, "isLibrary": self.is_library,
                "user-initiated": true,
            });
            let response = self
                .http
                .post(&self.url)
                .bearer_auth(&self.developer_token)
                .header("x-apple-music-user-token", &self.user_token)
                .header("media-user-token", &self.user_token)
                .header("origin", "https://music.apple.com")
                .header("referer", "https://music.apple.com/")
                .timeout(Duration::from_secs(30))
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
                answer.error_code.unwrap_or(0) == 0 && answer.status.unwrap_or(0) == 0,
                "Apple refused the playback licence"
            );
            Ok(STANDARD.decode(
                answer
                    .license
                    .context("Apple returned no playback licence")?,
            )?)
        };
        self.cancel
            .run_until_cancelled(exchange)
            .await
            .context("Playback cancelled")?
    }

    async fn open(&self, path: PathBuf, key_id: [u8; 16]) -> Result<Cdm> {
        let _licensing = self
            .cancel
            .run_until_cancelled(LICENSING.lock())
            .await
            .context("Playback cancelled")?;
        ensure!(!self.cancel.is_cancelled(), "Playback cancelled");
        let (cdm, challenge) = tauri::async_runtime::spawn_blocking(move || -> Result<_> {
            let cdm = Cdm::open(&path)?;
            let challenge = cdm.challenge(&drm::pssh(&key_id))?;
            Ok((cdm, challenge))
        })
        .await??;
        let license = self.exchange(challenge).await?;
        tauri::async_runtime::spawn_blocking(move || -> Result<_> {
            cdm.accept(&license)?;
            Ok(cdm)
        })
        .await?
    }
}

pub struct License {
    apple: AppleLicense,
    path: PathBuf,
    key_id: [u8; 16],
    cdm: Cdm,
    checked: Instant,
}

pub struct LicenseSource<'a> {
    pub uri: String,
    pub key_id: [u8; 16],
    pub song_id: &'a serde_json::Value,
    pub url: Option<&'a str>,
}

impl License {
    pub async fn acquire(
        app: &AppHandle,
        http: Client,
        request: &PlayRequest,
        source: LicenseSource<'_>,
        cancel: CancellationToken,
    ) -> Result<Self> {
        let url = source.url.unwrap_or(LICENSE_URL);
        let endpoint = reqwest::Url::parse(url)?;
        ensure!(
            endpoint.scheme() == "https"
                && endpoint
                    .host_str()
                    .is_some_and(|host| host.ends_with(".apple.com")),
            "Invalid Apple licence endpoint"
        );
        let adam_id = match source.song_id {
            serde_json::Value::String(id) => id.clone(),
            serde_json::Value::Number(id) => id.to_string(),
            _ => anyhow::bail!("Apple returned no playback song ID"),
        };
        let apple = AppleLicense {
            http,
            url: url.into(),
            developer_token: request.developer_token.clone(),
            user_token: request.user_token.clone(),
            uri: source.uri,
            adam_id,
            is_library: request.song.play_params()?.is_library,
            cancel,
        };
        let path = drm::ensure(app, &apple.http).await?;
        let cdm = apple.open(path.clone(), source.key_id).await?;
        Ok(Self {
            apple,
            path,
            key_id: source.key_id,
            cdm,
            checked: Instant::now(),
        })
    }

    fn replace(&mut self) -> Result<()> {
        log::debug!("Refreshing expired or unavailable playback licence");
        self.cdm = tauri::async_runtime::block_on(self.apple.open(self.path.clone(), self.key_id))?;
        self.checked = Instant::now();
        Ok(())
    }

    /// Runs on the decoding worker, never the audio callback or async runtime worker.
    pub fn decrypt(&mut self, sample: &mut [u8], iv: &[u8; 16], subs: &[(u32, u32)]) -> Result<()> {
        ensure!(!self.apple.cancel.is_cancelled(), "Playback cancelled");
        let mut refreshed = false;
        if self.checked.elapsed() >= Duration::from_secs(1) {
            let status = self.cdm.license_status()?;
            if status.expired {
                // An idle session may hold an old renewal challenge. Start fresh after expiry.
                self.replace()?;
                refreshed = true;
            } else if let Some(challenge) = status.renewal {
                log::debug!("Renewing playback licence");
                tauri::async_runtime::block_on(async {
                    let _licensing = self
                        .apple
                        .cancel
                        .run_until_cancelled(LICENSING.lock())
                        .await
                        .context("Playback cancelled")?;
                    let license = self.apple.exchange(challenge).await?;
                    self.cdm.accept(&license)
                })?;
                refreshed = true;
            }
            self.checked = Instant::now();
        }
        match self.cdm.decrypt(sample, &self.key_id, iv, subs) {
            Err(error) if error.is::<MissingKey>() && !refreshed => {
                self.replace()?;
                // Retry the same untouched encrypted sample only once.
                self.cdm.decrypt(sample, &self.key_id, iv, subs)
            }
            result => result,
        }
    }
}
