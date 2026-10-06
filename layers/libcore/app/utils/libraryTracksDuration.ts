import type { DbListId, ResolvedDbListResourceByList } from "#layers/libcore/app/database/types";

export default function (tracks?: ResolvedDbListResourceByList<DbListId.Songs>[]) {
  const inMs = tracks
    ?.map((d) => d.resource.attributes.durationInMillis)
    .reduce((acc, cur) => acc + cur, 0);

  return ms(inMs ?? 0, {
    long: true,
  });
}
