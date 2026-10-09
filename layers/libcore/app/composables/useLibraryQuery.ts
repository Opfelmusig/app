import type { UseQueryOptions, UseQueryReturn } from "@pinia/colada";

type LibraryQueryOptions<T> = Pick<UseQueryOptions<T>, "key" | "query"> & {
  enabled?: MaybeRefOrGetter<boolean | string | null | undefined>;
};

export default function useLibraryQuery<T>(options: LibraryQueryOptions<T>): UseQueryReturn<T> {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", ...toValue(options.key)],
    query: options.query,
    enabled: () =>
      library.state.ready && (options.enabled === undefined || !!toValue(options.enabled)),
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
