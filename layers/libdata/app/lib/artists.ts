export interface LibraryArtistGroup extends AmLibraryArtist {
  libraryIds: string[];
  names: string[];
}

export function groupLibraryArtists(
  artists: AmLibraryArtist[],
  groupByCatalogId: boolean,
): LibraryArtistGroup[] {
  const groups = new Map<string, LibraryArtistGroup>();

  for (const artist of artists) {
    const key =
      groupByCatalogId && artist.extras.catalogId
        ? `catalog:${artist.extras.catalogId}`
        : `library:${artist.id}`;
    const group = groups.get(key);

    if (group) {
      group.libraryIds.push(artist.id);
      group.names.push(artist.attributes.name);
    } else {
      groups.set(key, {
        ...artist,
        libraryIds: [artist.id],
        names: [artist.attributes.name],
      });
    }
  }

  return [...groups.values()];
}
