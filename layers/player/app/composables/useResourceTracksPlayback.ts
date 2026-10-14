export default function useResourceTracksPlayback() {
  const queueStore = useQueueStore();
  const toast = useToast();
  const requestId = useState("player:resource-request", () => 0);
  const pendingResource = useState<string | null>("player:pending-resource", () => null);

  async function play(resource: AmLibraryAlbum | AmLibraryPlaylist) {
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

  return { play, pendingResource: readonly(pendingResource) };
}
