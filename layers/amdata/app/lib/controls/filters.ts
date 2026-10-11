import type { ContentRating, RatingValue } from "@opfelmusig/lib/types";

import type { ControlOption } from "#layers/amdata/app/lib/controls/types";

export type FilterRating = `${RatingValue | 0}`;

export interface ResourceFilters {
  personalRating: FilterRating[];
  contentRating: ContentRating[];
  inLibrary: boolean;
  isUploaded: boolean;
}

export const ratingFilter: ControlOption<FilterRating>[] = [
  { label: "Favorited", value: "1" },
  { label: "Suggest less", value: "-1" },
  { label: "No rating", value: "0" },
];

export const contentRatingFilter: ControlOption<ContentRating>[] = [
  { label: "Explicit", value: "explicit" },
  { label: "Clean", value: "clean" },
];
