export default function () {
  const client = useClient();
  const { $auth } = useNuxtApp();
  const queryCache = useQueryCache();

  const profileQuery = useQuery({
    key: ["me", "profile"],
    enabled: false,
    meta: { persist: false },
    query: async ({ signal }) => {
      const response = await client.me.getProfile({
        config: { signal },
        scopes: {
          "personal-social-profiles": {
            relationships: {
              "shared-playlists": "include",
              "social-profile": "include",
            },
          },
          "library-playlists": {
            relationships: {
              catalog: "include",
            },
          },
          playlists: {
            relationships: {
              curator: "include",
            },
          },
        },
      });

      return response.data[0] ?? null;
    },
  });

  function clear() {
    const entry = queryCache.get(["me", "profile"]);
    if (!entry) return;

    queryCache.cancel(entry);

    queryCache.setEntryState(entry, {
      status: "pending",
      data: undefined,
      error: null,
    });

    queryCache.invalidate(entry);
  }

  const refetch = () => profileQuery.refetch(true);

  async function login(newToken: string) {
    clear();

    try {
      await $auth.login(newToken);
      await refetch();
    } catch (ex) {
      await $auth.logout();
      clear();
      throw ex;
    }

    await navigateTo("/");
  }

  async function logout() {
    await $auth.logout();
    clear();
    await navigateTo("/login");
  }

  return {
    login,
    logout,
    refetch,
    clear,
    valid: $auth.valid,
    profile: {
      data: profileQuery.data,
      error: profileQuery.error,
      loading: profileQuery.isLoading,
    },
  };
}
