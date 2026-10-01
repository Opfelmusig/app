<script setup lang="ts">
type SortField = "playlistOrder" | "title" | "album" | "artist" | "length";
type SortDirection = "asc" | "desc";

const options: { label: string; value: SortField }[] = [
  { label: "Default", value: "playlistOrder" },
  { label: "Title", value: "title" },
  { label: "Album", value: "album" },
  { label: "Artist", value: "artist" },
  { label: "Length", value: "length" },
];

const sort = ref<{ by: SortField; direction: SortDirection }>({
  by: "playlistOrder",
  direction: "asc",
});
</script>

<template>
  <div class="flex items-start gap-2 p-4">
    <UPopover :content="{ align: 'start' }" :ui="{ content: 'overflow-hidden rounded-xl' }">
      <OMButtonSecondary icon="lucide:arrow-up-down" />

      <template #content>
        <div class="flex w-48 flex-col">
          <div class="flex gap-1 p-1">
            <UButton
              v-for="direction in ['asc', 'desc']"
              :key="direction"
              :variant="sort.direction === direction ? 'soft' : 'ghost'"
              :leading-icon="direction === 'asc' ? 'lucide:chevron-down' : 'lucide:chevron-up'"
              class="w-full justify-center rounded-sm first:rounded-tl-lg last:rounded-tr-lg"
              color="neutral"
              :ui="{
                leadingIcon: 'size-4',
              }"
              @click="sort.direction = direction"
            />
          </div>
          <USeparator />
          <div class="flex flex-col gap-2 p-2 px-2.5">
            <span class="text-sm text-muted">Sort By</span>
            <URadioGroup v-model="sort.by" :items="options" />
          </div>
        </div>
      </template>
    </UPopover>

    <UPopover :content="{ align: 'start' }" :ui="{ content: 'overflow-hidden rounded-xl' }">
      <OMButtonSecondary icon="lucide:filter" />

      <template #content>
        <div class="flex w-48 flex-col">
          <div class="flex flex-col gap-2 p-2 px-2.5">
            <span class="text-sm text-muted">Age Rating</span>
            <UCheckbox label="Clean" />
            <UCheckbox label="Explicit" />
          </div>
          <USeparator />
          <div class="flex flex-col gap-2 p-2 px-2.5">
            <span class="text-sm text-muted">Rating</span>
            <UCheckbox label="Favorited" />
            <UCheckbox label="Suggest Less" />
            <UCheckbox label="No Rating" />
          </div>
          <USeparator />
          <div class="flex flex-col gap-2 p-2 px-2.5">
            <span class="text-sm text-muted">Genres</span>
            <UCheckbox label="Anime" />
            <UCheckbox label="Alternative" />
            <UCheckbox label="Hip-Hop/Rap" />
            <UCheckbox label="House" />
            <UCheckbox label="J-Pop" />
            <UCheckbox label="K-Pop" />
            <UCheckbox label="Indie Pop" />
            <UCheckbox label="Pop" />
          </div>
        </div>
      </template>
    </UPopover>

    <UPopover :content="{ align: 'start' }" :ui="{ content: 'overflow-hidden rounded-xl' }">
      <OMButtonSecondary icon="lucide:columns-3" />

      <template #content>
        <div class="flex w-48 flex-col gap-2 p-2 px-2.5">
          <span class="text-sm text-muted">Columns</span>
          <UCheckbox label="Artwork" :default-value="true" />
          <UCheckbox label="Title" :default-value="true" />
          <UCheckbox label="Artist" :default-value="true" />
          <UCheckbox label="Album" :default-value="true" />
          <UCheckbox label="Length" :default-value="true" />
        </div>
      </template>
    </UPopover>
  </div>
</template>
