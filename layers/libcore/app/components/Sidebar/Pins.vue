<template>
  <div class="flex w-full flex-col gap-1">
    <SidebarItemIcon v-if="data?.length === 0" icon="lucide:pin-off" variant="disabled">
      No Pins
    </SidebarItemIcon>
    <template v-else-if="data">
      <SidebarItemWrapper
        v-for="pin in data"
        :key="`${pin.resource.type}:${pin.resource.item.id}`"
        :to="libraryResourceLink(pin.resource)"
      >
        <ArtworkWrapper
          v-slot="{ iconClass, imageSize, artwork }"
          :library-resource="pin.resource"
          size="xs"
        >
          <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
          <UIcon v-else :name="resourceIcon(pin.resource.type)" :class="iconClass" />
        </ArtworkWrapper>
        <SidebarItemLabel>{{ pin.resource.item.name }}</SidebarItemLabel>
      </SidebarItemWrapper>
    </template>
    <SidebarItemIcon
      v-else-if="isLoading || asyncStatus === 'loading'"
      icon="lucide:loader-circle"
      spin
      variant="disabled"
    >
      Loading Pins
    </SidebarItemIcon>
  </div>
</template>

<script lang="ts" setup>
import { DbListId } from "#layers/libcore/app/database/types";

const { isLoading } = useLibrary();
const { data, asyncStatus } = useLibraryList(DbListId.Pins);
</script>
