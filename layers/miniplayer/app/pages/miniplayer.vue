<template>
  <main class="flex h-svh flex-col justify-end gap-1 p-2 text-xs">
    <span class="ml-20">{{ miniplayerStore.track?.attributes.name ?? "No Track" }}</span>
    <div
      class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:bg-muted active:scale-95"
      @click="$mainBridge.toggle"
    >
      <OMIcon
        :name="
          miniplayerStore.loading
            ? 'lucide:loader-circle'
            : miniplayerStore.paused
              ? 'lucide:play'
              : 'lucide:pause'
        "
        :filled="!miniplayerStore.loading"
        :class="miniplayerStore.loading ? 'size-4 animate-spin text-muted' : 'size-4 text-muted'"
      />
    </div>
  </main>
</template>

<script lang="ts" setup>
definePageMeta({ layout: false });

const miniplayerStore = useMiniplayerStore();

const { $mainBridge } = useNuxtApp();
</script>
