import { appDataDir, join } from "@tauri-apps/api/path";
import { Stronghold } from "@tauri-apps/plugin-stronghold";
import { OpfelMusigClient } from "@opfelmusig/lib";
import { fetch } from "@tauri-apps/plugin-http";
import ms from "ms";

const TOKEN_KEY = "apple-music:user-token";
const CLIENT = "auth";

export default defineNuxtPlugin({
  name: "client:setup",
  dependsOn: ["colada-ready"],
  setup: async () => {
    const developerToken = useQuery({
      key: ["apple-music", "developer-token"],
      query: getAppleMusicDeveloperToken,
      staleTime: ms("30m"),
      gcTime: ms("1d"),
      autoRefetch: true,
    });

    const dataDir = await appDataDir();
    const vaultPath = await join(dataDir, "auth.hold");
    const stronghold = await Stronghold.load(vaultPath, "opfelmusig:auth");
    const strongholdClient = await stronghold
      .loadClient(CLIENT)
      .catch(() => stronghold.createClient(CLIENT));
    const store = strongholdClient.getStore();

    async function get() {
      const storedToken = await store.get(TOKEN_KEY);
      return storedToken ? new TextDecoder().decode(storedToken) : null;
    }

    const token = ref<string | null>();
    token.value = await get();
    const tokenValid = ref(false);

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

    const client = new OpfelMusigClient({
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
      debug: true,
    });

    const settingsStore = useSettingsStore();

    async function prepareClient() {
      if (!token.value) return;

      const storefront = await client.useUserDefault();

      if (
        settingsStore.language &&
        storefront?.supportedLanguageTags.includes(settingsStore.language)
      ) {
        client.setLanguageFromTag(settingsStore.language);
      } else {
        settingsStore.language = storefront?.defaultLanguageTag;
      }

      tokenValid.value = true;
    }

    async function login(newToken: string) {
      await set(newToken);
      await prepareClient();
    }

    async function logout() {
      await remove();
      settingsStore.language = undefined;
      tokenValid.value = false;
    }

    try {
      await prepareClient();
    } catch (ex) {
      if (isAuthError(ex)) {
        await logout();
      } else {
        throw ex;
      }
    }

    return {
      provide: {
        client,
        auth: {
          valid: readonly(tokenValid),
          login,
          logout,
        },
      },
    };
  },
});
