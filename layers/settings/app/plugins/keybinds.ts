export default defineNuxtPlugin({
  name: "settings:keybinds",
  dependsOn: ["session:ready"],
  setup(nuxtApp) {
    const auth = useAuth();
    const settingsStore = useSettingsStore();
    const queueStore = useQueueStore();
    const volumeStore = useVolumeStore();

    function togglePanel(page: "queue" | "lyrics") {
      const panel = settingsStore.panel;
      panel.isOpen = !panel.isOpen || panel.page !== page;
      panel.page = page;
    }

    const off = useKeybind(
      [
        {
          keys: "space",
          run: () => nuxtApp.runWithContext(() => usePlaybackStore().toggle()),
          config: { meta: { group: "Playback", name: "Play / pause" } },
        },
        {
          keys: "ctrl-cmd+arrow-left",
          run: () => nuxtApp.runWithContext(() => usePlaybackStore().previous()),
          config: { meta: { group: "Playback", name: "Previous track" } },
        },
        {
          keys: "ctrl-cmd+arrow-right",
          run: () => queueStore.next(),
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
          run: () => queueStore.toggleShuffle(),
          config: { meta: { group: "Player", name: "Toggle shuffle" } },
        },
        {
          keys: "r",
          run() {
            queueStore.isLooping = !queueStore.isLooping;
          },
          config: { meta: { group: "Player", name: "Toggle repeat" } },
        },
        {
          keys: "shift+r",
          run: () => nuxtApp.runWithContext(() => usePlaybackStore().seek(0)),
          config: { meta: { group: "Player", name: "Restart track" } },
        },
        {
          keys: "i",
          run: () => (settingsStore.immersive.isOpen = !settingsStore.immersive.isOpen),
          config: { meta: { group: "Player", name: "Toggle immersive mode" } },
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
          keys: "escape",
          run() {
            if (settingsStore.immersive.isOpen) settingsStore.immersive.isOpen = false;
            else if (settingsStore.panel.isOpen) settingsStore.panel.isOpen = false;
          },
          config: { meta: { group: "Lyrics", name: "Toggle lyrics transliteration" } },
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
