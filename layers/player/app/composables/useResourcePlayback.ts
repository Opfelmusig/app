import { fetchResourceStation } from "#layers/amdata/app/lib/queries/stations";

export default function useResourcePlayback() {
  const queueStore = useQueueStore();
  const client = useClient();
  const toast = useToast();
  const requestId = useState("player:resource-request", () => 0);
  const pendingResource = useState<string | null>("player:pending-resource", () => null);

  async function play(resource: AmAlbum | AmPlaylist) {
    const resourceKey = `${resource.type}:${resource.id}`;
    if (pendingResource.value === resourceKey) return;

    const currentRequest = ++requestId.value;
    pendingResource.value = resourceKey;

    try {
      const tracks = await getTracks(resource);
      if (currentRequest !== requestId.value) return;

      if (tracks.length === 0) {
        toast.add({ title: "No songs to play", description: resource.attributes.name });
        return;
      }

      queueStore.playContext({ context: resource, tracks, index: 0 });
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

  return { play, createStation, pendingResource: readonly(pendingResource) };
}
