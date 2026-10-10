import { tableColumnsKey } from "#layers/amdata/app/lib/columns";

export default function useTableColumns() {
  const columns = inject(tableColumnsKey);

  if (!columns) {
    throw new Error("useTableColumns requires AMSongsWrapper");
  }

  return columns;
}
