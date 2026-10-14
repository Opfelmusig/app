<template>
  <span v-if="links.length" class="truncate">
    <template v-for="(link, index) in links" :key="link.id">
      <span v-if="index !== 0">, </span>
      <NuxtLink v-if="link.name" class="hover:underline" :to="rawResourceLink(type, link.id)">
        {{ link.name }}
      </NuxtLink>
    </template>
  </span>
  <template v-else-if="fallbackName">
    <NuxtLink v-if="fallbackId" class="truncate hover:underline" :to="libraryLink">
      {{ fallbackName }}
    </NuxtLink>
    <template v-else>{{ fallbackName }}</template>
  </template>
</template>

<script lang="ts" setup>
const props = defineProps<{
  links: AmCatalogLink[];
  type: "albums" | "artists";
  fallbackName?: string;
  fallbackId?: string;
}>();

const libraryLink = computed(() =>
  rawResourceLink(props.type === "albums" ? "library-albums" : "library-artists", props.fallbackId),
);
</script>
