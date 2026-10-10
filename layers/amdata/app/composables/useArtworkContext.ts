import { artworkContextKey } from "#layers/amdata/app/lib/artwork";

export default function useArtworkContext() {
  const context = inject(artworkContextKey);

  if (!context) {
    throw new Error("useArtworkContext requires AMArtworkWrapper");
  }

  return context;
}
