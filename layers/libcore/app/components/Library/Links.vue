<template>
  <span v-if="links.length" class="truncate">
    <template v-for="(link, index) in links" :key="link.id">
      <span v-if="index !== 0">, </span>
      <NuxtLink v-if="link.name" class="hover:underline" :to="`/resources/${type}/${link.id}`">
        {{ link.name }}
      </NuxtLink>
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
</template>

<script lang="ts" setup>
import type { AmCatalogLink } from "#layers/amdata/app/types/resources";

defineProps<{
  links: AmCatalogLink[];
  type: "albums" | "artists";
  libraryName?: string;
  libraryId?: string;
}>();
</script>
