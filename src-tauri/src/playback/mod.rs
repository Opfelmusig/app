mod apple;
mod cenc;
mod player;
mod stream;

use serde::{Deserialize, Serialize};
use std::{
    sync::{Arc, Mutex},
    time::Duration,
};
use tauri::{ipc::Channel, AppHandle, State};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayRequest {
    pub id: String,
    pub catalog_id: Option<String>,
    pub library_id: Option<String>,
    pub developer_token: String,
    pub user_token: String,
    pub duration: f64,
    pub volume: f32,
    pub paused: bool,
}

#[derive(Clone, Copy, Serialize)]
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
}

#[derive(Deserialize)]
#[serde(tag = "action", content = "value", rename_all = "lowercase")]
pub enum Control {
    Pause,
    Resume,
    Seek { position: f64, revision: u64 },
    Volume(f32),
    Stop,
}

#[derive(Default)]
pub struct NativePlayback(Mutex<Option<Arc<player::Session>>>);

#[tauri::command]
pub fn native_playback_play(
    app: AppHandle,
    state: State<'_, NativePlayback>,
    request: PlayRequest,
    events: Channel<PlaybackEvent>,
) -> Result<(), String> {
    if !request.duration.is_finite() || request.duration < 0.0 || !request.volume.is_finite() {
        return Err("Invalid playback duration or volume".into());
    }
    let session = Arc::new(player::Session::new(&request));
    {
        let mut current = state.0.lock().unwrap();
        if let Some(previous) = current.replace(session.clone()) {
            previous.stop();
        }
    }
    let reporting = session.clone();
    std::thread::Builder::new()
        .name("playback-events".into())
        .spawn(move || loop {
            let event = reporting.event();
            let terminal = matches!(event.status, PlaybackStatus::Error);
            if reporting.cancel.is_cancelled() && !terminal {
                break;
            }
            if events.send(event).is_err() {
                reporting.stop();
                break;
            }
            if terminal {
                break;
            }
            std::thread::sleep(Duration::from_millis(250));
        })
        .map_err(|error| error.to_string())?;
    tauri::async_runtime::spawn(async move {
        let prepared = apple::prepare(&app, &request, session.cancel.clone()).await;
        if session.cancel.is_cancelled() {
            return;
        }
        match prepared {
            Ok(prepared) => {
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
) -> Result<(), String> {
    let mut current = state.0.lock().unwrap();
    if let Some(session) = current.as_ref().filter(|session| session.id == id) {
        if matches!(command, Control::Stop) {
            let session = current.take().unwrap();
            session.stop();
        } else {
            session.control(command)?;
        }
    }
    Ok(())
}
