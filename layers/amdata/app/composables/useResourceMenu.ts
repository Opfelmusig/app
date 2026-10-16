import type { DropdownMenuItem } from "@nuxt/ui";

interface ResourceMenuActions {
  play?: () => void;
}

export default function useResourceMenu(
  resource: MaybeRefOrGetter<AmListResource<AmResource>>,
  actions: ResourceMenuActions = {},
) {
  const queueStore = useQueueStore();
  const { createStation, pendingResource } = useResourcePlayback();
  const { copyLink } = useResourceSharing();
  const auth = useAuth();

  return computed<DropdownMenuItem[][]>(() => {
    const res = toValue(resource);
    const groups: DropdownMenuItem[][] = [];

    if (res.resourceType === "songs" || res.resourceType === "library-songs") {
      const song = res.resource;
      const catalogId = song.type === "songs" ? song.id : song.extras.catalogId;
      const albumLink = songAlbumLink(song);
      const artistLinks = songArtistLinks(song);

      const playback: DropdownMenuItem[] = [];

      if (song.attributes.playParams && actions.play) {
        playback.push({
          label: "Play",
          onSelect: actions.play,
        });
      }

      if (song.attributes.playParams) {
        playback.push({
          label: "Play next",
          onSelect: () => queueStore.playNext([res]),
        });
      }

      if (
        song.attributes.playParams &&
        queueStore.current &&
        !queueStore.inContext &&
        queueStore.queue.length
      ) {
        playback.push({
          label: "Add to queue",
          onSelect: () => queueStore.playAfter([res]),
        });
      }

      if (catalogId && pendingResource.value !== `${song.type}:${song.id}`) {
        playback.push({
          label: "Play Station",
          onSelect: () => createStation(song),
        });
      }

      groups.push(playback);

      const navigation: DropdownMenuItem[] = [];

      if (albumLink) {
        navigation.push({
          label: "Go to Album",
          to: albumLink,
        });
      }

      if (artistLinks.length) {
        navigation.push({
          label: "Go to Artist",
          to: artistLinks.length === 1 ? artistLinks[0]?.to : undefined,
          children: artistLinks.length > 1 ? artistLinks : undefined,
        });
      }

      if (song.type === "songs" && song.extras.libraryId) {
        navigation.push({
          label: "Show in Library",
          to: { path: "/resources/library-songs", query: { song_id: song.extras.libraryId } },
        });
      }

      if (song.type === "library-songs") {
        const catalogLink = resourceRelationLink(song);
        if (catalogLink) {
          navigation.push({
            label: "Show in Apple Music",
            to: catalogLink,
          });
        }
      }

      groups.push(navigation);
    }

    if (appleMusicLink(res.resource, auth.storefront.value?.id)) {
      groups.push([
        {
          label: "Copy Link",
          onSelect: () => copyLink(res.resource),
        },
      ]);
    }

    return groups.filter((group) => group.length);
  });
}
