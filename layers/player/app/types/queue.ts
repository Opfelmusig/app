import type { AmAlbum } from "#layers/amdata/app/types/albums";
import type { AmPlaylist } from "#layers/amdata/app/types/playlists";
import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong } from "#layers/amdata/app/types/songs";

export type QueueTrack = AmListResource<AmSong>;

export type QueueContext = AmAlbum | AmPlaylist | string; // stations

export interface CreateQueue {
  tracks: QueueTrack[];
  index: number;
}

export interface CreateQueueContext extends CreateQueue {
  context: QueueContext;
}

export interface QueueEntry {
  id: string;
  position: number;
  entry: QueueTrack;
}
