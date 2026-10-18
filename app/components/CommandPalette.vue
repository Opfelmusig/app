<template>
  <div class="relative z-120">
    <UModal
      v-model:open="isOpen"
      :ui="{ content: 'top-[calc(50%-222px)] max-w-lg translate-y-0 overflow-hidden rounded-xl' }"
    >
      <template #content>
        <UCommandPalette
          v-model:search-term="search"
          placeholder="Go to..."
          :groups="groups"
          :fuse="{
            fuseOptions: {
              ignoreLocation: true,
              threshold: 0.2,
              keys: [{ name: 'label', weight: 2 }, 'suffix'],
            },
            resultLimit: 6,
            matchAllWhenSearchEmpty: false,
          }"
          preserve-group-order
          :class="query ? '' : 'divide-y-0'"
          :ui="{
            content: query ? 'max-h-100' : 'hidden',
            item: 'items-center gap-2 p-2 pr-2.5',
            label: 'px-2.5 text-xs font-normal text-muted',
            itemTrailing: 'shrink-0 text-xs text-dimmed',
          }"
          @update:model-value="isOpen = false"
        >
          <template #item-leading="{ item }">
            <AMArtworkWrapper v-if="item.resource" :resource="item.resource" context="small">
              <AMArtworkImage />
              <AMArtworkPlaceholder />
            </AMArtworkWrapper>
          </template>
          <template #item-trailing="{ item }">
            <UIcon v-if="item.kind" :name="resourceIcon(item.kind)" class="size-3.5" />
          </template>
          <template v-if="query && (isPending || error || !library.state.ready)" #footer>
            <p class="px-2.5 py-1 text-xs text-muted">
              {{
                error
                  ? "Could not load library results."
                  : !library.state.ready
                    ? "Library results will appear after syncing."
                    : "Loading library..."
              }}
            </p>
          </template>
        </UCommandPalette>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { CommandPaletteGroup, CommandPaletteItem } from "@nuxt/ui";

import { DbListId } from "#layers/libcore/app/database/types";

const settingsStore = useSettingsStore();
const { commandPaletteOpen: isOpen } = storeToRefs(settingsStore);
const library = useLibrary();
const search = ref("");
const query = computed(() => search.value.trim());

const { data, isPending, error } = useLibraryQuery({
  key: ["command-palette"],
  enabled: isOpen,
  query: async () => {
    const resources = await Promise.all([
      library.client.getListResources(DbListId.Songs),
      library.client.getListResources(DbListId.Albums),
      library.client.getListResources(DbListId.Artists),
      library.client.getListResources(DbListId.Playlists),
    ]);

    return resources.flat().map((item) => item.resource);
  },
});

const pages: CommandPaletteItem[] = [
  { label: "Search", to: "/search" },
  { label: "Home", to: "/" },
  { label: "History", to: "/history" },
  { label: "Songs", to: "/resources/library-songs" },
  { label: "Albums", to: "/resources/library-albums" },
  { label: "Artists", to: "/resources/library-artists" },
  { label: "Playlists", to: "/resources/library-playlist-folders" },
  {
    label: "Settings",
    onSelect: () => {
      settingsStore.isOpen = true;
    },
  },
];

const libraryItems = computed<CommandPaletteItem[]>(() => {
  if (!isOpen.value || !library.state.ready) return [];

  return (data.value ?? []).flatMap((resource) => {
    const to = resourceLink(resource);
    if (!to) return [];

    return [
      {
        label: resource.attributes.name,
        suffix: "artistName" in resource.attributes ? resource.attributes.artistName : undefined,
        kind: resource.type,
        resource,
        active: false,
        to,
      } satisfies CommandPaletteItem,
    ];
  });
});

const groups = computed<CommandPaletteGroup[]>(() => {
  if (!query.value) return [];

  return [
    { id: "app", label: "App", items: pages.map((item) => ({ ...item, active: false })) },
    { id: "library", label: "Library", items: libraryItems.value },
    {
      id: "fallback",
      ignoreFilter: true,
      items: [
        {
          label: `Search Apple Music for “${query.value}”`,
          active: false,
          to: { path: "/search", query: { term: query.value } },
        },
      ],
    },
  ];
});

watch(isOpen, (open) => {
  if (open) search.value = "";
});
</script>
