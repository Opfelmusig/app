export default function usePersistableStorage<T>(
  id: MaybeRefOrGetter<string>,
  defaultSort: T,
  persistent = true,
) {
  if (persistent) return useLocalStorage<T>(id, defaultSort);
  else return shallowRef<T>(defaultSort);
}
