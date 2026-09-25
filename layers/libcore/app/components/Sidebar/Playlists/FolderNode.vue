<template>
  <SidebarItemIcon
    v-model="sidebarFolderOpen"
    :icon="sidebarFolderOpen ? 'lucide:folder-open' : 'lucide:folder'"
    :inset
  >
    {{ node.item.name }}
  </SidebarItemIcon>
  <Collapse :when="sidebarFolderOpen" class="transition-[height]">
    <div class="flex w-full flex-col gap-1">
      <SidebarItemIcon
        v-if="children.length === 0"
        :inset="nestedInset"
        icon="lucide:x"
        variant="disabled"
      >
        Empty Folder
      </SidebarItemIcon>

      <template v-for="child in children" :key="child.item.id">
        <SidebarPlaylistsNode
          v-if="child.type === 'library-playlists'"
          :node="child"
          :inset="nestedInset"
        />
        <SidebarPlaylistsFolderNode
          v-else-if="child.type === 'library-playlist-folders'"
          :node="child"
          :inset="nestedInset"
        />
      </template>

      <SidebarItemIcon
        v-if="overflow"
        icon="lucide:ellipsis"
        :inset="nestedInset"
        :to="libraryResourceLink(node)"
      >
        {{ overflow }} More
      </SidebarItemIcon>
    </div>
  </Collapse>
</template>

<script lang="ts" setup>
import { Collapse } from "vue-collapsed";

import type { ResolvedDbFolderNode } from "#layers/libcore/app/database/types";

const props = defineProps<{
  node: ResolvedDbFolderNode;
  inset?: number;
}>();

const sidebarFolderOpen = ref(false);

const nestedInset = computed(() => (props.inset ?? 0) + 1);

const children = computed(() => props.node.children.slice(0, 25));
const overflow = computed(() => Math.max(props.node.children.length - 25, 0));
</script>
