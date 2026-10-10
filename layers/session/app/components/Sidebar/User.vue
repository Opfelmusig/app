<template>
  <template v-if="!profile">
    <SidebarItemIcon icon="lucide:user-x" to="/me"> Profile not Found </SidebarItemIcon>
  </template>
  <template v-else>
    <SidebarItemWrapper to="/me" no-right-padding>
      <AMArtworkWrapper :resource="profile" context="small" color="muted">
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
