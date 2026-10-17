import type { DropdownMenuItem } from "@nuxt/ui";

interface ResourceMenuActions {
  play?: () => void;
}

interface ResourceMenuExtras {
  start?: MaybeRefOrGetter<DropdownMenuItem[]>;
  end?: MaybeRefOrGetter<DropdownMenuItem[]>;
}

interface ResourceMenuSections {
  hidePlayback?: boolean;
}

interface ResourceMenuConfiguration {
  actions?: ResourceMenuActions;
  extras?: ResourceMenuExtras;
  sections?: ResourceMenuSections;
}

export default function useResourceMenu(
  resource: MaybeRefOrGetter<AmListResource<AmResource> | undefined>,
  config: ResourceMenuConfiguration = {},
) {
  const queueStore = useQueueStore();
  const { createStation, pendingResource } = useResourcePlayback();
  const { copyLink } = useResourceSharing();
  const auth = useAuth();

  return computed<DropdownMenuItem[][]>(() => {
    const res = toValue(resource);

    if (!res) return [];

    const groups: DropdownMenuItem[][] = [];

    const start = toValue(config.extras?.start);
    if (start) groups.push(start);

    if (res.resourceType === "songs" || res.resourceType === "library-songs") {
      const song = res.resource;
      const catalogId = song.type === "songs" ? song.id : song.extras.catalogId;
      const albumLink = songAlbumLink(song);
      const artistLinks = songArtistLinks(song);

      const playback: DropdownMenuItem[] = [];

      if (!config.sections?.hidePlayback && song.attributes.playParams && config.actions?.play) {
        playback.push({
          label: "Play",
          onSelect: config.actions.play,
        });
      }

      if (!config.sections?.hidePlayback && song.attributes.playParams) {
        playback.push({
          label: "Play next",
          onSelect: () => queueStore.playNext([res]),
        });
      }

      if (
        !config.sections?.hidePlayback &&
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
          label: "Play station",
          onSelect: () => createStation(song),
        });
      }

      groups.push(playback);

      const navigation: DropdownMenuItem[] = [];

      if (albumLink) {
        navigation.push({
          label: "Go to album",
          to: albumLink,
        });
      }

      if (artistLinks.length) {
        navigation.push({
          label: "Go to artist",
          to: artistLinks.length === 1 ? artistLinks[0]?.to : undefined,
          children: artistLinks.length > 1 ? artistLinks : undefined,
        });
      }

      if (song.type === "songs" && song.extras.libraryId) {
        navigation.push({
          label: "Show in library",
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
          label: "Copy link",
          onSelect: () => copyLink(res.resource),
        },
      ]);
    }

    const end = toValue(config.extras?.end);
    if (end) groups.push(end);

    return groups.filter((group) => group.length);
  });
}
