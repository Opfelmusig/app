<template>
  <UModal v-model:open="open" title="Edit folder" :dismissible="!isLoading" :close="!isLoading">
    <template #body>
      <form id="edit-folder" class="flex flex-col gap-4" @submit.prevent="save">
        <UFormField label="Name" required>
          <UInput v-model="name" autofocus required :disabled="isLoading" class="w-full" />
        </UFormField>
        <p v-if="error" role="alert" class="text-sm text-error">
          Could not save the changes. Please try again.
        </p>
      </form>
    </template>
    <template #footer>
      <UButton color="neutral" variant="ghost" :disabled="isLoading" @click="open = false">
        Cancel
      </UButton>
      <UButton type="submit" form="edit-folder" :loading="isLoading" :disabled="!name.trim()">
        Save
      </UButton>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  folder: AmLibraryPlaylistFolder;
}>();
const open = defineModel<boolean>("open", { default: false });

const mutations = useMutations();
const name = ref(props.folder.attributes.name);

const { mutate, isLoading, error } = useMutation({
  mutation: (input: { name: string }) => mutations.editPlaylistFolder(props.folder.id, input),
  onSuccess: () => {
    open.value = false;
  },
});

function save() {
  if (!name.value.trim() || isLoading.value) return;
  mutate({ name: name.value.trim() });
}
</script>
