<template>
  <UIcon v-if="!artwork" :name="icon" :class="iconClass" />
</template>

<script lang="ts" setup>
const { artwork, iconClass, icon } = useArtworkContext();
</script>
