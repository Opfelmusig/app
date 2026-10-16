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

  return computed<DropdownMenuItem[]>(() => {
    const res = toValue(resource);
    const items: DropdownMenuItem[] = [];

    switch (res.resourceType) {
      case "songs":
      case "library-songs": {
        items.push({
          label: "Play",
          onSelect: actions.play,
          disabled: !actions.play,
        });

        items.push({
          label: "Play next",
          onSelect: () => queueStore.playNext([res]),
        });

        items.push({
          label: "Add to queue",
          onSelect: () => queueStore.playAfter([res]),
        });

        const catalogId =
          res.resourceType === "songs" ? res.resource.id : res.resource.extras.catalogId;

        items.push({
          label: "Play Station",
          disabled:
            !catalogId || pendingResource.value === `${res.resource.type}:${res.resource.id}`,
          onSelect: () => createStation(res.resource),
        });
      }
    }

    return items;
  });
}
