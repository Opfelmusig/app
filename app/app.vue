<template>
  <UApp :locale="en">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script lang="ts" setup>
import { en } from "@nuxt/ui/locale";

onMounted(() => {
  logger.withTag("app").info("App mounted", {
    durationMs: Math.round(performance.now() - useNuxtApp().$startedAt),
  });
});
</script>
