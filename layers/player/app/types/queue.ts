export type QueueTrack = AmListResource<AmSong>;

export type QueueContext = AmAlbum | AmPlaylist | AmCatalogStation | string;

export interface CreateQueueContext {
  tracks: QueueTrack[];
  index: number;
  context: QueueContext;
}

export interface QueueEntry {
  id: string;
  position: number;
  entry: QueueTrack;
}
