<template>
  <PageWrapper class="gap-8 p-4">
    <AMResourceScroller
      v-for="shelf in data"
      :key="shelf.id"
      :title="shelf.attributes.title ?? 'Recommendations'"
      :description="shelf.attributes.reason"
      :items="shelf.relationships.content"
      :see-more-to="
        shelf.attributes.hasSeeAll ? `/home/${encodeURIComponent(shelf.id)}` : undefined
      "
      show-artists
    />
    <div
      v-if="!data && isPending"
      class="flex items-center justify-center gap-2 py-8 text-sm text-muted"
      role="status"
    >
      <UIcon name="lucide:loader-circle" class="size-4 animate-spin" />
      Loading recommendations
    </div>
    <div v-else-if="error" class="flex items-center gap-2 text-sm text-error" role="alert">
      <UIcon name="lucide:x" class="size-4 shrink-0" />
      <span>{{ error.message }}</span>
    </div>
    <p v-else-if="data?.length === 0" class="py-8 text-center text-sm text-muted">
      No recommendations available.
    </p>
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
</script>
