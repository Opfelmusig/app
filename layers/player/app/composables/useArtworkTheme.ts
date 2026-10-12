import { getArtworkUrl } from "@opfelmusig/lib/helpers";

const defaultCssVars = {
  "--vibrant": "transparent",
  "--muted": "transparent",
  "--dark-vibrant": "transparent",
  "--dark-muted": "transparent",
  "--light-vibrant": "transparent",
  "--light-muted": "transparent",
};

export function useArtworkTheme() {
  const queueStore = useQueueStore();
  const cssVars = ref(defaultCssVars);
  const cache = new Map<string, typeof defaultCssVars>();
  const artworkUrl = computed(() =>
    getArtworkUrl(queueStore.current?.entry.resource.attributes.artwork, { width: 512 }),
  );

  watch(
    artworkUrl,
    async (url, _previousUrl, onCleanup) => {
      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
      });

      if (!url) {
        cssVars.value = defaultCssVars;
        return;
      }

      const cached = cache.get(url);
      if (cached) {
        cssVars.value = cached;
        return;
      }

      try {
        const { Vibrant } = await import("node-vibrant/browser");
        const palette = await Vibrant.from(url).getPalette();
        if (cancelled) return;

        const extractedCssVars = {
          "--vibrant": palette.Vibrant?.hex ?? "transparent",
          "--muted": palette.Muted?.hex ?? "transparent",
          "--dark-vibrant": palette.DarkVibrant?.hex ?? "transparent",
          "--dark-muted": palette.DarkMuted?.hex ?? "transparent",
          "--light-vibrant": palette.LightVibrant?.hex ?? "transparent",
          "--light-muted": palette.LightMuted?.hex ?? "transparent",
        };

        cache.set(url, extractedCssVars);
        cssVars.value = extractedCssVars;
      } catch {
        if (!cancelled) cssVars.value = defaultCssVars;
      }
    },
    { immediate: true, flush: "sync" },
  );

  return { cssVars };
}
