export default function useColumns<T extends string>(
  id: MaybeRefOrGetter<string>,
  defaultColumns: T[],
) {
  const columns = useLocalStorage<T[]>(
    () => `opfelmusig:list:${toValue(id)}:columns`,
    [...defaultColumns],
  );

  const columnsChanged = computed(
    () =>
      columns.value.length !== defaultColumns.length ||
      defaultColumns.some((column) => !columns.value.includes(column)),
  );

  function reset() {
    columns.value = [...defaultColumns];
  }

  return {
    columns,
    columnsChanged,
    reset,
  };
}
