import type { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";

export default defineNuxtPlugin({
  name: "player:deep-link",
  dependsOn: ["session:ready"],
  setup(nuxtApp) {
    if (isMiniplayer) return;

    const log = logger.withTag("deep-link");
    let disposed = false;
    let unlisten: UnlistenFn | undefined;

    function handle(urls: string[]) {
      if (disposed) return;
      const shouldPlay = urls.some((value) => {
        const url = new URL(value);
        return (
          url.protocol === "opfelmusig:" &&
          url.host === "play" &&
          (url.pathname === "" || url.pathname === "/")
        );
      });
      if (shouldPlay) nuxtApp.runWithContext(() => usePlaybackStore().play());
    }

    const unhook = nuxtApp.hook("app:mounted", async () => {
      try {
        unlisten = await onOpenUrl(handle);
        if (disposed) return unlisten();
        const urls = await getCurrent();
        if (urls) handle(urls);
      } catch (cause) {
        log.error("Could not handle deep links", { cause });
      }
    });

    import.meta.hot?.dispose(() => {
      disposed = true;
      unhook();
      unlisten?.();
    });
  },
});
