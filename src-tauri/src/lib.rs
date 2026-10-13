mod drm;
mod logging;
mod media;
mod playback;

pub use drm::run_host as run_widevine_host;

use tauri::{webview::PageLoadEvent, AppHandle, Manager};
use tauri_plugin_window_state::StateFlags;

pub fn run() {
    tauri::Builder::default()
        .plugin(logging::plugin())
        /* .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            focus_main_window(app)
        })) */
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_prevent_default::debug())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(playback::NativePlayback::default())
        .on_page_load(|webview, payload| {
            if webview.label() != "main" || payload.event() != PageLoadEvent::Started {
                return;
            }
            webview.state::<playback::NativePlayback>().stop();
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
                .with_filter(|label| !label.starts_with("widget-"))
                .with_state_flags(
                    StateFlags::all() & !StateFlags::VISIBLE & !StateFlags::DECORATIONS,
                )
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            native_open_devtools,
            media::native_media_listen,
            playback::native_playback_play,
            playback::native_playback_control
        ])
        .setup(|app| {
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

#[tauri::command]
fn native_open_devtools(window: tauri::WebviewWindow) {
    window.open_devtools();
}
