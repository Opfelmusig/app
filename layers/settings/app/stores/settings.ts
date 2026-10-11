type SidebarSectionTypes = "library" | "pins" | "playlists";
type SidebarSectionConfig = { collapsed?: boolean; hidden?: boolean };
type SidebarSections = Record<SidebarSectionTypes, SidebarSectionConfig>;

export const useSettingsStore = defineStore(
  "opfelmusig:settings-store",
  () => {
    const language = ref<string | undefined>();

    const isPanelOpen = ref(true);

    const sidebarSections = reactive<SidebarSections>({
      library: {},
      pins: {},
      playlists: {},
    });

    const player = reactive({
      animatedArtwork: true,
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
      player,
      isPanelOpen,
    };
  },
  {
    persist: true,
  },
);
