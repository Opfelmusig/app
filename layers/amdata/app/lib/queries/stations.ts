import type { OpfelMusigClient } from "@opfelmusig/lib";

import { parseCatalogStation } from "#layers/amdata/app/lib/parsers/stations";

export async function fetchResourceStation(
  client: OpfelMusigClient,
  resource: AmSong | AmAlbum | AmArtist,
) {
  const catalogId =
    resource.type === "songs" || resource.type === "albums" || resource.type === "artists"
      ? resource.id
      : resource.extras.catalogId;
  if (!catalogId) return null;

  const response = await client.catalog.stations.getResourceStation(catalogId);
  const station = response.data[0];
  if (!hasResourceName(station)) throw new Error("Station not found");

  return parseCatalogStation(station);
}
