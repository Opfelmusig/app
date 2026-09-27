<script setup lang="ts">
type SortField = "playlistOrder" | "title" | "album" | "artist" | "length";
type SortDirection = "asc" | "desc";

const options: { label: string; value: SortField }[] = [
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
  <div class="p-4">
    <UPopover :content="{ align: 'start' }" :ui="{ content: 'rounded-2xl' }">
      <UButton color="neutral" variant="soft" icon="lucide:filter" />

      <template #content>
        <div class="flex w-48 flex-col">
          <div class="flex gap-1 p-1">
            <UButton
              v-for="direction in ['asc', 'desc']"
              :key="direction"
              :variant="sort.direction === direction ? 'soft' : 'ghost'"
              :leading-icon="direction === 'asc' ? 'lucide:chevron-down' : 'lucide:chevron-up'"
              class="w-full justify-center first:rounded-tl-xl last:rounded-tr-xl"
              color="neutral"
              :ui="{
                leadingIcon: 'size-4',
              }"
              @click="sort.direction = direction"
            />
          </div>
          <USeparator />
          <div class="flex flex-col gap-1 p-1">
            <UButton
              v-for="option in options"
              :key="option.value"
              type="button"
              color="neutral"
              :variant="sort.by === option.value ? 'soft' : 'ghost'"
              :label="option.label"
              :trailing-icon="sort.by === option.value ? 'i-lucide-check' : undefined"
              class="w-full justify-between"
              :ui="{
                trailingIcon: 'size-4',
              }"
              @click="
                () => {
                  if (sort.by === option.value) sort.by = 'playlistOrder';
                  else sort.by = option.value;
                }
              "
            />
          </div>
          <USeparator />
          <div class="flex p-1">
            <UButton
              variant="ghost"
              leading-icon="lucide:corner-up-left"
              class="w-full gap-2 rounded-b-xl"
              color="error"
              :ui="{
                leadingIcon: 'size-4',
              }"
              label="Reset"
              :disabled="sort.direction === 'asc' && sort.by === 'playlistOrder'"
              @click="
                sort.direction = 'asc';
                sort.by = 'playlistOrder';
              "
            />
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>
