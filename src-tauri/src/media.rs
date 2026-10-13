use serde::{Deserialize, Serialize};
use souvlaki::{
    MediaControlEvent, MediaControls, MediaMetadata, MediaPlayback, MediaPosition, PlatformConfig,
    SeekDirection,
};
use std::{
    ffi::c_void,
    sync::{Arc, Mutex},
    time::Duration,
};
use tauri::{ipc::Channel, AppHandle, State};

use crate::playback::PlaybackStatus;

#[cfg(target_os = "windows")]
use tauri::Manager;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum NativeMediaEvent {
    Play,
    Pause,
    Toggle,
    Next,
    Previous,
    Stop,
    SeekBy { seconds: f64 },
    SetPosition { position: f64 },
    SetVolume { volume: f64 },
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NativeMediaMetadata {
    title: String,
    album: Option<String>,
    artist: Option<String>,
    cover_url: Option<String>,
}

pub struct NativeMediaSession {
    controls: Mutex<Option<MediaControls>>,
    events: Arc<Mutex<Option<Channel<NativeMediaEvent>>>>,
}

impl NativeMediaSession {
    pub fn new(app: &AppHandle) -> Self {
        let events = Arc::new(Mutex::new(None));
        let controls = create_controls(app, Arc::clone(&events)).map_err(|cause| {
            log::error!("Could not initialize OS media controls: {cause}");
        });

        Self {
            controls: Mutex::new(controls.ok()),
            events,
        }
    }

    fn with_controls(
        &self,
        action: impl FnOnce(&mut MediaControls) -> Result<(), souvlaki::Error>,
    ) -> Result<(), String> {
        let mut controls = self
            .controls
            .lock()
            .map_err(|_| "OS media controls are unavailable.".to_string())?;

        if let Some(controls) = controls.as_mut() {
            action(controls)
                .map_err(|cause| format!("Could not update OS media controls: {cause}"))?;
        }

        Ok(())
    }
}

fn create_controls(
    app: &AppHandle,
    events: Arc<Mutex<Option<Channel<NativeMediaEvent>>>>,
) -> Result<MediaControls, String> {
    let mut controls = MediaControls::new(PlatformConfig {
        dbus_name: "opfelmusig",
        display_name: "Öpfelmusig",
        hwnd: window_handle(app)?,
    })
    .map_err(|cause| cause.to_string())?;

    controls
        .attach(move |event| {
            let event = match event {
                MediaControlEvent::Play => NativeMediaEvent::Play,
                MediaControlEvent::Pause => NativeMediaEvent::Pause,
                MediaControlEvent::Toggle => NativeMediaEvent::Toggle,
                MediaControlEvent::Next => NativeMediaEvent::Next,
                MediaControlEvent::Previous => NativeMediaEvent::Previous,
                MediaControlEvent::Stop => NativeMediaEvent::Stop,
                MediaControlEvent::Seek(direction) => NativeMediaEvent::SeekBy {
                    seconds: seek_seconds(direction, Duration::from_secs(10)),
                },
                MediaControlEvent::SeekBy(direction, duration) => NativeMediaEvent::SeekBy {
                    seconds: seek_seconds(direction, duration),
                },
                MediaControlEvent::SetPosition(position) => NativeMediaEvent::SetPosition {
                    position: position.0.as_secs_f64(),
                },
                MediaControlEvent::SetVolume(volume) => NativeMediaEvent::SetVolume { volume },
                _ => return,
            };

            if let Ok(events) = events.lock() {
                if let Some(channel) = events.as_ref() {
                    let _ = channel.send(event);
                }
            }
        })
        .map_err(|cause| cause.to_string())?;

    Ok(controls)
}

fn seek_seconds(direction: SeekDirection, duration: Duration) -> f64 {
    let seconds = duration.as_secs_f64();

    match direction {
        SeekDirection::Forward => seconds,
        SeekDirection::Backward => -seconds,
    }
}

#[cfg(not(target_os = "windows"))]
fn window_handle(_app: &AppHandle) -> Result<Option<*mut c_void>, String> {
    Ok(None)
}

#[cfg(target_os = "windows")]
fn window_handle(app: &AppHandle) -> Result<Option<*mut c_void>, String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "Main window is unavailable.".to_string())?;
    let handle = window.hwnd().map_err(|cause| cause.to_string())?;

    Ok(Some(handle.0))
}

#[tauri::command]
pub fn native_media_listen(
    events: Channel<NativeMediaEvent>,
    media: State<'_, NativeMediaSession>,
) -> Result<(), String> {
    *media
        .events
        .lock()
        .map_err(|_| "OS media controls are unavailable.".to_string())? = Some(events);
    Ok(())
}

pub fn set_metadata(
    media: &NativeMediaSession,
    metadata: &NativeMediaMetadata,
    duration: f64,
) -> Result<(), String> {
    let duration = Duration::try_from_secs_f64(duration).ok();

    media.with_controls(|controls| {
        controls.set_metadata(MediaMetadata {
            title: Some(&metadata.title),
            album: metadata.album.as_deref(),
            artist: metadata.artist.as_deref(),
            cover_url: metadata.cover_url.as_deref(),
            duration,
        })
    })
}

pub fn set_playback(
    media: &NativeMediaSession,
    status: PlaybackStatus,
    position: f64,
    paused: bool,
) -> Result<(), String> {
    let progress = Duration::try_from_secs_f64(position.max(0.0))
        .ok()
        .map(MediaPosition);
    let playback = match status {
        PlaybackStatus::Playing if !paused => MediaPlayback::Playing { progress },
        PlaybackStatus::Playing | PlaybackStatus::Paused | PlaybackStatus::Loading => {
            MediaPlayback::Paused { progress }
        }
        _ => MediaPlayback::Stopped,
    };

    media.with_controls(|controls| controls.set_playback(playback))
}

pub fn clear(media: &NativeMediaSession) -> Result<(), String> {
    media.with_controls(|controls| {
        controls.set_playback(MediaPlayback::Stopped)?;
        controls.set_metadata(MediaMetadata::default())
    })
}

pub fn reset(media: &NativeMediaSession) -> Result<(), String> {
    media
        .events
        .lock()
        .map_err(|_| "OS media controls are unavailable.".to_string())?
        .take();
    clear(media)
}
