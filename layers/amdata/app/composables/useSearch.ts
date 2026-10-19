import { useFuse } from "@vueuse/integrations/useFuse";
import type { FuseOptionKey } from "fuse.js";

export default function useSearch<T>(
  items: MaybeRefOrGetter<T[] | undefined>,
  search: MaybeRefOrGetter<string>,
  keys: FuseOptionKey<T>[] = [],
) {
  const { results } = useFuse(
    () => toValue(search).trim(),
    () => toValue(items) ?? [],
    {
      matchAllWhenSearchEmpty: true,
      fuseOptions: {
        keys,
        threshold: 0.4,
      },
    },
  );

  return computed(() => results.value.map((result) => result.item));
}
