type SidebarSectionTypes = "library" | "pins" | "playlists";
type SidebarSectionConfig = { collapsed?: boolean; hidden?: boolean };
type SidebarSections = Record<SidebarSectionTypes, SidebarSectionConfig>;

export const useSettingsStore = defineStore(
  "opfelmusig:settings-store",
  () => {
    const language = ref<string | undefined>();

    const sidebarSections = reactive<SidebarSections>({
      library: {},
      pins: {},
      playlists: {},
    });

    const system = reactive({
      hideTitlebarControls: false,
      automaticUpdateChecks: true,
      debugMode: false,
    });

    return {
      language,
      sidebarSections,
      system,
    };
  },
  {
    persist: true,
  },
);
