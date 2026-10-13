type SidebarSectionTypes = "library" | "pins" | "playlists";
type SidebarSectionConfig = { collapsed?: boolean; hidden?: boolean };
type SidebarSections = Record<SidebarSectionTypes, SidebarSectionConfig>;

export type SettingsPage =
  | "general"
  | "account"
  | "player"
  | "playback"
  | "widgets"
  | "about"
  | "storage"
  | "shortcuts";

export const useSettingsStore = defineStore(
  "opfelmusig:settings-store",
  () => {
    const isOpen = ref(false);
    const page = ref<SettingsPage>("general");

    const language = ref<string | undefined>();

    const panel = reactive({
      isOpen: true,
      page: "queue" as "queue" | "lyrics",
    });

    const immersive = reactive({
      isOpen: false,
      page: null as "queue" | "lyrics" | null,
    });

    const sidebarSections = reactive<SidebarSections>({
      library: {},
      pins: {},
      playlists: {},
    });

    const player = reactive({
      animatedArtwork: true,
    });

    const lyrics = reactive({
      showTransliteration: false,
      showTranslation: false,
    });

    const system = reactive({
      hideTitlebarControls: false,
      automaticUpdateChecks: true,
      debugMode: false,
    });

    return {
      isOpen,
      page,
      language,
      sidebarSections,
      system,
      player,
      lyrics,
      panel,
      immersive,
    };
  },
  {
    persist: {
      omit: ["isOpen", "immersive.isOpen"],
    },
  },
);
