import type { DropdownMenuItem } from "@nuxt/ui";

interface ResourceMenuActions {
  play?: () => void;
  shuffle?: () => void;
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
  const { play, shuffle, playNext, playAfter, createStation, pendingResource } =
    useResourcePlayback();
  const { copyLink } = useResourceSharing();
  const auth = useAuth();

  return computed<DropdownMenuItem[][]>(() => {
    const res = toValue(resource);

    if (!res || res.resourceType === "stations") return [];

    const groups: DropdownMenuItem[][] = [];
    const playback: DropdownMenuItem[] = [];
    const navigation: DropdownMenuItem[] = [];
    const pending = pendingResource.value === `${res.resourceType}:${res.resource.id}`;

    const start = toValue(config.extras?.start);
    if (start) groups.push(start);

    if (res.resourceType === "songs" || res.resourceType === "library-songs") {
      const song = res.resource;
      const albumLink = songAlbumLink(song);

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

      if (albumLink) {
        navigation.push({
          label: "Go to album",
          to: albumLink,
        });
      }
    }

    if (
      res.resourceType === "albums" ||
      res.resourceType === "library-albums" ||
      res.resourceType === "playlists" ||
      res.resourceType === "library-playlists"
    ) {
      const collection = res.resource;
      if (!config.sections?.hidePlayback && !pending) {
        playback.push(
          { label: "Play", onSelect: config.actions?.play ?? (() => play(collection)) },
          { label: "Shuffle", onSelect: config.actions?.shuffle ?? (() => shuffle(collection)) },
          { label: "Play next", onSelect: () => playNext(collection) },
        );

        if (queueStore.current && !queueStore.inContext && queueStore.queue.length) {
          playback.push({ label: "Add to queue", onSelect: () => playAfter(collection) });
        }
      }
    }

    if (
      res.resourceType === "songs" ||
      res.resourceType === "library-songs" ||
      res.resourceType === "albums" ||
      res.resourceType === "library-albums" ||
      res.resourceType === "artists" ||
      res.resourceType === "library-artists"
    ) {
      const seed = res.resource;
      const catalogId =
        seed.type === "songs" || seed.type === "albums" || seed.type === "artists"
          ? seed.id
          : seed.extras.catalogId;
      if (catalogId && !pending) {
        playback.push({ label: "Play station", onSelect: () => createStation(seed) });
      }
    }

    if (
      res.resourceType === "songs" ||
      res.resourceType === "library-songs" ||
      res.resourceType === "albums" ||
      res.resourceType === "library-albums"
    ) {
      const artistLinks = resourceArtistLinks(res.resource);
      if (artistLinks.length) {
        navigation.push({
          label: "Go to artist",
          to: artistLinks.length === 1 ? artistLinks[0]?.to : undefined,
          children: artistLinks.length > 1 ? artistLinks : undefined,
        });
      }
    }

    if (res.resourceType === "songs" || res.resourceType === "library-songs") {
      const song = res.resource;
      if (song.type === "songs" && song.extras.libraryId) {
        navigation.push({
          label: "Show in library",
          to: resourceRelationLink(song),
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
    }

    if (
      res.resourceType === "albums" ||
      res.resourceType === "library-albums" ||
      res.resourceType === "artists" ||
      res.resourceType === "library-artists" ||
      res.resourceType === "playlists" ||
      res.resourceType === "library-playlists"
    ) {
      const counterpartLink = resourceRelationLink(res.resource);
      if (counterpartLink) {
        navigation.push({
          label: res.resourceType.startsWith("library-")
            ? "Show in Apple Music"
            : "Show in library",
          to: counterpartLink,
        });
      }
    }

    groups.push(playback, navigation);

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
