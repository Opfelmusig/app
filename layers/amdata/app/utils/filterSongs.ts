import type { ContentRating } from "@opfelmusig/lib/types";

import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong, SongFilterRating } from "#layers/amdata/app/types/songs";

export default function filterSongs(
  songs: AmListResource<AmSong>[],
  personalRating: SongFilterRating[],
  contentRating: ContentRating[],
  inLibrary: boolean,
): AmListResource<AmSong>[] {
  return songs
    .filter(
      (song) =>
        inLibrary === false ||
        song.resource.type === "library-songs" ||
        song.resource.extras.libraryId,
    )
    .filter(
      (song) =>
        personalRating.length === 0 ||
        personalRating
          .map((rating) => parseInt(rating))
          .includes(song.resource.attributes.personalRating ?? 0),
    )
    .filter(
      (song) =>
        contentRating.length === 0 ||
        contentRating.includes(song.resource.attributes.contentRating ?? "clean"),
    );
}
