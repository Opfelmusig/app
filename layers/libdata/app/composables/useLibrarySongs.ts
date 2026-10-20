import { fetchLibrarySongs } from "#layers/libdata/app/lib/queries/songs";

export default function useLibrarySongs() {
  return useLibraryQuery({
    key: () => ["songs"],
    query: () => fetchLibrarySongs(),
    staleTime: ms("6h"),
  });
}
