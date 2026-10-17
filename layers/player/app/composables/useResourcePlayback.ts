import { fetchResourceStation } from "#layers/amdata/app/lib/queries/stations";

export default function useResourcePlayback() {
  const queueStore = useQueueStore();
  const client = useClient();
  const toast = useToast();
  const requestId = useState("player:resource-request", () => 0);
  const pendingResource = useState<string | null>("player:pending-resource", () => null);

  async function play(resource: AmAlbum | AmPlaylist, action?: "next" | "after" | "shuffle") {
    if (
      action === "after" &&
      (!queueStore.current || queueStore.inContext || !queueStore.queue.length)
    )
      return;

    const resourceKey = `${resource.type}:${resource.id}`;
    if (pendingResource.value === resourceKey) return;

    const currentRequest = ++requestId.value;
    pendingResource.value = resourceKey;
    const queue = queueStore.queue;

    try {
      const tracks = await getTracks(resource);
      if (currentRequest !== requestId.value) return;
      if ((action === "next" || action === "after") && queueStore.queue !== queue) return;

      if (tracks.length === 0) {
        toast.add({ title: "No songs to play", description: resource.attributes.name });
        return;
      }

      if (action === "next") queueStore.playNext(tracks);
      else if (action === "after") queueStore.playAfter(tracks);
      else queueStore.playContext({ context: resource, tracks, index: 0 }, action === "shuffle");
    } catch (cause) {
      if (currentRequest !== requestId.value) return;

      logger.withTag("player").error("Failed to load resource tracks", { cause, resourceKey });
      toast.add({ title: "Unable to play", description: resource.attributes.name, color: "error" });
    } finally {
      if (currentRequest === requestId.value) pendingResource.value = null;
    }
  }

  async function createStation(resource: AmSong | AmAlbum | AmArtist) {
    const resourceKey = `${resource.type}:${resource.id}`;
    if (pendingResource.value === resourceKey) return;

    const currentRequest = ++requestId.value;
    pendingResource.value = resourceKey;

    try {
      const station = await fetchResourceStation(client, resource);
      if (!station || currentRequest !== requestId.value) return;

      await queueStore.playStation(station);
    } catch (cause) {
      if (currentRequest !== requestId.value) return;

      logger.withTag("player").error("Failed to create station", { cause, resourceKey });
      toast.add({
        title: "Unable to create station",
        description: resource.attributes.name,
        color: "error",
      });
    } finally {
      if (currentRequest === requestId.value) pendingResource.value = null;
    }
  }

  return {
    play,
    shuffle: (resource: AmAlbum | AmPlaylist) => play(resource, "shuffle"),
    playNext: (resource: AmAlbum | AmPlaylist) => play(resource, "next"),
    playAfter: (resource: AmAlbum | AmPlaylist) => play(resource, "after"),
    createStation,
    pendingResource: readonly(pendingResource),
  };
}
