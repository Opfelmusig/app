import { useFuse } from "@vueuse/integrations/useFuse";

import type { AmAlbum } from "#layers/amdata/app/types/albums";
import type { AmListResource } from "#layers/amdata/app/types/resources";

export default function useSearchableAlbums(
  albums: MaybeRefOrGetter<AmListResource<AmAlbum>[] | undefined>,
  search: MaybeRefOrGetter<string>,
) {
  const { results } = useFuse(search, () => toValue(albums) ?? [], {
    matchAllWhenSearchEmpty: true,
    fuseOptions: {
      keys: [
        { name: "resource.attributes.name", weight: 0.7 },
        { name: "resource.attributes.artistName", weight: 0.3 },
      ],
      threshold: 0.4,
    },
  });

  return computed(() => results.value.map((album) => album.item));
}
