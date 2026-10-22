<div align="center">
  <img align="center" width="128px" src="https://github.com/user-attachments/assets/a9ed9c53-84ab-4a65-a7d0-50b42a9552d5" />
  <h1 align="center">Öpfelmusig</h1>

An alternative Apple Music client.  
Öpfelmusig is the literal Swiss German translation of "Apple Music"

</div>
<br>

### Download

[Latest Version](https://github.com/opfelmusig/app/releases/latest)

On macOS, the app is not signed or notarized and may appear damaged. After installing it, run `sudo xattr -rd com.apple.quarantine "/Applications/Öpfelmusig.app"`.

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

- Apple Music Playback
- Browse Apple Music Catalog
- Albums, artists, playlists, history, and recommendations
- Synchronized lyrics with translations and transliterations
- Animated Artworks
- Library management
  - Add and remove songs and albums
  - Favorite, unfavorite, or mark items as Suggest Less
  - Pin and unpin songs, albums, artists, and playlists
  - Create, edit, move, and delete playlists
  - Add, remove, and reorder playlist tracks
  - Create playlist folders and organize playlists inside them
- Reports playback activity to Apple Music so Recently Played, recommendations, stats.fm, and Apple Music data exports continue to work
- Immersive player and animated artwork
- Miniplayer
- Equalizer
- Discord Rich Presence
- Native media controls and system-tray support
- Updater

## Restrictions

- Music videos are not supported and are intentionally hidden.
- No Lossless, Dolby Atmos, or Spatial Audio. Playback is limited to 256 kbps AAC-LC stereo.
- Apple Music tokens can expire, requiring you to sign in again.
- Features may stop working when Apple changes its private APIs.
- First launch and initial synchronization may take a while, particularly on Linux.

## Feature Ideas

Features that may be added in the future based on interest or whenever I feel like it.

- Control playback from a phone on the same local network
- Apple Music Autoplay
- Themes (color or design)
- Crossfade
- Last.fm
- Statistics
- Library Backup (export/import)
- Apple Music login instead of token based authentication
- Volume normalization
- Command pallete

## Bug and Feature Reports

Just report them here in this repo as issues. Include the details in Settings > Info.

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
