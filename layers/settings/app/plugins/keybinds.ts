export default defineNuxtPlugin({
  name: "settings:keybinds",
  dependsOn: ["session:ready"],
  setup() {
    if (isMiniplayer) return;

    const auth = useAuth();
    const settingsStore = useSettingsStore();
    const queueStore = useQueueStore();
    const playbackStore = usePlaybackStore();
    const volumeStore = useVolumeStore();
    const router = useRouter();
    const { goBack, goForward } = useNavigation();
    const { toggle: toggleSidebar } = useSidebar();
    const { open: openMiniplayer } = useMiniplayer();
    const navigationRoutes = [
      "/search",
      "/",
      "/history",
      "/resources/library-songs",
      "/resources/library-albums",
      "/resources/library-artists",
      "/library/genres",
      "/resources/library-playlist-folders",
    ];

    function togglePanel(page: "queue" | "lyrics") {
      if (settingsStore.immersive.isOpen) {
        if (page === "lyrics") settingsStore.immersive.lyrics = !settingsStore.immersive.lyrics;
        else settingsStore.immersive.queue = !settingsStore.immersive.queue;
      } else {
        const panel = settingsStore.panel;
        panel.isOpen = !panel.isOpen || panel.page !== page;
        panel.page = page;
      }
    }

    const off = useKeybind(
      [
        {
          keys: ["space", "media-play-pause"],
          run: () => playbackStore.toggle(),
          config: { meta: { group: "Playback", name: "Play / pause" } },
        },
        {
          keys: ["ctrl-cmd+arrow-left", "media-track-previous"],
          run: () => playbackStore.previous(),
          config: { meta: { group: "Playback", name: "Previous track" } },
        },
        {
          keys: ["ctrl-cmd+arrow-right", "media-track-next"],
          run: () => playbackStore.next(),
          config: { meta: { group: "Playback", name: "Next track" } },
        },
        {
          keys: "ctrl-cmd+arrow-up",
          run() {
            volumeStore.control += 0.04;
          },
          config: {
            ignoreRepeat: false,
            meta: { group: "Playback", name: "Volume up" },
          },
        },
        {
          keys: "ctrl-cmd+arrow-down",
          run() {
            volumeStore.control -= 0.04;
          },
          config: {
            ignoreRepeat: false,
            meta: { group: "Playback", name: "Volume down" },
          },
        },
        {
          keys: "s",
          run: () => {
            if (queueStore.isStation) return;
            queueStore.toggleShuffle();
          },
          config: { meta: { group: "Playback", name: "Toggle shuffle" } },
        },
        {
          keys: "r",
          run() {
            if (queueStore.isStation) return;
            queueStore.isLooping = !queueStore.isLooping;
          },
          config: { meta: { group: "Playback", name: "Toggle repeat" } },
        },
        {
          keys: "shift+r",
          run: () => playbackStore.seek(0),
          config: { meta: { group: "Playback", name: "Restart track" } },
        },
        {
          keys: "i",
          run: () => (settingsStore.immersive.isOpen = !settingsStore.immersive.isOpen),
          config: { meta: { group: "Player", name: "Toggle immersive mode" } },
        },
        {
          keys: "shift+i",
          run: () => (settingsStore.immersive.enhanced = !settingsStore.immersive.enhanced),
          config: { meta: { group: "Player", name: "Toggle immersive artwork mode" } },
        },
        {
          keys: "ctrl-cmd+shift+m",
          run: openMiniplayer,
          config: { meta: { group: "Player", name: "Open miniplayer" } },
        },
        {
          keys: "l",
          run: () => togglePanel("lyrics"),
          config: { meta: { group: "Player", name: "Toggle lyrics sidebar" } },
        },
        {
          keys: "q",
          run: () => togglePanel("queue"),
          config: { meta: { group: "Player", name: "Toggle queue sidebar" } },
        },
        {
          keys: "t",
          run() {
            settingsStore.lyrics.showTranslation = !settingsStore.lyrics.showTranslation;
          },
          config: { meta: { group: "Lyrics", name: "Toggle lyrics translation" } },
        },
        {
          keys: "shift+t",
          run() {
            settingsStore.lyrics.showTransliteration = !settingsStore.lyrics.showTransliteration;
          },
          config: { meta: { group: "Lyrics", name: "Toggle lyrics transliteration" } },
        },
        {
          keys: "alt+arrow-left",
          run: goBack,
          config: { meta: { group: "Navigation", name: "Go back" } },
        },
        {
          keys: "alt+arrow-right",
          run: goForward,
          config: { meta: { group: "Navigation", name: "Go forward" } },
        },
        {
          keys: "ctrl-cmd+$num",
          run({ template }) {
            if (template === undefined) return;

            const path = navigationRoutes[template - 1];
            if (path) return router.push(path);
          },
          config: {
            when: ({ template }) =>
              auth.valid.value &&
              template !== undefined &&
              template >= 1 &&
              template <= navigationRoutes.length,
          },
        },
        {
          keys: "ctrl-cmd+k",
          run: () => {
            if (settingsStore.isOpen) settingsStore.isOpen = false;
            settingsStore.commandPaletteOpen = !settingsStore.commandPaletteOpen;
          },
          config: {
            ignoreIfEditable: false,
            meta: { group: "Navigation", name: "Open command palette" },
          },
        },
        {
          keys: "ctrl-cmd+f",
          run() {
            if (router.currentRoute.value.path !== "/search") return router.push("/search");
          },
          config: {
            ignoreIfEditable: false,
            meta: { group: "Navigation", name: "Open search" },
          },
        },
        {
          keys: "ctrl-cmd+b",
          run: toggleSidebar,
          config: { meta: { group: "Application", name: "Toggle sidebar" } },
        },
        {
          keys: "ctrl-cmd+comma",
          run: () => {
            if (settingsStore.commandPaletteOpen) settingsStore.commandPaletteOpen = false;
            settingsStore.isOpen = true;
          },
          config: {
            ignoreIfEditable: false,
            meta: { group: "Application", name: "Open settings" },
          },
        },
        {
          keys: "escape",
          run() {
            if (settingsStore.commandPaletteOpen) settingsStore.commandPaletteOpen = false;
            else if (settingsStore.isOpen) settingsStore.isOpen = false;
            else if (settingsStore.immersive.isOpen) settingsStore.immersive.isOpen = false;
            else if (settingsStore.panel.isOpen) settingsStore.panel.isOpen = false;
          },
          config: {
            meta: { group: "Application", name: "Close current overlay" },
          },
        },
      ],
      {
        prevent: true,
        stop: true,
        ignoreIfEditable: true,
        ignoreRepeat: true,
        when: () => auth.valid.value,
      },
    );

    import.meta.hot?.dispose(off);
  },
});
