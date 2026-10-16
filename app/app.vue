<template>
  <UApp :locale="en">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script lang="ts" setup>
import { en } from "@nuxt/ui/locale";
</script>
