use std::sync::atomic::{AtomicBool, Ordering};

use tauri::{
    menu::MenuBuilder, tray::TrayIconBuilder, AppHandle, Manager, State, Window, WindowEvent,
};
use tauri_plugin_opener::OpenerExt;

use crate::media::{NativeMediaEvent, NativeMediaSession};

pub struct TrayState {
    minimize_to_tray: AtomicBool,
}

impl Default for TrayState {
    fn default() -> Self {
        Self {
            minimize_to_tray: AtomicBool::new(true),
        }
    }
}

#[tauri::command]
pub fn native_set_minimize_to_tray(enabled: bool, state: State<TrayState>) {
    state.minimize_to_tray.store(enabled, Ordering::Relaxed);
}

pub fn handle_window_event(window: &Window, event: &WindowEvent) {
    if window.label() != "main" {
        return;
    }

    if let WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
        if window
            .state::<TrayState>()
            .minimize_to_tray
            .load(Ordering::Relaxed)
        {
            if let Err(cause) = window.hide() {
                log::error!("Could not minimize to tray: {cause}");
            }
        } else {
            window.app_handle().exit(0);
        }
    }
}

pub fn setup(app: &AppHandle) -> tauri::Result<()> {
    let menu = MenuBuilder::new(app)
        .text("tray-open", "Open Öpfelmusig")
        .separator()
        .text("tray-play", "Toggle Playback")
        .text("tray-previous", "Previous Track")
        .text("tray-next", "Next Track")
        .separator()
        .text("tray-logs", "Open Log Folder")
        .text("tray-devtools", "Open DevTools")
        .separator()
        .text("tray-quit", "Quit Öpfelmusig")
        .build()?;

    let mut tray = TrayIconBuilder::with_id("main-tray")
        .menu(&menu)
        .tooltip("Öpfelmusig")
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "tray-open" => crate::focus_main_window(app),
            "tray-previous" => dispatch_playback(app, NativeMediaEvent::Previous),
            "tray-play" => dispatch_playback(app, NativeMediaEvent::Toggle),
            "tray-next" => dispatch_playback(app, NativeMediaEvent::Next),
            "tray-devtools" => {
                crate::focus_main_window(app);
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }
            "tray-logs" => {
                if let Err(cause) = open_log_folder(app) {
                    log::error!("Could not open log folder: {cause}");
                }
            }
            "tray-quit" => app.exit(0),
            _ => {}
        });

    #[cfg(target_os = "macos")]
    {
        let icon = tauri::image::Image::from_bytes(include_bytes!("../../public/note.png"))?;
        tray = tray.icon(icon).icon_as_template(true);
    }

    #[cfg(not(target_os = "macos"))]
    if let Some(icon) = app.default_window_icon() {
        tray = tray.icon(icon.clone());
    }

    tray.build(app)?;
    Ok(())
}

fn dispatch_playback(app: &AppHandle, event: NativeMediaEvent) {
    if let Err(cause) = app.state::<NativeMediaSession>().dispatch(event) {
        log::error!("Could not dispatch tray playback action: {cause}");
    }
}

fn open_log_folder(app: &AppHandle) -> anyhow::Result<()> {
    let path = app.path().app_log_dir()?;
    std::fs::create_dir_all(&path)?;
    app.opener()
        .open_path(path.to_string_lossy(), None::<&str>)?;
    Ok(())
}
