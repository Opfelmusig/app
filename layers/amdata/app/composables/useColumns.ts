export default function useColumns<T extends string>(
  group: "songs" | "playlists" | "albums",
  defaultColumns: T[],
) {
  const columns = useLocalStorage<T[]>(`opfelmusig:list:${group}:columns`, [...defaultColumns]);

  return { columns };
}
