<div align="center">
  <img align="center" width="128px" src="https://github.com/user-attachments/assets/a9ed9c53-84ab-4a65-a7d0-50b42a9552d5" />
  <h1 align="center">Öpfelmusig</h1>

An alternative Apple Music client.  
Öpfelmusig is the literal Swiss German translation of "Apple Music"

### [Download 🍎🎵](https://github.com/opfelmusig/app/releases/latest)

<sub>
macOS: <code>.dmg</code>,
windows: <code>.msi</code>,
linux: whatever you need
</sub>

</div>
<br>

> [!IMPORTANT]
> Independent project, not affiliated with Apple.

## Setup

A valid Apple Music subscription is required.

### Apple Music Token

1. Open https://music.apple.com
2. Open Dev Tools (press `F12` or right-click anywhere on the page and select Inspect).
3. Navigate to the Application tab (or Storage tab depending on your browser).
4. Look at the left sidebar menu, find Cookies, and click on `music.apple.com`.
5. Search or filter the list for the cookie named `media-user-token` or similar.
6. Click on that token and copy the full text shown in the cookie value box at the bottom of the panel.

## Features

- Apple Music playback, catalog search, recommendations and radio stations
- Immersive fullscreen player, animated artwork and always-on-top miniplayer
- Synchronized lyrics with translations and transliterations
- Editable playback queue with shuffle, repeat and saved playback position
- 10-band equalizer and volume normalization
- Library management with favourites, Suggest Less and pins
- Create, edit and organise playlists and folders, including adding, removing and reordering tracks
- Library search, filtering, sorting and customizable columns
- Listening history and Apple Music activity reporting for Recently Played, recommendations and listening data
- Keyboard shortcuts, command palette and Apple Music link sharing
- Discord Rich Presence, native media controls and system-tray support
- Built-in updater

## Restrictions

On macOS, the app is not signed or notarized and may appear damaged. After installing it, run `sudo xattr -rd com.apple.quarantine "/Applications/Öpfelmusig.app"`.

On Windows, if SmartScreen displays a warning, click `More info → Run anyway`.

Also:

- Playback is limited to 256 kbps AAC-LC stereo, without Lossless, Dolby Atmos or Spatial Audio.
- Streaming only; downloads and offline playback are not supported.
- Music videos are unsupported and hidden.
- Requires an Apple Music subscription and a manually copied user token. Expired tokens must be replaced.
- App updates may require granting access to your system's credential store again to retrieve your Apple Music token.
- Features may break when Apple changes its private APIs.
- Linux needs an available, unlocked Secret Service credential store.

## Bug and Feature Reports

Just report them here in this repo as issues. Include the details in `Settings → App & Updates → Technical information`.

## Showcase

Immersive Fullscreen  
<img width="3016" alt="immersive fullscreen" src="https://github.com/user-attachments/assets/b2a9b3bd-0c6b-44b3-bc5b-ebc627b4f867" />

<img width="3016" alt="immersive fullscreen expanded" src="https://github.com/user-attachments/assets/99a5e80a-697a-4f01-a0bb-1069ded42336" />

<img width="3016" alt="immersive fullscreen lyrics" src="https://github.com/user-attachments/assets/741bcb82-c0c4-4466-a5d3-9bca237af5e8" />

Album Page  
<img width="3016" alt="album page" src="https://github.com/user-attachments/assets/0843713a-c77d-4c40-aab7-710b226f9eb3" />

Artist Page  
<img width="3016" alt="artist page" src="https://github.com/user-attachments/assets/3a05358b-45d4-4d22-8007-7a96a26c0e93" />

Search Page  
<img width="3016" alt="search page" src="https://github.com/user-attachments/assets/59a9fc94-cad0-4f59-b743-1c7e2aadf596" />

Home Page  
<img width="3016" alt="home page" src="https://github.com/user-attachments/assets/63446d7a-fb91-4eab-a6be-bb4cbcec21bf" />

Mini Player  
<img width="366" alt="mini player" src="https://github.com/user-attachments/assets/6b2efc57-56ac-4c73-8cc1-546dcecfc78b" />

Immersive Mini Player  
<img width="370" alt="immersive mini player" src="https://github.com/user-attachments/assets/afb2bcfe-cda0-4eb5-b01b-f201ba14b5ea" />

## Development

Install Bun, Node.js LTS, Rust stable and the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your platform. On Linux, also install the ALSA and D-Bus development packages (`libasound2-dev` and `libdbus-1-dev` on Debian/Ubuntu, `alsa-lib` and `dbus` on Arch).

```sh
git clone https://github.com/opfelmusig/app.git
cd app
bun install
bunx tauri dev
```

To create a production build:

```sh
bunx tauri build
```

---

🍎🎵 is brought to you by [Waradu](https://waradu.dev).
Check out my friends at [Epilogue](https://epilogue.team).

Looking for a local first music player? Try out [Vleer](https://vleer.app).

<sub>PS: Apple, please don’t sue me. You weren’t supposed to find this anyway.</sub>
