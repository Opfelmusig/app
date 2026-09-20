use tauri::{AppHandle, Manager};
use tauri_plugin_log::{RotationStrategy, Target, TargetKind, WEBVIEW_TARGET};
use time::{macros::format_description, OffsetDateTime};

pub fn run() {
    let log_level = if cfg!(debug_assertions) {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Info
    };
    let log_file_name = if cfg!(debug_assertions) {
        "opfelmusig-dev"
    } else {
        "opfelmusig"
    };
    let log_date_format = format_description!("[[[year]-[month]-[day]][[[hour]:[minute]:[second]]");

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log_level)
                .level_for("symphonia_format_isomp4", log::LevelFilter::Warn)
                .level_for("app_lib::widevine", log::LevelFilter::Warn)
                .format(move |out, message, record| {
                    let target = if record.target().starts_with(WEBVIEW_TARGET) {
                        WEBVIEW_TARGET
                    } else {
                        record.target()
                    };

                    out.finish(format_args!(
                        "{}[{}][{}] {}",
                        OffsetDateTime::now_utc()
                            .format(log_date_format)
                            .expect("valid log date format"),
                        target,
                        record.level(),
                        message
                    ))
                })
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir {
                        file_name: Some(log_file_name.to_owned()),
                    }),
                ])
                .max_file_size(2_000_000)
                .rotation_strategy(RotationStrategy::KeepSome(3))
                .build(),
        )
        /* .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            focus_main_window(app)
        })) */
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![native_open_devtools])
        .setup(|app| {
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
