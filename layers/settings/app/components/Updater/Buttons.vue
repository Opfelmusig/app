<template>
  <div class="flex gap-2">
    <UButton
      v-if="updater.status === 'available'"
      color="neutral"
      variant="soft"
      icon="lucide:refresh-cw"
      aria-label="Check for updates again"
      class="w-8 justify-center"
      :ui="{ leadingIcon: 'size-4' }"
      @click="updater.checkForUpdate()"
    />
    <UpdaterButton :label :icon />
  </div>
</template>

<script lang="ts" setup>
const updater = useUpdaterStore();

const label = computed(() => {
  switch (updater.status) {
    case "checking":
      return "Checking...";
    case "available":
      return `Install v${updater.version}?`;
    case "downloading":
      return "Downloading...";
    case "ready":
      return "Restart to install?";
    case "installing":
      return "Restarting...";
    default:
      return "Check for updates";
  }
});

const icon = computed(() => {
  if (updater.status === "available") return "lucide:download";
  if (updater.status === "ready") return "lucide:check";
  return "lucide:refresh-cw";
});
</script>
