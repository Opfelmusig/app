use playwire::{Event, MediaControls, PlaybackState, PlayerConfig, Repeat, Track};
use serde::Serialize;
use std::{
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
    SetShuffle { enabled: bool },
    SetRepeat { mode: &'static str },
}

pub struct NativeMediaMetadata {
    pub title: String,
    pub album: Option<String>,
    pub artist: Option<String>,
    pub cover_url: Option<String>,
}

struct MediaSession {
    controls: MediaControls,
    playback: PlaybackState,
}

pub struct NativeMediaSession {
    session: Mutex<Option<MediaSession>>,
    events: Arc<Mutex<Option<Channel<NativeMediaEvent>>>>,
}

impl NativeMediaSession {
    pub fn new(app: &AppHandle) -> Self {
        let events = Arc::new(Mutex::new(None));
        let controls = create_controls(app, Arc::clone(&events)).map_err(|cause| {
            log::error!("Could not initialize OS media controls: {cause}");
        });

        Self {
            session: Mutex::new(controls.ok().map(|controls| MediaSession {
                controls,
                playback: PlaybackState {
                    volume: 1.0,
                    ..PlaybackState::default()
                },
            })),
            events,
        }
    }

    pub fn dispatch(&self, event: NativeMediaEvent) -> Result<(), String> {
        let events = self
            .events
            .lock()
            .map_err(|_| "Playback controls are unavailable.".to_string())?;

        if let Some(channel) = events.as_ref() {
            channel.send(event).map_err(|cause| cause.to_string())?;
        }

        Ok(())
    }

    fn update(&self, action: impl FnOnce(&mut PlaybackState)) -> Result<(), String> {
        let mut session = self
            .session
            .lock()
            .map_err(|_| "OS media controls are unavailable.".to_string())?;

        if let Some(session) = session.as_mut() {
            action(&mut session.playback);
            session
                .controls
                .set_state(&session.playback)
                .map_err(|cause| format!("Could not update OS media controls: {cause}"))?;
        }

        Ok(())
    }
}

fn media_event(event: Event) -> Option<NativeMediaEvent> {
    Some(match event {
        Event::Play => NativeMediaEvent::Play,
        Event::Pause => NativeMediaEvent::Pause,
        Event::PlayPause => NativeMediaEvent::Toggle,
        Event::Next => NativeMediaEvent::Next,
        Event::Previous => NativeMediaEvent::Previous,
        Event::Stop => NativeMediaEvent::Stop,
        Event::SeekBy(seconds) => NativeMediaEvent::SeekBy { seconds },
        Event::SeekTo(position) => NativeMediaEvent::SetPosition {
            position: position.as_secs_f64(),
        },
        Event::SetVolume(volume) => NativeMediaEvent::SetVolume { volume },
        Event::SetShuffle(enabled) => NativeMediaEvent::SetShuffle { enabled },
        Event::SetRepeat(mode) => NativeMediaEvent::SetRepeat {
            mode: match mode {
                Repeat::Off => "off",
                Repeat::One => "one",
                Repeat::All => "all",
            },
        },
        _ => return None,
    })
}

fn create_controls(
    app: &AppHandle,
    events: Arc<Mutex<Option<Channel<NativeMediaEvent>>>>,
) -> Result<MediaControls, String> {
    MediaControls::new(
        PlayerConfig {
            identity: "Öpfelmusig".into(),
            bus_name: "opfelmusig".into(),
            desktop_entry: app
                .config()
                .product_name
                .clone()
                .unwrap_or_else(|| app.package_info().name.clone()),
            hwnd: window_handle(app)?,
            app_media_id: Some(app.config().identifier.clone()),
            ..PlayerConfig::default()
        },
        move |event| {
            let Some(event) = media_event(event) else {
                return;
            };
            if let Ok(events) = events.lock() {
                if let Some(channel) = events.as_ref() {
                    let _ = channel.send(event);
                }
            }
        },
    )
    .map_err(|cause| cause.to_string())
}

#[cfg(not(target_os = "windows"))]
fn window_handle(_app: &AppHandle) -> Result<Option<u64>, String> {
    Ok(None)
}

#[cfg(target_os = "windows")]
fn window_handle(app: &AppHandle) -> Result<Option<u64>, String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "Main window is unavailable.".to_string())?;
    let handle = window.hwnd().map_err(|cause| cause.to_string())?;

    Ok(Some(handle.0 as u64))
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

#[tauri::command]
pub fn native_media_set_play_modes(
    shuffle: bool,
    repeat: bool,
    media: State<'_, NativeMediaSession>,
) -> Result<(), String> {
    media.update(|state| {
        state.shuffle = shuffle;
        state.repeat = if repeat { Repeat::All } else { Repeat::Off };
    })
}

pub fn set_metadata(
    media: &NativeMediaSession,
    id: &str,
    metadata: &NativeMediaMetadata,
    duration: f64,
) -> Result<(), String> {
    media.update(|state| {
        state.track = Some(Track {
            id: id.to_owned(),
            title: metadata.title.clone(),
            album: metadata.album.clone().unwrap_or_default(),
            artists: metadata.artist.iter().cloned().collect(),
            artwork_url: metadata.cover_url.clone().unwrap_or_default(),
            ..Track::default()
        });
        state.duration = Duration::try_from_secs_f64(duration).ok();
        state.position = Duration::ZERO;
        state.playing = false;
    })
}

fn update_playback(state: &mut PlaybackState, status: PlaybackStatus, position: f64, paused: bool) {
    state.playing = !paused
        && match status {
            PlaybackStatus::Playing => true,
            PlaybackStatus::Loading => state.playing,
            _ => false,
        };
    state.position = Duration::try_from_secs_f64(position.max(0.0)).unwrap_or_default();
    if matches!(status, PlaybackStatus::Error | PlaybackStatus::Stopped) {
        state.track = None;
        state.duration = None;
    }
}

pub fn set_playback(
    media: &NativeMediaSession,
    status: PlaybackStatus,
    position: f64,
    paused: bool,
) -> Result<(), String> {
    media.update(|state| update_playback(state, status, position, paused))
}

pub fn clear(media: &NativeMediaSession) -> Result<(), String> {
    media.update(|state| {
        state.track = None;
        state.playing = false;
        state.position = Duration::ZERO;
        state.duration = None;
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
