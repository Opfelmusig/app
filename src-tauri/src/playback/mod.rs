mod apple;
mod audio;
mod cenc;
mod license;
mod output;
mod player;
mod song;
mod stream;

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::{ipc::Channel, AppHandle, Manager, State};

use crate::media;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayRequest {
    pub id: String,
    pub song: song::Song,
    pub developer_token: String,
    pub user_token: String,
    pub volume: f32,
    pub paused: bool,
    pub audio: audio::Settings,
}

#[derive(Clone, Copy, PartialEq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum PlaybackStatus {
    Loading,
    Playing,
    Paused,
    Ended,
    Error,
    Stopped,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaybackEvent {
    id: String,
    status: PlaybackStatus,
    position: f64,
    seek_revision: u64,
    duration: f64,
    error: Option<String>,
    paused: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    reporting: Option<bool>,
}

#[derive(Deserialize)]
#[serde(tag = "action", content = "value", rename_all = "lowercase")]
pub enum Control {
    Pause,
    Resume,
    Seek { position: f64, revision: u64 },
    Volume(f32),
    Audio(audio::Settings),
    Stop,
}

#[derive(Default)]
pub struct NativePlayback(Mutex<Option<Arc<player::Session>>>);

impl NativePlayback {
    pub fn stop(&self) {
        if let Some(session) = self.0.lock().unwrap().take() {
            session.stop();
        }
    }
}

#[tauri::command]
pub fn native_playback_play(
    app: AppHandle,
    state: State<'_, NativePlayback>,
    mut request: PlayRequest,
    events: Channel<PlaybackEvent>,
    media: State<'_, media::NativeMediaSession>,
) -> Result<(), String> {
    let duration = request.song.duration();
    if !duration.is_finite() || duration < 0.0 || !request.volume.is_finite() {
        return Err("Invalid playback duration or volume".into());
    }
    request.audio.validate()?;
    let session = Arc::new(player::Session::new(&request));
    {
        let mut current = state.0.lock().unwrap();
        if let Some(previous) = current.replace(session.clone()) {
            previous.stop();
        }
    }
    if let Err(cause) = media::set_metadata(&media, &request.song.metadata(), duration) {
        log::warn!("Could not update system media metadata: {cause}");
    }
    let reporting = session.clone();
    let reporting_app = app.clone();
    std::thread::Builder::new()
        .name("playback-events".into())
        .spawn(move || {
            let mut update = u64::MAX;
            let mut media_key = None;
            loop {
                let (next_update, event) = reporting.next_event(update);
                update = next_update;
                let terminal = matches!(event.status, PlaybackStatus::Error);
                if reporting.cancel.is_cancelled() && !terminal {
                    break;
                }
                let key = (
                    event.status,
                    event.paused,
                    event.position.floor() as u64,
                    event.seek_revision,
                );
                if media_key != Some(key) {
                    media_key = Some(key);
                    update_media(
                        &reporting_app,
                        &reporting,
                        event.status,
                        event.position,
                        event.paused,
                    );
                }
                let playback = reporting_app.state::<NativePlayback>();
                let current = playback.0.lock().unwrap();
                if !current
                    .as_ref()
                    .is_some_and(|current| Arc::ptr_eq(current, &reporting))
                {
                    break;
                }
                if events.send(event).is_err() {
                    reporting.stop();
                    update_media(
                        &reporting_app,
                        &reporting,
                        PlaybackStatus::Stopped,
                        0.0,
                        true,
                    );
                    break;
                }
                drop(current);
                if terminal {
                    break;
                }
            }
        })
        .map_err(|error| error.to_string())?;
    tauri::async_runtime::spawn(async move {
        let prepared = apple::prepare(&app, &request, session.cancel.clone()).await;
        if session.cancel.is_cancelled() {
            return;
        }
        match prepared {
            Ok(prepared) => {
                session.set_reporting(prepared.reporting);
                let running = session.clone();
                match std::thread::Builder::new()
                    .name("playback-decode".into())
                    .spawn(move || player::run(running, prepared.media))
                {
                    Ok(_) => {}
                    Err(error) => session.fail(error.to_string()),
                }
            }
            Err(error) => session.fail(error.to_string()),
        }
    });
    Ok(())
}

#[tauri::command]
pub fn native_playback_control(
    state: State<'_, NativePlayback>,
    id: String,
    command: Control,
    media: State<'_, media::NativeMediaSession>,
) -> Result<(), String> {
    let mut current = state.0.lock().unwrap();
    if let Some(session) = current.as_ref().filter(|session| session.id == id) {
        if matches!(command, Control::Stop) {
            let session = current.take().unwrap();
            session.stop();
            if let Err(cause) = media::clear(&media) {
                log::warn!("Could not clear system media controls: {cause}");
            }
        } else {
            session.control(command)?;
        }
    }
    Ok(())
}

fn update_media(
    app: &AppHandle,
    session: &Arc<player::Session>,
    status: PlaybackStatus,
    position: f64,
    paused: bool,
) {
    let handle = app.clone();
    let session = session.clone();
    let _ = app.run_on_main_thread(move || {
        let playback = handle.state::<NativePlayback>();
        let current = playback.0.lock().unwrap();
        if current
            .as_ref()
            .is_some_and(|current| Arc::ptr_eq(current, &session))
        {
            let media = handle.state::<media::NativeMediaSession>();
            let result = if session.cancel.is_cancelled() {
                media::clear(&media)
            } else {
                media::set_playback(&media, status, position, paused)
            };
            if let Err(cause) = result {
                log::warn!("Could not update system media controls: {cause}");
            }
        }
    });
}
