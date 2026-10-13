use tauri::AppHandle;
use tauri_plugin_deep_link::DeepLinkExt;

pub fn setup(app: &AppHandle) -> tauri_plugin_deep_link::Result<()> {
    #[cfg(any(target_os = "linux", all(target_os = "windows", debug_assertions)))]
    app.deep_link().register_all()?;

    let handle = app.clone();
    app.deep_link().on_open_url(move |event| {
        if event.urls().iter().any(|url| url.scheme() == "opfelmusig") {
            crate::focus_main_window(&handle);
        }
    });

    Ok(())
}
