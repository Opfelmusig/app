export const useSettingsStore = defineStore(
  "opfelmusig:settings-store",
  () => {
    const language = ref<string | undefined>();

    return {
      language,
    };
  },
  {
    persist: true,
  },
);
