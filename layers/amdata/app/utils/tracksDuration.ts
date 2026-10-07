import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong } from "#layers/amdata/app/types/songs";

export default function tracksDuration(tracks?: AmListResource<AmSong>[]) {
  const inMs = tracks
    ?.map((d) => d.resource.attributes.durationInMillis)
    .reduce((acc, cur) => acc + cur, 0);

  return ms(inMs ?? 0, {
    long: true,
  });
}
