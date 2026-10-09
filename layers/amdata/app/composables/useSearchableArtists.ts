import { useFuse } from "@vueuse/integrations/useFuse";

import type { AmArtist } from "#layers/amdata/app/types/artists";
import type { AmListResource } from "#layers/amdata/app/types/resources";

export default function useSearchableArtists(
  artists: MaybeRefOrGetter<AmListResource<AmArtist>[] | undefined>,
  search: MaybeRefOrGetter<string>,
) {
  const { results } = useFuse(search, () => toValue(artists) ?? [], {
    matchAllWhenSearchEmpty: true,
    fuseOptions: {
      keys: ["resource.attributes.name"],
      threshold: 0.4,
    },
  });

  return computed(() => results.value.map((artist) => artist.item));
}
