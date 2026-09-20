import { appDataDir, join } from "@tauri-apps/api/path";
import { Stronghold } from "@tauri-apps/plugin-stronghold";
import { OpfelMusigClient } from "@opfelmusig/lib";
import { fetch } from "@tauri-apps/plugin-http";
import ms from "ms";
import { getAppleMusicDeveloperToken } from "#layers/client/app/lib/getAppleMusicDeveloperToken";
import { profileScope, type UserProfile } from "#layers/client/app/lib/profileScope";
import { logger } from "~/lib/logger";

const TOKEN_KEY = "apple-music:user-token";
const CLIENT = "auth";

export default defineNuxtPlugin({
  name: "client:ready",
  dependsOn: ["colada:ready"],
  setup: async (nuxtApp) => {
    const log = logger.withTag("auth");

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

    log.info("Stronghold ready");

    async function get() {
      const storedToken = await store.get(TOKEN_KEY);
      return storedToken ? new TextDecoder().decode(storedToken) : null;
    }

    const token = ref<string | null>();
    token.value = await get();

    log.info("Stored developer token aquired");

    const tokenValid = ref(false);

    async function set(newToken: string) {
      await store.insert(TOKEN_KEY, Array.from(new TextEncoder().encode(newToken)));
      await stronghold.save();
      token.value = newToken;

      log.info("Stored token saved");
    }

    async function remove() {
      await store.remove(TOKEN_KEY);
      await stronghold.save();
      token.value = null;

      log.info("Removed stored token");
    }

    const profile = ref<UserProfile>();
    const profileId = ref<string>();

    const client = new OpfelMusigClient({
      developerToken: async () => {
        const cached = developerToken.data.value;

        if (cached) {
          developerToken.refresh();
          return cached;
        }

        const { data } = await developerToken.refresh(true);

        log.info("New developer token aquired");

        return data;
      },
      userToken: () => token.value,
      fetch,
      debug: true,
    });

    const settingsStore = useSettingsStore();

    async function prepareClient() {
      if (!token.value) return;

      const startedAt = performance.now();

      log.info("Preparing auth and testing credentials");

      const storefront = await client.useUserDefault();

      if (
        settingsStore.language &&
        storefront?.supportedLanguageTags.includes(settingsStore.language)
      ) {
        client.setLanguageFromTag(settingsStore.language);
      } else {
        settingsStore.language = storefront?.defaultLanguageTag;
      }

      const profileData = await client.me.getProfile({
        scopes: profileScope,
      });

      profile.value = profileData.data[0];

      if (!profile.value) throw new Error("Profile not found");

      profileId.value = profile.value?.relationships?.["social-profile"].data[0]?.id;

      if (!profileId.value) throw new Error("Profile id not found");

      tokenValid.value = true;

      log.info("Auth ready and valid", {
        durationMs: Math.round(performance.now() - startedAt),
        storefront: storefront?.name,
        language: settingsStore.language,
        profileId: profileId.value,
      });
    }

    async function login(newToken: string) {
      log.info("Logging in");

      await set(newToken);
      try {
        await prepareClient();
      } catch (cause) {
        await logout();

        log.error("Auth failed", { cause });

        throw cause;
      }

      log.info("Logged in");

      await navigateTo("/");
    }

    async function logout() {
      log.info("Loggin out");

      await remove();
      settingsStore.language = undefined;
      tokenValid.value = false;
      profile.value = undefined;

      await nuxtApp.callHook("auth:logout");

      log.info("Logged out");

      await navigateTo("/login");
    }

    try {
      await prepareClient();
    } catch (cause) {
      log.error("Auth failed", { cause });

      if (isAuthError(cause)) {
        await logout();
      } else {
        throw cause;
      }
    }

    return {
      provide: {
        client,
        auth: {
          valid: readonly(tokenValid),
          profile: readonly(profile),
          profileId: readonly(profileId),
          login,
          logout,
        },
      },
    };
  },
});
