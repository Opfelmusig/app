mod deep_link;
mod discord;
mod drm;
mod logging;
mod media;
mod playback;
mod tray;

pub use drm::run_host as run_widevine_host;

use tauri::{webview::PageLoadEvent, AppHandle, Manager};
use tauri_plugin_window_state::StateFlags;

pub fn run() {
    tauri::Builder::default()
        /* .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            focus_main_window(app)
        })) */
        .plugin(logging::plugin())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_prevent_default::debug())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(playback::NativePlayback::default())
        .manage(discord::NativeDiscordPresence::new())
        .manage(tray::TrayState::default())
        .on_window_event(tray::handle_window_event)
        .on_page_load(|webview, payload| {
            if webview.label() != "main" || payload.event() != PageLoadEvent::Started {
                return;
            }
            webview.state::<playback::NativePlayback>().stop();
            webview.state::<discord::NativeDiscordPresence>().clear();
            if let Some(media) = webview.try_state::<media::NativeMediaSession>() {
                if let Err(cause) = media::reset(&media) {
                    log::warn!("Could not reset system media controls on page load: {cause}");
                }
            }
        })
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_process::init())
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_filter(|label| label == "main")
                .with_state_flags(
                    StateFlags::all() & !StateFlags::VISIBLE & !StateFlags::DECORATIONS,
                )
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            tray::native_set_minimize_to_tray,
            discord::native_discord_set_presence,
            media::native_media_listen,
            media::native_media_set_play_modes,
            playback::native_playback_play,
            playback::native_playback_control
        ])
        .setup(|app| {
            deep_link::setup(app.handle())?;
            app.manage(media::NativeMediaSession::new(app.handle()));
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("could not resolve app data path");
            let app_local_data_dir = app
                .path()
                .app_local_data_dir()
                .expect("could not resolve app local data path");

            std::fs::create_dir_all(app_data_dir)?;
            std::fs::create_dir_all(&app_local_data_dir)?;

            let salt_path = app_local_data_dir.join("salt.txt");

            app.handle()
                .plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;

            tray::setup(app.handle())?;
            focus_main_window(app.handle());
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building Tauri application")
        .run(|_app, _event| {
            #[cfg(target_os = "macos")]
            if matches!(_event, tauri::RunEvent::Reopen { .. }) {
                focus_main_window(_app);
            }
        });
}

pub fn focus_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}
