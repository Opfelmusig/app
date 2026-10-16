use super::audio::Loudness;
use crate::media::NativeMediaMetadata;
use anyhow::{ensure, Context, Result};
use serde::Deserialize;

/// The frontend sends the complete song resource. Serde reads only playback fields.
#[derive(Deserialize)]
pub struct Song {
    pub attributes: Attributes,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Attributes {
    name: String,
    artist_name: Option<String>,
    album_name: Option<String>,
    duration_in_millis: f64,
    play_params: Option<PlayParameters>,
    artwork: Option<Artwork>,
    pub loudness: Option<Loudness>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayParameters {
    id: String,
    kind: String,
    #[serde(default)]
    pub is_library: bool,
    catalog_id: Option<String>,
    pub reporting: Option<bool>,
}

#[derive(Deserialize)]
struct Artwork {
    url: String,
}

impl PlayParameters {
    pub fn catalog_id(&self) -> Option<&str> {
        if self.is_library {
            self.catalog_id.as_deref()
        } else {
            Some(&self.id)
        }
    }

    pub fn library_id(&self) -> Option<&str> {
        self.is_library.then_some(self.id.as_str())
    }
}

impl Song {
    pub fn play_params(&self) -> Result<&PlayParameters> {
        let params = self
            .attributes
            .play_params
            .as_ref()
            .context("This song is not available to play")?;
        ensure!(
            params.kind == "song",
            "This resource is not a playable song"
        );
        ensure!(!params.id.is_empty(), "A playback song ID is required");
        Ok(params)
    }

    pub fn duration(&self) -> f64 {
        self.attributes.duration_in_millis / 1000.0
    }

    pub fn metadata(&self) -> NativeMediaMetadata {
        NativeMediaMetadata {
            title: self.attributes.name.clone(),
            artist: self.attributes.artist_name.clone(),
            album: self.attributes.album_name.clone(),
            cover_url: self.attributes.artwork.as_ref().map(|artwork| {
                artwork
                    .url
                    .replace("{w}", "512")
                    .replace("{h}", "512")
                    .replace("{c}", "")
                    .replace("{f}", "jpg")
            }),
        }
    }
}
