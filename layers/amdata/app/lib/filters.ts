import type { ContentRating } from "@opfelmusig/lib/types";

import type { SongFilterRating } from "#layers/amdata/app/types/songs";

export type FilterItem<T> = { label: string; value: T };

export const songRatingFilter: FilterItem<SongFilterRating>[] = [
  { label: "Favorited", value: "1" },
  { label: "Suggest less", value: "-1" },
  { label: "No rating", value: "0" },
];

export const songContentRatingFilter: FilterItem<ContentRating>[] = [
  { label: "Explicit", value: "explicit" },
  { label: "Clean", value: "clean" },
];
