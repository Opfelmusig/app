<template>
  <UModal
    v-model:open="open"
    title="Edit playlist"
    :dismissible="!isLoading"
    :close="!isLoading"
    :ui="{ content: 'max-w-md rounded-xl', footer: 'justify-end' }"
  >
    <template #body>
      <form id="edit-playlist" class="flex flex-col gap-4" @submit.prevent="save">
        <UFormField label="Name" required>
          <UInput v-model="name" autofocus required :disabled="isLoading" class="w-full" />
        </UFormField>
        <UFormField label="Description" hint="Optional">
          <UTextarea v-model="description" :disabled="isLoading" :rows="3" class="w-full" />
        </UFormField>
        <UCheckbox v-model="isPublic" label="Public playlist" :disabled="isLoading" />
        <p v-if="error" role="alert" class="text-sm text-error">
          Could not save the changes. Please try again.
        </p>
      </form>
    </template>
    <template #footer>
      <UButton color="neutral" variant="ghost" :disabled="isLoading" @click="open = false">
        Cancel
      </UButton>
      <UButton type="submit" form="edit-playlist" :loading="isLoading" :disabled="!name.trim()">
        Save
      </UButton>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  playlist: AmLibraryPlaylist;
}>();
const open = defineModel<boolean>("open", { default: false });

const mutations = useMutations();
const name = ref(props.playlist.attributes.name);
const description = ref(props.playlist.attributes.description ?? "");
const isPublic = ref(props.playlist.extras.isPublic);

const { mutate, isLoading, error } = useMutation({
  mutation: (input: { name: string; description: string; isPublic: boolean }) =>
    mutations.editPlaylist(props.playlist, input),
  onSuccess: () => {
    open.value = false;
  },
});

function save() {
  if (!name.value.trim() || isLoading.value) return;
  mutate({
    name: name.value.trim(),
    description: description.value.trim(),
    isPublic: isPublic.value,
  });
}
</script>
