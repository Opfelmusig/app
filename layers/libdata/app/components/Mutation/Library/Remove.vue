<template>
  <UModal
    v-model:open="open"
    title="Remove from library"
    :description="`Remove “${name}” from your Apple Music library?`"
    :dismissible="!isLoading"
    :close="!isLoading"
  >
    <template #footer>
      <UButton color="neutral" variant="ghost" :disabled="isLoading" @click="open = false">
        Cancel
      </UButton>
      <UButton color="error" :loading="isLoading" :disabled="isLoading" @click="remove">
        Remove
      </UButton>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  libraryId: string;
  type: "songs" | "albums";
  catalogId?: string;
  name: string;
}>();
const open = defineModel<boolean>("open", { default: false });

const mutations = useMutations();
const { mutate, isLoading } = useMutation({
  mutation: () => mutations.removeFromLibrary(props.libraryId, props.type, props.catalogId),
  onSuccess: () => {
    open.value = false;
  },
});

function remove() {
  if (!isLoading.value) mutate();
}
</script>
