use tauri::Runtime;
use tauri_plugin_log::{RotationStrategy, Target, TargetKind, WEBVIEW_TARGET};
use time::{macros::format_description, OffsetDateTime};

pub fn plugin<R: Runtime>() -> tauri::plugin::TauriPlugin<R> {
    let level = if cfg!(debug_assertions) {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Info
    };
    let file_name = if cfg!(debug_assertions) {
        "opfelmusig-dev"
    } else {
        "opfelmusig"
    };
    let date_format = format_description!("[[[year]-[month]-[day]][[[hour]:[minute]:[second]]");

    tauri_plugin_log::Builder::new()
        .level(level)
        .level_for("reqwest", log::LevelFilter::Info)
        .filter(|metadata| {
            !metadata.target().starts_with("symphonia") || metadata.level() <= log::Level::Warn
        })
        .level_for("app_lib", log::LevelFilter::Info)
        .level_for("app_lib::widevine", log::LevelFilter::Warn)
        .level_for(
            "tao::platform_impl::platform::event_loop::runner",
            log::LevelFilter::Info,
        )
        .format(move |out, message, record| {
            let target = if record.target().starts_with(WEBVIEW_TARGET) {
                WEBVIEW_TARGET
            } else {
                record.target()
            };

            out.finish(format_args!(
                "{}[{}][{}] {}",
                OffsetDateTime::now_utc()
                    .format(date_format)
                    .expect("valid log date format"),
                target,
                record.level(),
                message
            ))
        })
        .targets([
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::LogDir {
                file_name: Some(file_name.to_owned()),
            }),
        ])
        .max_file_size(2_000_000)
        .rotation_strategy(RotationStrategy::KeepSome(3))
        .build()
}
