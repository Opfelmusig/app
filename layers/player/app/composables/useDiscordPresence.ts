import { getArtworkUrl } from "@opfelmusig/lib/helpers";
import { invoke } from "@tauri-apps/api/core";

interface DiscordPlayback {
  playing: Ref<boolean>;
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

  const presence = computed(() => {
    const song = queueStore.current?.entry.resource;
    if (!settingsStore.integrations.discordRichPresence || !song || !playback.playing.value) {
      return null;
    }

    const attributes = song.attributes;
    const storefront = auth.storefront.value?.id;
    return {
      title: attributes.name,
      songUrl: appleMusicLink(song, storefront),
      artist: attributes.artistName ?? "Unknown artist",
      artistUrl: rawAppleMusicLink("artists", attributes.artists[0]?.id, storefront),
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
