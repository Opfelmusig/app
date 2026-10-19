<template>
  <PageWrapper>
    <header class="flex items-center gap-2 p-4">
      <OMButtonTertiary to="/" icon="lucide:arrow-left" />
      <h2>{{ title }}</h2>
    </header>
    <USeparator />
    <AMGridWrapper>
      <AMGridStatus :is-pending :error :total="items.length" :resources="items">
        <AMGrid :items show-artists />
      </AMGridStatus>
    </AMGridWrapper>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { fetchHomeShelf } from "#layers/amdata/app/lib/queries/home";

const shelf = useRouteParams<string>("shelf");

const { data, isPending, error } = useAmQuery({
  key: () => ["home", "shelf", shelf.value],
  query: () => fetchHomeShelf(shelf.value),
  staleTime: ms("5m"),
  gcTime: ms("6h"),
});

const items = computed(() => data.value?.relationships.content ?? []);

const title = computed(() => data.value?.attributes.title ?? "Recommendations");
</script>
