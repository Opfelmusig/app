<template>
  <UApp :locale="en">
    <NuxtLayout>
      <NuxtPage :keepalive="{ max: 5 }" />
    </NuxtLayout>
  </UApp>
</template>

<script lang="ts" setup>
import { en } from "@nuxt/ui/locale";

useHead({
  titleTemplate: (title) => (title ? `${title} | Öpfelmusig` : "Öpfelmusig"),
});
</script>
