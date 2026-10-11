import { tableColumnsKey } from "#layers/amdata/app/lib/contexts/columns";

export default function useTableColumns() {
  const columns = inject(tableColumnsKey);

  if (!columns) {
    throw new Error("useTableColumns requires AMSongsWrapper");
  }

  return columns;
}
