use super::audio::Loudness;
use crate::media::NativeMediaMetadata;
use serde::Deserialize;

/// The frontend sends the complete song resource. Serde reads only playback fields.
#[derive(Deserialize)]
pub struct Song {
    id: String,
    #[serde(rename = "type")]
    kind: Kind,
    pub attributes: Attributes,
    #[serde(default)]
    extras: Extras,
}

#[derive(Deserialize)]
enum Kind {
    #[serde(rename = "songs")]
    Catalog,
    #[serde(rename = "library-songs")]
    Library,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Attributes {
    name: String,
    artist_name: Option<String>,
    album_name: Option<String>,
    duration_in_millis: f64,
    artwork: Option<Artwork>,
    pub loudness: Option<Loudness>,
}

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Extras {
    catalog_id: Option<String>,
    library_id: Option<String>,
}

#[derive(Deserialize)]
struct Artwork {
    url: String,
}

impl Song {
    pub fn catalog_id(&self) -> Option<&str> {
        match self.kind {
            Kind::Catalog => Some(&self.id),
            Kind::Library => self.extras.catalog_id.as_deref(),
        }
    }

    pub fn library_id(&self) -> Option<&str> {
        match self.kind {
            Kind::Library => Some(&self.id),
            Kind::Catalog => self.extras.library_id.as_deref(),
        }
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
