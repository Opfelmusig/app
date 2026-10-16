<template>
  <UButton
    color="neutral"
    variant="soft"
    :icon
    :label
    :loading="updater.busy"
    :disabled="!desktop"
    class="relative overflow-hidden"
    :class="[
      updater.status === 'downloading' &&
        `before:absolute before:inset-y-0 before:left-0 before:w-(--progress) before:bg-white/40 before:content-['']`,
    ]"
    :style="{ '--progress': `${updater.progress ?? 0}%` }"
    @click="updater.update()"
  />
</template>

<script lang="ts" setup>
import { isTauri } from "@tauri-apps/api/core";

defineProps<{ icon?: string; label?: string }>();

const updater = useUpdaterStore();
const desktop = isTauri();
</script>
