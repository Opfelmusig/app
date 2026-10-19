import { sumBy } from "remeda";

export default function tracksDuration(tracks?: AmSong[]) {
  const inMs = sumBy(tracks ?? [], (track) => track.attributes.durationInMillis);

  return ms(inMs, {
    long: true,
  });
}
