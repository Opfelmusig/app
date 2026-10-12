import type { PlaybackSong } from "@opfelmusig/lib/types";

import type { AmSong } from "#layers/amdata/app/types/songs";

export const usePlaybackStore = defineStore("opfelmusig:playback-store", () => {
  const toast = useToast();
  const client = useClient();
  const queueStore = useQueueStore();
  const log = logger.withTag("player");

  const currentRevision = ref(0);
  const pending = ref(false);

  async function getPlaybackSong(resource: AmSong) {
    return await client.playback.getSong(
      resource.type === "songs"
        ? {
            catalogId: resource.id,
            libraryId: resource.extras.libraryId,
          }
        : {
            catalogId: resource.extras.catalogId,
            libraryId: resource.id,
          },
    );
  }

  function getAssets(playbackSong: PlaybackSong) {
    return playbackSong.assets.find((a) => a.flavor === "28:ctrp256");
  }

  watch(
    () => queueStore.current,
    async (current) => {
      const resource = current?.entry.resource;
      if (!resource) return;

      const rev = ++currentRevision.value;

      try {
        pending.value = true;

        const playbackSong = await getPlaybackSong(resource);

        if (rev !== currentRevision.value) return;

        const _asset = getAssets(playbackSong);
      } catch (cause) {
        if (rev !== currentRevision.value) return;

        log.error("Failed to playback song details", {
          cause,
          resource: { id: resource.id, type: resource.type },
        });
        toast.add({
          title: "Unable to play",
          description: resource.attributes.name,
          color: "error",
        });
      } finally {
        if (rev === currentRevision.value) pending.value = false;
      }
    },
    { immediate: true },
  );

  return { pending };
});
