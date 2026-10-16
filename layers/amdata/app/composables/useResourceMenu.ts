import type { DropdownMenuItem } from "@nuxt/ui";

interface Emits {
  play?: () => void;
}

export default function useResourceMenu(
  resource: MaybeRefOrGetter<AmResource>,
  emits?: MaybeRefOrGetter<Emits>,
) {
  return computed<DropdownMenuItem[]>(() => [
    {
      label: "Play",
      onSelect: toValue(emits)?.play,
    },
  ]);
}
