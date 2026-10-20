import { isDefined } from "remeda";

import { fetchLibraryPins } from "#layers/libdata/app/lib/queries/pins";

export default function usePins() {
  const query = useLibraryQuery({
    key: () => ["pins"],
    query: () => fetchLibraryPins(),
    staleTime: ms("6h"),
  });

  const pinnedIds = computed(
    () =>
      new Set(
        (query.data.value ?? [])
          .flatMap((resource) => [resource.id, resource.extras.catalogId])
          .filter(isDefined),
      ),
  );

  return { ...query, pinnedIds };
}
