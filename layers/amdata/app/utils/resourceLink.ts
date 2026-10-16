export function resourceLink(resource?: AmResource | null) {
  if (!resource) return;

  switch (resource.type) {
    case "stations":
      return;
    case "songs":
      if (!resource.attributes.albums[0]?.id) return;
      return rawResourceLink("albums", resource.attributes.albums[0].id, resource.id);
    case "library-songs":
      if (!resource.extras.albumId) return;
      return rawResourceLink("library-albums", resource.extras.albumId, resource.id);
    case "social-profiles":
      return rawResourceLink("social-profiles", resource.attributes.handle);
    default:
      return rawResourceLink(resource.type, resource.id);
  }
}

export function resourceRelationLink(
  resource?: AmLibrarySong | AmAlbum | AmArtist | AmPlaylist | null,
) {
  if (!resource) return;

  switch (resource.type) {
    case "library-songs":
      if (!resource.attributes.albums[0]?.id || !resource.extras.catalogId) return;
      return rawResourceLink("albums", resource.attributes.albums[0].id, resource.extras.catalogId);
    case "library-albums":
      return rawResourceLink("albums", resource.extras.catalogId);
    case "library-artists":
      return rawResourceLink("artists", resource.extras.catalogId);
    case "library-playlists":
      return rawResourceLink("playlists", resource.extras.catalogId);
    case "albums":
      return rawResourceLink("albums", resource.extras.libraryId);
    case "artists":
      return rawResourceLink("artists", resource.extras.libraryId);
    case "playlists":
      return rawResourceLink("playlists", resource.extras.libraryId);
  }
}

export function songAlbumLink(song: AmSong) {
  const catalogAlbumId = song.attributes.albums[0]?.id;
  const catalogSongId = song.type === "songs" ? song.id : song.extras.catalogId;

  if (catalogAlbumId) return rawResourceLink("albums", catalogAlbumId, catalogSongId);
  if (song.type === "library-songs") {
    return rawResourceLink("library-albums", song.extras.albumId, song.id);
  }
}

export function songArtistLinks(song: AmSong) {
  const catalogArtists = song.attributes.artists;
  if (catalogArtists.length) {
    return catalogArtists.map((artist) => ({
      label: artist.name,
      to: rawResourceLink("artists", artist.id),
    }));
  }

  if (song.type === "library-songs" && song.extras.artistId) {
    return [
      {
        label: song.attributes.artistName ?? "Artist",
        to: rawResourceLink("library-artists", song.extras.artistId),
      },
    ];
  }

  return [];
}

export function rawResourceLink(type?: AmResource["type"], id?: string, songId?: string) {
  if (!type || !id) return;

  return songId ? `/resources/${type}/${id}?song_id=${songId}` : `/resources/${type}/${id}`;
}
