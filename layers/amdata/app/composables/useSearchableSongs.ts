import { useFuse } from "@vueuse/integrations/useFuse";

import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong } from "#layers/amdata/app/types/songs";

export default function useSearchableSongs(
  songs: MaybeRefOrGetter<AmListResource<AmSong>[] | undefined>,
  search: MaybeRefOrGetter<string>,
) {
  const { results } = useFuse(search, () => toValue(songs) ?? [], {
    matchAllWhenSearchEmpty: true,
    fuseOptions: {
      keys: [
        { name: "resource.attributes.name", weight: 0.6 },
        { name: "resource.attributes.artistName", weight: 0.25 },
        { name: "resource.attributes.albumName", weight: 0.15 },
      ],
      threshold: 0.4,
    },
  });

  return computed(() => results.value.map((song) => song.item));
}
