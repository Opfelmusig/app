import { fetchLibrarySongs } from "#layers/amdata/app/lib/queries/songs";

export default function useLibrarySongs() {
  return useAmQuery({
    scope: "library",
    key: () => ["songs"],
    query: () => fetchLibrarySongs(),
    staleTime: ms("6h"),
    gcTime: false,
  });
}
