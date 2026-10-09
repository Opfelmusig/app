<template>
  <PageWrapper>
    <header class="flex flex-col gap-4 p-4">
      <div class="flex h-9 min-w-0 items-center gap-2">
        <UTooltip :content="{ side: 'bottom' }" arrow text="Go to parent folder">
          <NuxtLink :to="rawResourceLink('library-playlist-folders', folder?.extras.parentId)">
            <OMButtonTeritary icon="lucide:arrow-up-left" :disabled="!folder" />
          </NuxtLink>
        </UTooltip>
        <h2 class="truncate">
          {{ folder?.attributes.name ?? "Playlists" }}
        </h2>
      </div>
    </header>
    <AMGrid :items="children" />
    <AMFooter>
      <AMFooterCount :count="children?.length ?? 0" singular="playlist" />
    </AMFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";

const id = useRouteParams<string>("id", ROOT_FOLDER_ID);

const library = useLibrary();
const { data: folder } = useLibraryQuery({
  key: () => ["folders", id.value],
  query: () => library.client.getFolder(id.value),
});
const { data: children } = useLibraryQuery({
  key: () => ["folders", id.value, "children"],
  query: () => library.client.getFolderChildren(id.value),
});
</script>
