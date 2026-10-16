import type { DropdownMenuItem } from "@nuxt/ui";

interface ResourceMenuActions {
  play?: () => void;
}

export default function useResourceMenu(
  resource: MaybeRefOrGetter<AmListResource<AmResource>>,
  actions: ResourceMenuActions = {},
) {
  const queueStore = useQueueStore();

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
      }
    }

    return items;
  });
}
