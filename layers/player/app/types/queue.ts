export type QueueTrack = AmListResource<AmSong>;

export interface GenericQueueContext {
  type: "generic";
  name: string;
  link?: string;
}
export type QueueContext = AmAlbum | AmPlaylist | AmCatalogStation | GenericQueueContext;

export interface CreateQueueContext {
  tracks: QueueTrack[];
  index: number;
  context: QueueContext;
}

export interface QueueEntry {
  id: string;
  fromContext: boolean;
  position: number;
  entry: QueueTrack;
}
