<template>
  <div class="p-8">
    <h1>{{ $profile.data.value?.attributes?.name }}</h1>
    <UButton @click="$auth.logout">Logout</UButton>
  </div>
</template>
