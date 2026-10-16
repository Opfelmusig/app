const appleMusicPaths = {
  songs: "song",
  albums: "album",
  artists: "artist",
  playlists: "playlist",
  stations: "station",
} as const;

export function rawAppleMusicLink(
  type: keyof typeof appleMusicPaths,
  id?: string,
  storefront?: string,
) {
  if (!id || !storefront) return;

  return `https://music.apple.com/${storefront}/${appleMusicPaths[type]}/${id}`;
}

export function appleMusicLink(resource: AmResource, storefront?: string) {
  switch (resource.type) {
    case "songs":
    case "albums":
    case "artists":
    case "playlists":
    case "stations":
      return rawAppleMusicLink(resource.type, resource.id, storefront);
    case "library-songs":
      return rawAppleMusicLink("songs", resource.extras.catalogId, storefront);
    case "library-albums":
      return rawAppleMusicLink("albums", resource.extras.catalogId, storefront);
    case "library-artists":
      return rawAppleMusicLink("artists", resource.extras.catalogId, storefront);
    case "library-playlists":
      return rawAppleMusicLink("playlists", resource.extras.catalogId, storefront);
    case "social-profiles":
      if (!resource.attributes.handle) return;
      return `https://music.apple.com/profile/${resource.attributes.handle}`;
    case "library-playlist-folders":
      return;
  }
}
