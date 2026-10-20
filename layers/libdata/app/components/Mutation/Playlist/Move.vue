<template>
  <UModal
    v-model:open="open"
    title="Move playlist"
    :description="`Choose a destination for “${playlist.attributes.name}”.`"
    :dismissible="!isLoading"
    :close="!isLoading"
  >
    <template #body>
      <p v-if="foldersPending" role="status" class="text-sm text-muted">Loading folders…</p>
      <div v-else-if="foldersError" class="flex flex-col items-start gap-2">
        <p role="alert" class="text-sm text-error">Could not load folders.</p>
        <UButton color="neutral" variant="ghost" @click="refetch()">Try again</UButton>
      </div>
      <MutationFolderPicker
        v-else
        v-model="parentId"
        :folders="folders ?? []"
        :disabled="isLoading"
      />
      <p v-if="error" role="alert" class="mt-4 text-sm text-error">
        Could not move the playlist. Please try again.
      </p>
    </template>
    <template #footer>
      <UButton color="neutral" variant="ghost" :disabled="isLoading" @click="open = false">
        Cancel
      </UButton>
      <UButton :loading="isLoading" :disabled="!canMove" @click="move">Move</UButton>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{ playlist: AmLibraryPlaylist }>();
const open = defineModel<boolean>("open", { default: false });

const mutations = useMutations();
const {
  data: folders,
  isPending: foldersPending,
  error: foldersError,
  refetch,
} = useLibraryFolders();
const parentId = ref(props.playlist.extras.parentId);

const { mutate, isLoading, error } = useMutation({
  mutation: (destination: string) => mutations.movePlaylist(props.playlist.id, destination),
  onSuccess: () => {
    open.value = false;
  },
});

const canMove = computed(
  () =>
    !!parentId.value &&
    parentId.value !== props.playlist.extras.parentId &&
    !foldersPending.value &&
    !foldersError.value &&
    !isLoading.value,
);

function move() {
  if (canMove.value) mutate(parentId.value);
}
</script>
