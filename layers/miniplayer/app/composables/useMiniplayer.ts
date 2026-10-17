import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export default function useMiniplayer() {
  const log = logger.withTag("miniplayer");

  const isOpen = useState<boolean>("miniplayer:is-open", () => false);
  const isOpening = useState<boolean>("miniplayer:is-opening", () => false);

  async function refresh() {
    try {
      const window = await getMiniplayerWindow();

      if (window) {
        register(window);
        isOpen.value = true;
      } else {
        isOpen.value = false;
      }
    } catch (cause) {
      log.error("Could not focus the miniplayer", { cause });
    }
  }

  async function open() {
    if (currentWindow.label !== "main") {
      log.warn("The miniplayer can only be created from the main window.");
      return;
    }

    if (isOpening.value) return;
    isOpening.value = true;

    try {
      const settingsStore = useSettingsStore();

      const existing = await WebviewWindow.getByLabel(MINIPLAYER_LABEL);

      if (existing) {
        register(existing);
        isOpen.value = true;
        isOpening.value = false;
        existing
          .setFocus()
          .catch((cause) => log.error("Could not focus the miniplayer", { cause }));
        currentWindow
          .minimize()
          .catch((cause) => log.error("Could not minimize the main window", { cause }));
        return;
      }

      const layout = miniplayerLayoutConfiguration[settingsStore.player.miniplayerLayout];

      const window = new WebviewWindow(MINIPLAYER_LABEL, {
        url: "/miniplayer",
        title: "Miniplayer",
        width: layout.width,
        height: layout.height,
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: true,
        visibleOnAllWorkspaces: true,
        backgroundColor: "#171717",
        decorations: isMacos,
        hiddenTitle: true,
        titleBarStyle: "overlay",
        maximizable: false,
        minimizable: false,
        theme: "dark",
      });

      register(window);
    } catch (cause) {
      isOpening.value = false;
      log.error("Could not create the miniplayer", { cause });
    }
  }

  function register(window: WebviewWindow) {
    window.once("tauri://error", ({ payload }) => {
      log.error(`Could not open the miniplayer`, { payload });
      isOpening.value = false;
    });

    window.once("tauri://created", () => {
      isOpening.value = false;
      isOpen.value = true;
      return currentWindow
        .minimize()
        .catch((cause) => log.error("Could not minimize the main window", { cause }));
    });

    window.once("tauri://destroyed", () => {
      isOpen.value = false;
      restore();
    });
  }

  async function close() {
    try {
      const miniplayer = await getMiniplayerWindow();
      await miniplayer?.close();
      isOpen.value = false;
    } catch (cause) {
      log.error("Could not close the miniplayer window", { cause });
    }
  }

  async function restore() {
    try {
      await currentWindow.unminimize();
      await currentWindow.setFocus();
    } catch (cause) {
      log.error("Could not restore the main window", { cause });
    }
  }

  return {
    isOpen: readonly(isOpen),
    refresh,
    open,
    close,
  };
}
