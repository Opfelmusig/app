<template>
  <h1>{{ id }}</h1>
</template>

<script lang="ts" setup>
const id = useRouteParams<string | undefined>("id");
</script>
