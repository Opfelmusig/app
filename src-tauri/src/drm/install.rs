//! Resolve an existing desktop CDM, or install Google's component after showing its terms.
use anyhow::{ensure, Context, Result};
use sha2::{Digest, Sha256};
use std::{
    io::{Cursor, Read},
    path::{Path, PathBuf},
};
use tauri::{AppHandle, Manager};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};

#[cfg(target_os = "macos")]
const PLATFORM: &str = "mac";
#[cfg(target_os = "windows")]
const PLATFORM: &str = "win";
#[cfg(target_os = "linux")]
const PLATFORM: &str = "linux";
#[cfg(target_arch = "aarch64")]
const ARCH: &str = "arm64";
#[cfg(target_arch = "x86_64")]
const ARCH: &str = "x64";
#[cfg(not(any(target_arch = "x86_64", target_arch = "aarch64")))]
const ARCH: &str = "unsupported";
#[cfg(target_os = "macos")]
const LIBRARY: &str = "libwidevinecdm.dylib";
#[cfg(target_os = "windows")]
const LIBRARY: &str = "widevinecdm.dll";
#[cfg(target_os = "linux")]
const LIBRARY: &str = "libwidevinecdm.so";

static INSTALL: tokio::sync::Mutex<()> = tokio::sync::Mutex::const_new(());

pub async fn ensure(app: &AppHandle, http: &reqwest::Client) -> Result<PathBuf> {
    let _lock = INSTALL.lock().await;
    let store = app.path().app_cache_dir()?.join("widevine");
    if let Some(path) = discover(&store) {
        return Ok(path);
    }
    ensure!(
        ARCH != "unsupported",
        "Widevine is unavailable for this processor"
    );
    let accepted = confirm(
        app,
        "Widevine is required",
        "Protected Apple Music playback needs Google's Widevine module. Download it from Google?"
            .into(),
    )
    .await?;
    ensure!(accepted, "Widevine installation was cancelled");
    let request = serde_json::json!({"request": {
        "@os": "", "@updater": "", "acceptformat": "crx3,download,puff,run,xz,zucc",
        "apps": [{"appid": "oimompecagnajdejgnnjijobebaeigek", "installsource": "ondemand", "updatecheck": {}, "version": "1.4.9.1088"}],
        "dedup": "cr", "ismachine": false, "arch": ARCH, "os": {"arch": ARCH, "platform": PLATFORM},
        "protocol": "4.0", "updaterversion": "151.0.7922.173"
    }});
    let text = http
        .post("https://update.googleapis.com/service/update2/json")
        .json(&request)
        .timeout(std::time::Duration::from_secs(30))
        .send()
        .await?
        .error_for_status()?
        .text()
        .await?;
    let answer: serde_json::Value =
        serde_json::from_str(text.strip_prefix(")]}'\n").unwrap_or(&text))?;
    let update = &answer["response"]["apps"][0]["updatecheck"];
    ensure!(
        update["status"] == "ok",
        "Google offers no Widevine module for this platform"
    );
    let version = update["nextversion"]
        .as_str()
        .context("Widevine version missing")?;
    ensure!(
        version
            .split('.')
            .all(|part| !part.is_empty() && part.bytes().all(|b| b.is_ascii_digit())),
        "Invalid Widevine version"
    );
    let operation = &update["pipelines"][0]["operations"][0];
    let expected = operation["out"]["sha256"]
        .as_str()
        .context("Widevine checksum missing")?;
    let urls = operation["urls"]
        .as_array()
        .context("Widevine download URL missing")?;
    let url = urls
        .iter()
        .filter_map(|v| v["url"].as_str())
        .find(|url| url.starts_with("https://"))
        .context("No HTTPS Widevine download URL")?;
    let response = http
        .get(url)
        .timeout(std::time::Duration::from_secs(120))
        .send()
        .await?
        .error_for_status()?;
    ensure!(
        response.content_length().unwrap_or(0) <= 64 * 1024 * 1024,
        "Widevine archive is too large"
    );
    let mut response = response;
    let mut archive = Vec::new();
    while let Some(chunk) = response.chunk().await? {
        ensure!(
            archive.len() + chunk.len() <= 64 * 1024 * 1024,
            "Widevine archive is too large"
        );
        archive.extend_from_slice(&chunk);
    }
    ensure!(
        format!("{:x}", Sha256::digest(&archive)).eq_ignore_ascii_case(expected),
        "Widevine checksum mismatch"
    );
    let zip = unzip_crx(&archive)?;
    let terms = String::from_utf8(entry(zip, "LICENSE")?)?;
    ensure!(
        confirm(app, "Google Widevine terms", terms.clone()).await?,
        "Widevine terms were declined"
    );
    let module = entry(
        zip,
        &format!("_platform_specific/{PLATFORM}_{ARCH}/{LIBRARY}"),
    )?;
    let folder = store.join(version);
    std::fs::create_dir_all(&folder)?;
    std::fs::write(folder.join("LICENSE"), terms)?;
    std::fs::write(folder.join("manifest.json"), entry(zip, "manifest.json")?)?;
    let path = folder.join(LIBRARY);
    std::fs::write(folder.join("module.part"), module)?;
    std::fs::rename(folder.join("module.part"), &path)?;
    // Only our own directory is searched; browser paths come from their own pointer files.
    std::fs::write(store.join("current"), version)?;
    Ok(path)
}

async fn confirm(app: &AppHandle, title: &'static str, text: String) -> Result<bool> {
    let app = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        app.dialog()
            .message(text)
            .title(title)
            .buttons(MessageDialogButtons::OkCancel)
            .blocking_show()
    })
    .await
    .context("Widevine dialog failed")
}

fn unzip_crx(archive: &[u8]) -> Result<&[u8]> {
    ensure!(
        archive.get(..8) == Some(b"Cr24\x03\0\0\0"),
        "Invalid Widevine CRX3 archive"
    );
    let length = u32::from_le_bytes(
        archive
            .get(8..12)
            .context("Truncated CRX header")?
            .try_into()?,
    ) as usize;
    archive.get(12 + length..).context("Truncated CRX archive")
}

fn entry(zip: &[u8], name: &str) -> Result<Vec<u8>> {
    let mut archive = zip::ZipArchive::new(Cursor::new(zip))?;
    let mut file = archive.by_name(name)?;
    ensure!(
        file.size() <= 64 * 1024 * 1024,
        "Widevine archive entry is too large"
    );
    let mut bytes = Vec::new();
    file.by_ref()
        .take(64 * 1024 * 1024 + 1)
        .read_to_end(&mut bytes)?;
    ensure!(
        bytes.len() <= 64 * 1024 * 1024,
        "Widevine archive entry is too large"
    );
    Ok(bytes)
}

fn discover(store: &Path) -> Option<PathBuf> {
    if let Some(path) = std::env::var_os("OPFELMUSIG_WIDEVINE_CDM").map(PathBuf::from) {
        if path.is_file() {
            return Some(path);
        }
    }
    if let Ok(version) = std::fs::read_to_string(store.join("current")) {
        if version
            .split('.')
            .all(|part| !part.is_empty() && part.bytes().all(|b| b.is_ascii_digit()))
        {
            let path = store.join(version).join(LIBRARY);
            if path.is_file() {
                return Some(path);
            }
        }
    }
    browser_paths().into_iter().find(|path| path.is_file())
}

fn chromium_pointer(base: PathBuf) -> Option<PathBuf> {
    let pointer: serde_json::Value = serde_json::from_slice(
        &std::fs::read(base.join("latest-component-updated-widevine-cdm")).ok()?,
    )
    .ok()?;
    let folder = PathBuf::from(pointer["Path"].as_str()?);
    let folder = if folder.is_absolute() {
        folder
    } else {
        base.join(folder)
    };
    Some(folder.join(format!("_platform_specific/{PLATFORM}_{ARCH}/{LIBRARY}")))
}

fn browser_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    #[cfg(target_os = "macos")]
    {
        for (bundle, vendor) in [
            ("Google Chrome", "Google/Chrome"),
            ("Brave Browser", "BraveSoftware/Brave-Browser"),
            ("Microsoft Edge", "Microsoft Edge"),
        ] {
            paths.push(PathBuf::from(format!("/Applications/{bundle}.app/Contents/Frameworks/{bundle} Framework.framework/Libraries/WidevineCdm/_platform_specific/mac_{ARCH}/{LIBRARY}")));
            if let Some(home) = dirs::home_dir() {
                if let Some(path) = chromium_pointer(
                    home.join("Library/Application Support")
                        .join(vendor)
                        .join("WidevineCdm"),
                ) {
                    paths.push(path);
                }
            }
        }
    }
    #[cfg(target_os = "linux")]
    {
        for base in [
            "/opt/google/chrome/WidevineCdm",
            "/opt/brave.com/brave/WidevineCdm",
            "/usr/lib/chromium/WidevineCdm",
            "/usr/lib/chromium-browser/WidevineCdm",
        ] {
            paths.push(
                PathBuf::from(base).join(format!("_platform_specific/linux_{ARCH}/{LIBRARY}")),
            );
        }
        if let Some(config) = dirs::config_dir() {
            for vendor in [
                "google-chrome",
                "chromium",
                "BraveSoftware/Brave-Browser",
                "microsoft-edge",
            ] {
                if let Some(path) = chromium_pointer(config.join(vendor).join("WidevineCdm")) {
                    paths.push(path);
                }
            }
        }
    }
    #[cfg(target_os = "windows")]
    {
        if let Some(local) = dirs::data_local_dir() {
            for vendor in [
                "Google/Chrome/User Data",
                "BraveSoftware/Brave-Browser/User Data",
                "Microsoft/Edge/User Data",
            ] {
                if let Some(path) = chromium_pointer(local.join(vendor).join("WidevineCdm")) {
                    paths.push(path);
                }
            }
        }
    }
    paths
}
