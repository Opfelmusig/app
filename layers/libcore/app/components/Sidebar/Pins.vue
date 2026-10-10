<template>
  <div class="flex w-full flex-col gap-1">
    <SidebarItemIcon v-if="data?.length === 0" icon="lucide:pin-off" variant="disabled">
      No Pins
    </SidebarItemIcon>
    <template v-else-if="data">
      <SidebarItemWrapper
        v-for="pin in data"
        :key="pin.resource.id"
        :to="resourceLink(pin.resource)"
      >
        <AMArtworkWrapper :resource="pin" size="xs">
          <AMArtworkImage />
          <AMArtworkPlaceholder />
        </AMArtworkWrapper>
        <SidebarItemLabel>{{ pin.resource.attributes.name }}</SidebarItemLabel>
      </SidebarItemWrapper>
    </template>
    <SidebarItemIcon v-else-if="isPending" icon="lucide:loader-circle" spin variant="disabled">
      Loading Pins
    </SidebarItemIcon>
  </div>
</template>

<script lang="ts" setup>
import { DbListId } from "#layers/libcore/app/database/types";

const { data, isPending } = useLibraryList(DbListId.Pins);
</script>
