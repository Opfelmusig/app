<template>
  <span v-if="typeLinks?.length" class="truncate">
    <template v-for="(link, index) in typeLinks" :key="link.id">
      <span v-if="index !== 0">, </span>
      <NuxtLink
        v-if="link.name"
        class="hover:underline"
        :to="`/resources/${link.type}/${link.catalogId}`"
      >
        {{ link.name }}
      </NuxtLink>
      <span v-else>Unknown</span>
    </template>
  </span>
  <template v-else-if="libraryName">
    <NuxtLink
      v-if="libraryId"
      class="truncate hover:underline"
      :to="`/resources/library-${type}/${libraryId}`"
    >
      {{ libraryName }}
    </NuxtLink>
    <template v-else>{{ libraryName }}</template>
  </template>
  <template v-else> Unknown </template>
</template>

<script lang="ts" setup>
import type { DbCatalogLinkType, DbLibraryCatalogLink } from "#layers/libcore/app/database/types";

const props = defineProps<{
  links: DbLibraryCatalogLink[];
  type: DbCatalogLinkType;
  libraryName?: string;
  libraryId?: string;
}>();

const typeLinks = computed(() =>
  props.links
    .filter((link) => link.type === props.type)
    .toSorted((a, b) => a.position - b.position),
);
</script>
