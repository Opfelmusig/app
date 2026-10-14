import { sumBy } from "remeda";

export default function tracksDuration(tracks?: AmListResource<AmSong>[]) {
  const inMs = sumBy(tracks ?? [], (track) => track.resource.attributes.durationInMillis);

  return ms(inMs, {
    long: true,
  });
}
