<template>
  <div class="p-8">
    <h1>{{ profile.data.value?.attributes?.name }}</h1>
    <UButton @click="logout">Logout</UButton>
  </div>
</template>

<script lang="ts" setup>
const { profile, logout } = useAuth();
</script>
