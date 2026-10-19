<template>
  <PageWrapper>
    <header class="flex flex-col gap-4 p-4">
      <div class="flex h-9 min-w-0 items-center gap-2">
        <UTooltip :content="{ side: 'bottom' }" arrow text="Go to parent folder">
          <NuxtLink :to="rawResourceLink('library-playlist-folders', folder?.extras.parentId)">
            <OMButtonTertiary icon="lucide:arrow-up-left" :disabled="!folder" />
          </NuxtLink>
        </UTooltip>
        <h2 class="truncate">
          {{ folder?.attributes.name ?? "Playlists" }}
        </h2>
        <OMButtonTertiary v-if="folder" icon="lucide:ellipsis" class="ml-auto" />
      </div>
    </header>
    <USeparator />
    <AMGridWrapper>
      <AMGridStatus :is-pending="isPending" :error="error" :resources="children">
        <AMGrid :items="createListResources(children, `playlist-folder:${id}`)" />
      </AMGridStatus>
    </AMGridWrapper>
    <AMFooter>
      <AMFooterCount :count="children?.length" singular="item" />
    </AMFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";

const id = useRouteParams<string>("id", ROOT_FOLDER_ID);

const { data } = useLibraryFolders();
const folder = computed(() => data.value?.find((folder) => folder.id === id.value));
const { data: children, isPending, error } = useFolderChildren(id);
</script>
