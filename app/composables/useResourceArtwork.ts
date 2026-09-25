export default function (resource: MaybeRefOrGetter<ResourceArtworkExtract | null | undefined>) {
  return computed(() => resourceArtwork(toValue(resource)));
}
