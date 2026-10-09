import type { ContentRating } from "@opfelmusig/lib/types";

import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong, SongFilterRating } from "#layers/amdata/app/types/songs";

export interface SongFilters {
  personalRating: SongFilterRating[];
  contentRating: ContentRating[];
  inLibrary: boolean;
  isUploaded: boolean;
}

export default function filterSongs(
  songs: AmListResource<AmSong>[],
  filters: SongFilters,
): AmListResource<AmSong>[] {
  return songs
    .filter(
      (song) =>
        filters.inLibrary === false ||
        song.resource.type === "library-songs" ||
        song.resource.extras.libraryId,
    )
    .filter(
      (song) =>
        filters.isUploaded === false ||
        (song.resource.type === "library-songs" && !song.resource.extras.catalogId),
    )
    .filter(
      (song) =>
        filters.personalRating.length === 0 ||
        filters.personalRating
          .map((rating) => parseInt(rating))
          .includes(song.resource.attributes.personalRating ?? 0),
    )
    .filter(
      (song) =>
        filters.contentRating.length === 0 ||
        filters.contentRating.includes(song.resource.attributes.contentRating ?? "clean"),
    );
}
