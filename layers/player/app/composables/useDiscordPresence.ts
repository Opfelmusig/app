import { getArtworkUrl } from "@opfelmusig/lib/helpers";
import { invoke } from "@tauri-apps/api/core";
import type { Ref } from "vue";

interface DiscordPlayback {
  isPlaying: Ref<boolean>;
  paused: Ref<boolean>;
  position: Ref<number>;
  duration: Ref<number>;
}

const APPLICATION_ID = "1532742930899533894";

export function useDiscordPresence(playback: DiscordPlayback) {
  const settingsStore = useSettingsStore();
  const queueStore = useQueueStore();
  const auth = useAuth();
  const log = logger.withTag("discord");
  let timer: ReturnType<typeof setTimeout> | undefined;

  function catalogUrl(type: "song" | "artist", id: string | undefined) {
    const storefront = auth.storefront.value?.id;
    if (!id || !storefront) return;
    return `https://music.apple.com/${encodeURIComponent(storefront)}/${type}/${encodeURIComponent(id)}`;
  }

  const presence = computed(() => {
    const song = queueStore.current?.entry.resource;
    if (
      !settingsStore.integrations.discordRichPresence ||
      !song ||
      !playback.isPlaying.value ||
      playback.paused.value
    ) {
      return null;
    }

    const attributes = song.attributes;
    return {
      title: attributes.name,
      songUrl: catalogUrl("song", song.type === "songs" ? song.id : song.extras.catalogId),
      artist: attributes.artistName ?? "Unknown Artist",
      artistUrl: catalogUrl("artist", attributes.artists[0]?.id),
      album: attributes.albumName,
      artworkUrl: getArtworkUrl(attributes.artwork, { width: 512 }),
      duration: playback.duration.value,
    };
  });

  function syncPresence(clear = false) {
    const current = clear ? null : presence.value;
    return invoke("native_discord_set_presence", {
      applicationId: APPLICATION_ID,
      presence: current ? { ...current, position: playback.position.value } : null,
    }).catch((cause) => log.debug("Could not synchronize Discord Rich Presence", { cause }));
  }

  watch(
    presence,
    () => {
      clearTimeout(timer);
      timer = setTimeout(() => syncPresence(), 100);
    },
    { immediate: true },
  );
}
