import { OpfelMusigClient } from "@opfelmusig/lib";
import { appDataDir, join } from "@tauri-apps/api/path";
import { fetch } from "@tauri-apps/plugin-http";
import { Stronghold } from "@tauri-apps/plugin-stronghold";
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

    log.info("Credential store ready");

    async function get() {
      const storedToken = await store.get(TOKEN_KEY);
      return storedToken ? new TextDecoder().decode(storedToken) : null;
    }

    const token = ref<string | null>();
    token.value = await get();

    log.info("Stored user token loaded", { found: token.value !== null });

    const tokenValid = ref(false);

    async function set(newToken: string) {
      await store.insert(TOKEN_KEY, Array.from(new TextEncoder().encode(newToken)));
      await stronghold.save();
      token.value = newToken;

      log.info("User token stored");
    }

    async function remove() {
      await store.remove(TOKEN_KEY);
      await stronghold.save();
      token.value = null;

      log.info("Stored user token removed");
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

        log.info("Apple Music Developer Token refreshed");

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

      log.info("Authentication validation started");

      const [storefront, profileData] = await Promise.all([
        client.useUserDefault(),
        client.me.getProfile({
          scopes: profileScope,
        }),
      ]);

      if (
        settingsStore.language &&
        storefront?.supportedLanguageTags.includes(settingsStore.language)
      ) {
        client.setLanguageFromTag(settingsStore.language);
      } else {
        settingsStore.language = storefront?.defaultLanguageTag;
      }

      profile.value = profileData.data[0];

      if (!profile.value) throw new Error("Profile not found");

      profileId.value = profile.value?.relationships?.["social-profile"].data[0]?.id;

      if (!profileId.value) throw new Error("Profile ID not found");

      tokenValid.value = true;

      log.info("Authentication validated", {
        durationMs: Math.round(performance.now() - startedAt),
        storefront: client.config.storefront,
        language: client.config.language?.default,
      });
    }

    async function login(newToken: string) {
      log.info("Login started");

      await set(newToken);
      try {
        await prepareClient();
      } catch (cause) {
        await logout();

        log.error("Login failed", { cause });

        throw cause;
      }

      log.info("Login completed");

      await navigateTo("/");
    }

    async function logout() {
      log.info("Logout started");

      await remove();
      settingsStore.language = undefined;
      tokenValid.value = false;
      profile.value = undefined;

      await nuxtApp.callHook("auth:logout");

      log.info("Logout completed");

      await navigateTo("/login");
    }

    try {
      await prepareClient();
    } catch (cause) {
      log.error("Stored authentication validation failed", { cause });

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
