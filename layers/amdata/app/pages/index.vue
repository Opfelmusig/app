<template>
  <PageWrapper class="gap-8 py-4">
    <AMResourceShelf
      v-for="shelf in data"
      :key="shelf.id"
      :title="shelf.attributes.title ?? 'Recommendations'"
      :description="shelf.attributes.reason"
      :items="shelf.relationships.content"
      :see-more-to="shelf.attributes.hasSeeAll ? `/home/${shelf.id}` : undefined"
      show-artists
    />
    <div class="flex w-full justify-center px-4">
      <div
        v-if="!data && isPending"
        class="flex items-center justify-center gap-2 py-8 text-sm text-muted"
      >
        <UIcon name="lucide:loader-circle" class="size-4 animate-spin" />
        Loading recommendations
      </div>
      <div v-else-if="error" class="flex items-center gap-2 text-sm text-error">
        <UIcon name="lucide:x" class="size-4 shrink-0" />
        <span>{{ error.message }}</span>
      </div>
      <p v-else-if="data?.length === 0" class="py-8 text-center text-sm text-muted">
        No recommendations available.
      </p>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { fetchHome } from "#layers/amdata/app/lib/queries/home";

const client = useClient();

const { data, isPending, error } = useAmQuery({
  key: () => ["home"],
  query: () => fetchHome(client),
  staleTime: ms("2m"),
  gcTime: ms("6h"),
});
</script>
