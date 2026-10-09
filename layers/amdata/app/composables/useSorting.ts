import type { SortingDirection } from "#layers/amdata/app/lib/sorting";

export default function useSorting<T extends string>(
  id: MaybeRefOrGetter<string>,
  defaultSort: T,
  persistent = true,
) {
  const sortBy = usePersistableStorage<T>(
    () => `opfelmusig:list:${toValue(id)}:sort`,
    defaultSort,
    persistent,
  );

  const direction = usePersistableStorage<SortingDirection>(
    () => `opfelmusig:list:${toValue(id)}:direction`,
    "asc",
    persistent,
  );

  const sortChanged = computed(() => sortBy.value !== defaultSort || direction.value !== "asc");

  function reset() {
    sortBy.value = defaultSort;
    direction.value = "asc";
  }

  return { sortBy, direction, sortChanged, reset };
}
