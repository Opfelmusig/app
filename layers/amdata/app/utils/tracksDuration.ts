import { sumBy } from "remeda";

import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong } from "#layers/amdata/app/types/songs";

export default function tracksDuration(tracks?: AmListResource<AmSong>[]) {
  const inMs = sumBy(tracks ?? [], (track) => track.resource.attributes.durationInMillis);

  return ms(inMs, {
    long: true,
  });
}
