import type { ContentRating, RatingValue } from "@opfelmusig/lib/types";

export type FilterItem<T> = { label: string; value: T };
export type FilterRating = `${RatingValue | 0}`;

export interface ResourceFilters {
  personalRating: FilterRating[];
  contentRating: ContentRating[];
  inLibrary: boolean;
  isUploaded: boolean;
}

export const ratingFilter: FilterItem<FilterRating>[] = [
  { label: "Favorited", value: "1" },
  { label: "Suggest less", value: "-1" },
  { label: "No rating", value: "0" },
];

export const contentRatingFilter: FilterItem<ContentRating>[] = [
  { label: "Explicit", value: "explicit" },
  { label: "Clean", value: "clean" },
];
