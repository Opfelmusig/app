// Prevents an additional console window on Windows in release builds. Do not remove this attribute.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    if app_lib::run_widevine_host() {
        return;
    }
    app_lib::run();
}
