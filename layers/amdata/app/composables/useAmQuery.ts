import type { UseQueryOptions, UseQueryReturn } from "@pinia/colada";

type QueryScope = "catalog" | "library";

type AmQueryOptions<T> = Pick<UseQueryOptions<T>, "key" | "query"> & {
  scope?: QueryScope;
  enabled?: MaybeRefOrGetter<boolean | string | null | undefined>;
  staleTime: number;
  gcTime: number | false;
};

export default function useAmQuery<T>(options: AmQueryOptions<T>): UseQueryReturn<T> {
  const { profile, storefront, valid } = useAuth();
  const settings = useSettingsStore();

  return useQuery({
    key: () => [
      "amdata",
      options.scope ?? ("catalog" as QueryScope),
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
    gcTime: options.gcTime,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    autoRefetch: true,
  });
}
