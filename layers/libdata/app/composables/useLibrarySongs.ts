import { fetchLibrarySongs } from "#layers/libdata/app/lib/queries/songs";

export default function useLibrarySongs() {
  return useLibraryQuery({
    key: () => ["songs", "list"],
    query: ({ signal }) => fetchLibrarySongs(signal),
    staleTime: ms("3h"),
    gcTime: false,
  });
}
