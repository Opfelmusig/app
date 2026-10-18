import type { ComponentExposed } from "vue-component-type-helpers";

import type { USplitter } from "#components";

type SplitterInstance = ComponentExposed<typeof USplitter>;

const splitter = shallowRef<SplitterInstance | null>(null);
const width = ref<number>();

export function useSidebar() {
  const panel = computed(() => splitter.value?.panelsRef[0]);
  const isCollapsed = computed(() => panel.value?.isCollapsed ?? false);

  function onLayout(sizes: number[]) {
    width.value = sizes[0];
  }

  function toggle() {
    if (panel.value) {
      if (panel.value.isCollapsed) panel.value.expand();
      else panel.value.collapse();
    }
  }

  function reset() {
    if (panel.value) {
      panel.value?.expand();
      panel.value?.resize(260);
    }
  }

  return { splitter, isCollapsed, toggle, reset, width, onLayout };
}
