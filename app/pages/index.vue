<template>
  <h1>{{ $profile.data.value?.attributes?.name }}</h1>
</template>

<script lang="ts" setup>
const { $profile } = useNuxtApp();
</script>
