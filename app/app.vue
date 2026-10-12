<template>
  <UApp :locale="en">
    <div :style="cssVars">
      <NuxtLayout>
        <NuxtPage :keepalive="{ max: 5 }" />
      </NuxtLayout>
    </div>
  </UApp>
</template>

<script lang="ts" setup>
import { en } from "@nuxt/ui/locale";

const { cssVars } = useArtworkTheme();

useHead({
  titleTemplate: (title) => (title ? `${title} | Öpfelmusig` : "Öpfelmusig"),
});
</script>
