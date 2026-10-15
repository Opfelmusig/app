<template>
  <template v-if="!profile">
    <SidebarItemIcon icon="lucide:user-x" to="/me"> Profile not found </SidebarItemIcon>
  </template>
  <template v-else>
    <SidebarItemWrapper to="/me" no-right-padding>
      <AMArtworkWrapper :resource="profile" context="small">
        <AMArtworkImage />
        <AMArtworkPlaceholder />
      </AMArtworkWrapper>
      <SidebarItemLabel>{{ profile.attributes?.name }}</SidebarItemLabel>
    </SidebarItemWrapper>
  </template>
</template>

<script lang="ts" setup>
const { profile } = useAuth();
</script>
