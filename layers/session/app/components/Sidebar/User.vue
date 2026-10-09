<template>
  <template v-if="!profile">
    <SidebarItemIcon icon="lucide:user-x" to="/me"> Profile not Found </SidebarItemIcon>
  </template>
  <template v-else>
    <SidebarItemWrapper to="/me" no-right-padding>
      <AMArtworkWrapper
        v-slot="{ artwork, iconClass, imageSize }"
        :resource="profile"
        color="muted"
        size="xs"
      >
        <AMArtworkImage v-if="artwork" :width="imageSize" :artwork />
        <UIcon v-else name="lucide:user-x" :class="iconClass" />
      </AMArtworkWrapper>
      <SidebarItemLabel>{{ profile.attributes?.name }}</SidebarItemLabel>
    </SidebarItemWrapper>
  </template>
</template>

<script lang="ts" setup>
const { profile } = useAuth();
</script>
