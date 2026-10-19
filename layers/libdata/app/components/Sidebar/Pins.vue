<template>
  <div class="flex w-full flex-col gap-1">
    <SidebarItemIcon v-if="data?.length === 0" icon="lucide:pin-off" variant="disabled">
      No pins
    </SidebarItemIcon>
    <template v-else-if="data">
      <SidebarResourceMenu v-for="pin in data" :key="pin.id" :resource="pin">
        <SidebarItemWrapper :to="resourceLink(pin)">
          <AMArtworkWrapper :artwork="pin.attributes.artwork" context="small">
            <AMArtworkImage />
            <AMArtworkPlaceholder />
          </AMArtworkWrapper>
          <SidebarItemLabel>{{ pin.attributes.name }}</SidebarItemLabel>
        </SidebarItemWrapper>
      </SidebarResourceMenu>
    </template>
    <SidebarItemIcon v-else-if="isPending" icon="lucide:loader-circle" spin variant="disabled">
      Loading pins
    </SidebarItemIcon>
    <SidebarItemIcon v-else-if="error" icon="lucide:x" variant="error">
      {{ error.message }}
    </SidebarItemIcon>
  </div>
</template>

<script lang="ts" setup>
const { data, isPending, error } = usePins();
</script>
