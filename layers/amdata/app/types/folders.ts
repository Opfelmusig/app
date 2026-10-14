export interface AmLibraryPlaylistFolder extends AmResourceBase {
  type: "library-playlist-folders";
  attributes: {
    name: string;
    dateAdded?: Date;
  };

  extras: {
    parentId: string;
  };
}

export interface AmLibraryTreePlaylist {
  type: "library-playlists";
  item: AmLibraryPlaylist;
}

export interface AmLibraryTreePlaylistFolder {
  type: "library-playlist-folders";
  item: AmLibraryPlaylistFolder;
  children: AmLibraryTreeNode[];
}

export type AmLibraryTreeNode = AmLibraryTreePlaylist | AmLibraryTreePlaylistFolder;
