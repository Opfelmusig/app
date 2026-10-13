use discord_rich_presence::{
    activity::{Activity, ActivityType, Assets, Button, StatusDisplayType, Timestamps},
    DiscordIpc, DiscordIpcClient,
};
use serde::Deserialize;
use std::{
    sync::mpsc::{self, Receiver, RecvTimeoutError, Sender},
    thread,
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, State};

const RETRY_INTERVAL: Duration = Duration::from_secs(15);
const LOGO_ASSET_KEY: &str = "opfelmusig";
const DOWNLOAD_URL: &str = "https://github.com/opfelmusig/downloads/releases/latest";

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiscordPresence {
    title: String,
    song_url: Option<String>,
    artist: String,
    artist_url: Option<String>,
    album: Option<String>,
    artwork_url: Option<String>,
    position: f64,
    duration: f64,
    #[serde(skip)]
    app_version: String,
}

enum PresenceCommand {
    Set {
        application_id: String,
        presence: DiscordPresence,
    },
    Clear,
}

pub struct NativeDiscordPresence {
    commands: Sender<PresenceCommand>,
}

impl NativeDiscordPresence {
    pub fn new() -> Self {
        let (commands, receiver) = mpsc::channel();

        thread::Builder::new()
            .name("discord-presence".to_string())
            .spawn(move || run_worker(receiver))
            .expect("could not start Discord presence worker");

        Self { commands }
    }

    pub fn clear(&self) {
        let _ = self.commands.send(PresenceCommand::Clear);
    }
}

fn run_worker(receiver: Receiver<PresenceCommand>) {
    let mut desired: Option<(String, DiscordPresence, Instant)> = None;
    let mut client: Option<(String, DiscordIpcClient)> = None;

    loop {
        let command = if desired.is_some() {
            match receiver.recv_timeout(RETRY_INTERVAL) {
                Ok(command) => Some(command),
                Err(RecvTimeoutError::Timeout) => None,
                Err(RecvTimeoutError::Disconnected) => break,
            }
        } else {
            match receiver.recv() {
                Ok(command) => Some(command),
                Err(_) => break,
            }
        };

        match command {
            Some(PresenceCommand::Set {
                application_id,
                presence,
            }) => desired = Some((application_id, presence, Instant::now())),
            Some(PresenceCommand::Clear) => {
                desired = None;
                clear_client(&mut client);
                continue;
            }
            None => {}
        }

        let Some((application_id, presence, observed_at)) = desired.as_ref() else {
            continue;
        };

        if let Err(cause) =
            update_client(&mut client, application_id, presence, observed_at.elapsed())
        {
            log::debug!("Could not update Discord presence: {cause}");
            close_client(&mut client);
        }
    }

    clear_client(&mut client);
}

fn update_client(
    client: &mut Option<(String, DiscordIpcClient)>,
    application_id: &str,
    presence: &DiscordPresence,
    elapsed: Duration,
) -> Result<(), discord_rich_presence::error::Error> {
    if client
        .as_ref()
        .is_some_and(|(connected_id, _)| connected_id != application_id)
    {
        clear_client(client);
    }

    if client.is_none() {
        let mut next_client = DiscordIpcClient::new(application_id);
        next_client.connect()?;
        *client = Some((application_id.to_string(), next_client));
    }

    let mut assets = Assets::new()
        .small_image(LOGO_ASSET_KEY)
        .small_text(format!("Öpfelmusig v{}", presence.app_version));

    if let Some(artwork_url) = presence.artwork_url.as_deref() {
        assets = assets.large_image(artwork_url);
    }

    let artist_album = match presence.album.as_deref().filter(|album| !album.is_empty()) {
        Some(album) => format!("{} · {album}", presence.artist),
        None => presence.artist.clone(),
    };

    let mut activity = Activity::new()
        .activity_type(ActivityType::Listening)
        .status_display_type(StatusDisplayType::Details)
        .details(&presence.title)
        .state(artist_album)
        .assets(assets)
        .buttons(vec![Button::new("Download Öpfelmusig", DOWNLOAD_URL)]);

    if let Some(song_url) = presence.song_url.as_deref() {
        activity = activity.details_url(song_url);
    }
    if let Some(artist_url) = presence.artist_url.as_deref() {
        activity = activity.state_url(artist_url);
    }

    if presence.duration.is_finite() && presence.duration > 0.0 {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;
        let position = (presence.position + elapsed.as_secs_f64())
            .clamp(0.0, presence.duration)
            .round() as i64;
        let start = now - position;
        let end = start + presence.duration.round() as i64;

        activity = activity.timestamps(Timestamps::new().start(start).end(end));
    }

    if let Some((_, client)) = client.as_mut() {
        client.set_activity(activity)?;
    }

    Ok(())
}

fn clear_client(client: &mut Option<(String, DiscordIpcClient)>) {
    if let Some((_, client)) = client.as_mut() {
        let _ = client.clear_activity();
    }

    close_client(client);
}

fn close_client(client: &mut Option<(String, DiscordIpcClient)>) {
    if let Some((_, mut client)) = client.take() {
        let _ = client.close();
    }
}

#[tauri::command]
pub fn native_discord_set_presence(
    application_id: String,
    presence: Option<DiscordPresence>,
    discord: State<'_, NativeDiscordPresence>,
    app: AppHandle,
) -> Result<(), String> {
    let command = match presence {
        Some(mut presence) => {
            if application_id.trim().is_empty() {
                return Err("Discord application ID is not configured.".to_string());
            }

            presence.app_version = app.package_info().version.to_string();

            PresenceCommand::Set {
                application_id,
                presence,
            }
        }
        None => PresenceCommand::Clear,
    };

    discord
        .commands
        .send(command)
        .map_err(|_| "Discord presence worker is unavailable.".to_string())
}
