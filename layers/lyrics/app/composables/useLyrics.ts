import { AppleMusicError } from "@opfelmusig/lib";

import type { AmSong } from "#layers/amdata/app/types/songs";
import { parseAppleMusicLyricsTtml } from "#layers/lyrics/app/utils/parseAppleMusicLyricsTtml";

export default function useLyrics(song: MaybeRefOrGetter<AmSong | undefined>) {
  const client = useClient();
  const auth = useAuth();
  const resource = computed(() => toValue(song));
  const enabled = computed(() => auth.valid.value && !!resource.value);

  const query = useQuery({
    key: () => [
      "lyrics",
      client.config.storefront ?? null,
      client.config.language?.default ?? null,
      client.config.language?.lyrics ?? null,
      client.config.language?.script ?? null,
      resource.value?.id ?? null,
    ],
    enabled,
    meta: { persist: false },
    staleTime: ms("1d"),
    refetchOnWindowFocus: false,
    async query({ signal }) {
      const song = resource.value;
      if (!song) return null;
      const config = { signal };

      try {
        let catalogId = song.type === "songs" ? song.id : song.extras.catalogId;
        if (!catalogId) {
          const catalog = await client.library.songs.getRelationship(song.id, "catalog", {
            config,
          });
          catalogId = catalog.data[0]?.id;
        }
        if (!catalogId) return null;

        const response = await client.catalog.songs.getRelationship(catalogId, "syllable-lyrics", {
          scopes: { "syllable-lyrics": { extend: ["ttmlLocalizations"] } },
          config,
        });
        const attributes = response.data[0]?.attributes;
        const ttml = attributes?.ttmlLocalizations || attributes?.ttml;
        return ttml ? parseAppleMusicLyricsTtml(ttml) : null;
      } catch (cause) {
        if (cause instanceof AppleMusicError && cause.status === 404) return null;
        throw cause;
      }
    },
  });

  return {
    lyrics: computed(() => (enabled.value ? (query.data.value ?? null) : null)),
    error: computed(() => (enabled.value ? query.error.value : null)),
    pending: computed(() => enabled.value && query.isPending.value),
  };
}
