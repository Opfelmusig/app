import type { DbSong } from "#layers/libcore/app/database/types";

export default function (tracks?: DbSong[]) {
  const ms = tracks?.map((d) => d.durationInMillis).reduce((acc, cur) => acc + cur, 0);

  return ms ?? 0;
}
