<template>
  <PageWrapper class="gap-4 p-4">
    <template v-if="data">
      <div v-for="shelve in data" :key="shelve.id" class="flex flex-col gap-4">
        <div class="flex flex-col">
          <h2>{{ shelve.attributes.title }}</h2>
          <h3 v-if="shelve.attributes.reason">{{ shelve.attributes.reason }}</h3>
        </div>
        <div class="flex flex-col gap-2">
          <span v-for="resource in shelve.relationships.content" :key="resource.item.id">
            <template v-if="resource.reason"> {{ resource.reason }}: </template>
            {{ resource.item.attributes.name }} - {{ resource.item.type }}
          </span>
        </div>
      </div>
    </template>
    <div v-else class="flex size-full items-center justify-center overflow-hidden">
      <div v-if="isPending" :class="statusClass()">
        <UIcon name="lucide:loader-circle" class="size-4 animate-spin" />
        <span>Loading</span>
      </div>
      <div v-else-if="error" :class="statusClass({ color: 'error' })">
        <UIcon name="lucide:x" class="size-4" />
        <span>{{ error.message }}</span>
      </div>
      <div v-else-if="!data" :class="statusClass()">No lyrics found</div>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { fetchHome } from "#layers/amdata/app/lib/queries/home";

const client = useClient();

const { data, isPending, error } = useAmQuery({
  key: () => ["home"],
  query: () => fetchHome(client),
  staleTime: ms("5m"),
  gcTime: ms("6h"),
});

const statusClass = cva("flex items-center gap-2 text-sm", {
  variants: {
    color: {
      muted: "text-muted",
      error: "text-error",
    },
  },
  defaultVariants: {
    color: "muted",
  },
});
</script>
