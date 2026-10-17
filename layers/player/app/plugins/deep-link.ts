import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";

export default defineNuxtPlugin({
  name: "player:deep-link",
  dependsOn: ["session:ready"],
  async setup() {
    if (isMiniplayer) return;

    const playbackStore = usePlaybackStore();

    const log = logger.withTag("deep-link");

    function handle(urls: string[]) {
      const shouldPlay = urls.some((value) => {
        const url = new URL(value);
        return (
          url.protocol === "opfelmusig:" &&
          url.host === "play" &&
          (url.pathname === "" || url.pathname === "/")
        );
      });

      if (shouldPlay) playbackStore.play();
    }

    try {
      await onOpenUrl(handle);
      const urls = await getCurrent();
      if (urls) handle(urls);
    } catch (cause) {
      log.error("Could not handle deep links", { cause });
    }
  },
});
