export interface GenericQueueContext {
  type: "generic";
  name: string;
  link?: string;
}
export type QueueContext = AmAlbum | AmPlaylist | AmCatalogStation | GenericQueueContext;

export interface CreateQueueContext {
  tracks: AmSong[];
  index: number;
  context: QueueContext;
}

export interface QueueEntry {
  id: string;
  fromContext: boolean;
  entry: AmSong;
}
