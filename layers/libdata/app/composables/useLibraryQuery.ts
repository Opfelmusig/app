import type { UseQueryOptions, UseQueryReturn } from "@pinia/colada";

type LibraryQueryOptions<T> = Pick<UseQueryOptions<T>, "key" | "query"> & {
  enabled?: MaybeRefOrGetter<boolean | string | null | undefined>;
  staleTime: number;
  gcTime?: number;
};

export default function useLibraryQuery<T>(options: LibraryQueryOptions<T>): UseQueryReturn<T> {
  return useQuery(useLibraryQueryOptions(options));
}

export function useLibraryQueryOptions<T>(options: LibraryQueryOptions<T>): UseQueryOptions<T> {
  const { profile, storefront, valid } = useAuth();
  const settings = useSettingsStore();

  return {
    key: () => [
      "libdata",
      ...toValue(options.key),
      profile.value?.id ?? null,
      storefront.value?.id ?? null,
      settings.language ?? null,
    ],
    query: options.query,
    enabled: () =>
      valid.value &&
      !!storefront.value?.id &&
      (options.enabled === undefined || !!toValue(options.enabled)),
    staleTime: options.staleTime,
    gcTime: options.gcTime ?? false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    autoRefetch: true,
  };
}
