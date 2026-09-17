<template>
  <main class="flex size-full items-center justify-center" data-tauri-drag-region>
    <div class="flex max-w-full flex-col gap-4" data-tauri-drag-region>
      <UFormField
        label="User Token"
        help="Copy it from one of the Apple Music website requests."
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
        Login
      </UButton>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { AppleMusicError } from "@opfelmusig/lib";

useHead({ title: "Login" });

const token = ref("");
const error = ref<string>();
const loading = ref(false);

const { $auth } = useNuxtApp();

const submit = async () => {
  error.value = undefined;

  if (!token.value) {
    error.value = "Please provide a token";
    return;
  }

  loading.value = true;

  try {
    await $auth.login(token.value);
  } catch (ex) {
    await $auth.logout();

    if (ex instanceof AppleMusicError && ex.status === 403) {
      error.value = "Invalid User Token";
    } else {
      error.value = "Unknown Error";
    }
  } finally {
    loading.value = false;
  }
};
</script>
