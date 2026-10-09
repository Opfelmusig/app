import type { ResourceFilters } from "#layers/amdata/app/lib/filters";
import type { AmAlbum } from "#layers/amdata/app/types/albums";
import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong } from "#layers/amdata/app/types/songs";

export default function filterResources<T extends AmSong | AmAlbum>(
  resources: AmListResource<T>[],
  filters: ResourceFilters,
): AmListResource<T>[] {
  const selectedRatings = filters.personalRating.map(Number);

  return resources.filter(({ resource }) => {
    if (
      filters.inLibrary &&
      resource.type !== "library-songs" &&
      resource.type !== "library-albums" &&
      !resource.extras.libraryId
    )
      return false;

    if (filters.isUploaded) {
      if (resource.type !== "library-songs" && resource.type !== "library-albums") return false;
      if (resource.extras.catalogId) return false;
    }

    const rating = resource.attributes.personalRating ?? 0;
    if (selectedRatings.length > 0 && !selectedRatings.includes(rating)) return false;

    const contentRating = resource.attributes.contentRating ?? "clean";
    if (filters.contentRating.length > 0 && !filters.contentRating.includes(contentRating))
      return false;

    return true;
  });
}
