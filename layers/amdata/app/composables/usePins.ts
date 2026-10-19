import { isDefined } from "remeda";

import { fetchLibraryPins } from "#layers/amdata/app/lib/queries/pins";

export default function usePins() {
  const query = useAmQuery({
    scope: "library",
    key: () => ["pins"],
    query: () => fetchLibraryPins(),
    staleTime: ms("5m"),
    gcTime: false,
  });

  const pinnedIds = computed(
    () =>
      new Set(
        (query.data.value ?? [])
          .flatMap(({ resource }) => [resource.id, resource.extras.catalogId])
          .filter(isDefined),
      ),
  );

  return { ...query, pinnedIds };
}
