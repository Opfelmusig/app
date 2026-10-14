import type { SortingDirection } from "#layers/amdata/app/lib/controls/sorting";

export default function getSavedSorting(id: string, defaultSort: SongSort) {
  const key = `opfelmusig:list:${id}`;

  const sortBy = (localStorage.getItem(`${key}:sort`) as SongSort | null) ?? defaultSort;

  const direction: SortingDirection =
    localStorage.getItem(`${key}:direction`) === "desc" ? "desc" : "asc";

  return { sortBy, direction };
}
