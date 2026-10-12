The desktop CDM is loaded in the app executable's `--widevine-host` mode, before
Tauri starts. It communicates through framed stdin/stdout messages. Google device
credentials and content keys remain inside the proprietary module.

Discovery checks `OPFELMUSIG_WIDEVINE_CDM`, our installed component, then known
Chromium browser locations. If no module exists, native dialogs request permission
to download Google's component and display its bundled terms before installation.
The component is not shipped with the application.

`shim/shim.cc` is the MIT-licensed CDM host bridge from Sonora commit
`8c382f175308021d85e0c25ef74bb2c174ec396e`, derived from
https://github.com/Kopuz-org/cdm-host. Its licence is in `shim/LICENSE`.
The Chromium ABI headers have their BSD licence in `shim/cdm/LICENSE`.
The surrounding Rust implementation is independent and uses the app's MIT licence.

The macOS signing entitlement permits loading Google's CDM with its different signing
identity. The helper runs the same executable as the app, without starting Tauri.

Playback is basic AAC CENC streaming with pause, volume and fragment-based seeking.
Seeking beyond downloaded fragments waits for their arrival. Tracks remain in memory,
up to 256 MiB per track; skipping/stop cancels the download and releases the host.
There is no preload, equalizer, loudness normalisation or protected media export.
