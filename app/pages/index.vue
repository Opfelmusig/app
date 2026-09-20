<template>
  <div class="p-8 flex flex-col gap-2 items-start size-full" data-tauri-drag-region>
    <h1>{{ profile?.attributes?.name }}@{{ profile?.attributes?.handle }}</h1>
    <span>{{ profileId }}</span>
    <UButton @click="logout">Logout</UButton>
    <div class="flex flex-col">
      <span v-for="song in data" :key="song.resource_id">{{ song.name }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { profile, logout, profileId } = useAuth();
const { data } = useLibrarySongs();
</script>
