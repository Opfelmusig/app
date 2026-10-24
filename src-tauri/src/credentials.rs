use std::sync::Mutex;

use keyring::{Entry, Error};
use tauri::{Manager, WebviewWindow};

const TOKEN_KEY: &str = "apple-music:user-token";
static CREDENTIAL_LOCK: Mutex<()> = Mutex::new(());

fn storage_error(error: Error) -> String {
    match error {
        Error::NoStorageAccess(_) => {
            "The credential store is locked or access was denied. Unlock it and try again."
        }
        Error::NoDefaultStore => {
            "The OS credential store is unavailable. On Linux, start a Secret Service provider, then restart the app."
        }
        Error::TooLong(_, _) => "The user token is too long for the OS credential store.",
        _ => "Could not access the OS credential store. Please try again.",
    }
    .to_owned()
}

async fn with_entry<T: Send + 'static>(
    window: WebviewWindow,
    action: impl FnOnce(Entry) -> keyring::Result<T> + Send + 'static,
) -> Result<T, String> {
    if window.label() != "main" {
        return Err("Credentials can only be accessed from the main window.".to_owned());
    }

    let service = window.app_handle().config().identifier.clone();

    tauri::async_runtime::spawn_blocking(move || {
        let _guard = CREDENTIAL_LOCK.lock().map_err(|_| {
            "The credential store is unavailable. Please restart the app.".to_owned()
        })?;
        let entry = Entry::new(&service, TOKEN_KEY).map_err(storage_error)?;
        action(entry).map_err(storage_error)
    })
    .await
    .map_err(|_| "The credential operation failed. Please try again.".to_owned())?
}

#[tauri::command]
pub async fn native_auth_get_token(window: WebviewWindow) -> Result<Option<String>, String> {
    with_entry(window, read_token).await
}

fn read_token(entry: Entry) -> keyring::Result<Option<String>> {
    match entry.get_password() {
        Ok(token) => Ok(Some(token)),
        Err(Error::NoEntry) => Ok(None),
        Err(error) => Err(error),
    }
}

#[tauri::command]
pub async fn native_auth_set_token(window: WebviewWindow, token: String) -> Result<(), String> {
    if token.trim().is_empty() {
        return Err("Please provide a user token.".to_owned());
    }

    with_entry(window, move |entry| entry.set_password(&token)).await
}

#[tauri::command]
pub async fn native_auth_delete_token(window: WebviewWindow) -> Result<(), String> {
    with_entry(window, delete_token).await
}

fn delete_token(entry: Entry) -> keyring::Result<()> {
    match entry.delete_credential() {
        Ok(()) | Err(Error::NoEntry) => Ok(()),
        Err(error) => Err(error),
    }
}
