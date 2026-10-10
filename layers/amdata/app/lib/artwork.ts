import type { Artwork } from "@opfelmusig/lib/types";

export interface ArtworkContext {
  artwork: ComputedRef<Artwork | undefined>;
  imageSize: ComputedRef<number>;
  iconClass: ComputedRef<string>;
  icon: ComputedRef<string>;
}

export const artworkContextKey: InjectionKey<ArtworkContext> = Symbol("artwork-context");
