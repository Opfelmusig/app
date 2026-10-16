<template>
  <main class="flex size-full items-center justify-center" data-tauri-drag-region>
    <div class="flex max-w-full flex-col gap-4" data-tauri-drag-region>
      <UFormField
        label="User token"
        help="Copy the token from a request made by the Apple Music website."
        class="w-100 max-w-full"
      >
        <UInput
          v-model="token"
          v-keybind:enter="submit"
          variant="subtle"
          type="password"
          class="w-full"
        />
      </UFormField>
      <span v-if="error" class="text-sm text-error">{{ error }}</span>
      <UButton variant="soft" :loading class="justify-center" size="lg" @click="submit">
        Log in
      </UButton>
    </div>
    <div class="absolute bottom-4 flex w-full justify-center">
      <UpdaterButtons />
    </div>
  </main>
</template>

<script lang="ts" setup>
const token = ref("");
const error = ref<string>();
const loading = ref(false);

const { $auth } = useNuxtApp();

const submit = async () => {
  if (loading.value) return;

  error.value = undefined;

  if (!token.value) {
    error.value = "Please provide a token.";
    return;
  }

  loading.value = true;

  try {
    await $auth.login(token.value);
  } catch (ex) {
    if (isAuthError(ex)) {
      error.value = "Invalid user token";
    } else {
      error.value = "Unknown error";
    }
  } finally {
    loading.value = false;
  }
};

definePageMeta({
  layout: "empty",
});
</script>
