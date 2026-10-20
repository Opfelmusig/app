<template>
  <UTree
    v-model="selected"
    :items="tree.items"
    :get-key="(item) => item.id"
    :default-expanded="initialExpanded"
    :disabled
    :as="{ link: 'div' }"
    selection-behavior="replace"
    class="max-h-64 overflow-y-auto"
    @toggle="(event) => event.detail.originalEvent.type === 'click' && event.preventDefault()"
  >
    <template #item-trailing="{ item, expanded, handleToggle }">
      <UButton
        v-if="item.children?.length"
        :icon="expanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
        color="neutral"
        variant="ghost"
        size="xs"
        :disabled
        tabindex="-1"
        @click.stop="handleToggle"
      />
    </template>
  </UTree>
</template>

<script lang="ts" setup>
import type { TreeItem } from "@nuxt/ui";
import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";

interface FolderItem extends TreeItem {
  id: string;
  label: string;
  children?: FolderItem[];
}

const props = defineProps<{
  folders: AmLibraryPlaylistFolder[];
  excludeId?: string;
  disabled?: boolean;
}>();
const parentId = defineModel<string>({ required: true });

const tree = computed(() => {
  const byId = new Map<string, FolderItem>();

  function children(id: string): FolderItem[] {
    return props.folders
      .filter(
        (folder) =>
          folder.id !== ROOT_FOLDER_ID &&
          folder.id !== props.excludeId &&
          folder.extras.parentId === id,
      )
      .toSorted(byName)
      .map((folder) => {
        const nested = children(folder.id);
        const item: FolderItem = {
          id: folder.id,
          label: folder.attributes.name,
          icon: nested.length ? undefined : "lucide:folder",
          children: nested,
        };
        byId.set(item.id, item);
        return item;
      });
  }

  const root: FolderItem = {
    id: ROOT_FOLDER_ID,
    label: "Playlists",
    icon: "lucide:layout-grid",
    children: children(ROOT_FOLDER_ID),
  };
  byId.set(root.id, root);
  return { items: [root], byId };
});

const selected = computed({
  get: () => tree.value.byId.get(parentId.value),
  set: (item: FolderItem | undefined) => {
    if (item) parentId.value = item.id;
  },
});

const initialExpanded = [ROOT_FOLDER_ID];
let current = props.folders.find((folder) => folder.id === parentId.value);
while (current && !initialExpanded.includes(current.id)) {
  initialExpanded.push(current.id);
  const id = current.extras.parentId;
  current = props.folders.find((folder) => folder.id === id);
}

watch(
  tree,
  ({ byId }) => {
    if (!byId.has(parentId.value)) parentId.value = ROOT_FOLDER_ID;
  },
  { immediate: true },
);
</script>
