import { appDataDir, join } from "@tauri-apps/api/path";
import { Stronghold } from "@tauri-apps/plugin-stronghold";
import { AppleMusicError, OpfelMusigClient } from "@opfelmusig/lib";
import { fetch } from "@tauri-apps/plugin-http";
import ms from "ms";

const TOKEN_KEY = "apple-music:user-token";
const CLIENT = "auth";

export default defineNuxtPlugin({
  name: "opfelmusig",
  dependsOn: ["colada-ready"],
  setup: async () => {
    const vaultPath = await join(await appDataDir(), "auth.hold");
    const stronghold = await Stronghold.load(vaultPath, "opfelmusig:auth");
    const client = await stronghold.loadClient(CLIENT).catch(() => stronghold.createClient(CLIENT));
    const store = client.getStore();

    async function get() {
      const storedToken = await store.get(TOKEN_KEY);
      return storedToken ? new TextDecoder().decode(storedToken) : null;
    }

    const token = ref(await get());

    async function set(newToken: string) {
      await store.insert(TOKEN_KEY, Array.from(new TextEncoder().encode(newToken)));
      await stronghold.save();
      token.value = newToken;
    }

    async function remove() {
      await store.remove(TOKEN_KEY);
      await stronghold.save();
      token.value = null;
    }

    const developerToken = useQuery({
      key: ["apple-music", "developer-token"],
      query: getAppleMusicDeveloperToken,
      staleTime: ms("30m"),
      gcTime: ms("1d"),
      autoRefetch: true,
    });

    const opfelmusig = new OpfelMusigClient({
      developerToken: async () => {
        const cached = developerToken.data.value;

        if (cached) {
          developerToken.refresh();
          return cached;
        }

        const { data } = await developerToken.refresh(true);
        return data;
      },
      userToken: () => token.value,
      fetch,
    });

    const profileQuery = useQuery({
      key: ["me", "profile"],
      enabled: false,
      staleTime: ms("1h"),
      query: async ({ signal }) => {
        const response = await opfelmusig.me.getProfile({
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

    const queryCache = useQueryCache();

    function clearProfile() {
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

    const settingsStore = useSettingsStore();

    async function prepareClient() {
      if (!token.value) {
        clearProfile();
        return;
      }

      try {
        const storefront = await opfelmusig.useUserDefault();

        if (
          settingsStore.language &&
          storefront?.supportedLanguageTags.includes(settingsStore.language)
        ) {
          opfelmusig.setLanguageFromTag(settingsStore.language);
        } else {
          settingsStore.language = storefront?.defaultLanguageTag;
        }

        await profileQuery.refresh(true);
      } catch (ex) {
        if (ex instanceof AppleMusicError && ex.status === 403) {
          await logout();
          await navigateTo("/login");
          return;
        }

        throw ex;
      }
    }

    await prepareClient();

    async function login(newToken: string) {
      clearProfile();
      await set(newToken);
      await prepareClient();
    }

    async function logout() {
      await remove();
      settingsStore.language = undefined;
      clearProfile();
    }

    return {
      provide: {
        opfelmusig,
        auth: {
          token: readonly(token),
          login,
          logout,
        },
        profile: {
          data: profileQuery.data,
          error: profileQuery.error,
          loading: profileQuery.isLoading,
        },
      },
    };
  },
});
