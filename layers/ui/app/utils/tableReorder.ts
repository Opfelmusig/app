import type { InjectionKey, Ref } from "vue";
import { shallowRef } from "vue";

export interface TableReorder {
  fromIndex: number;
  toIndex: number;
}

export const tableReorderKey: InjectionKey<ReturnType<typeof createTableReorder>> =
  Symbol("table-reorder");

export function createTableReorder(
  enabled: Readonly<Ref<boolean>>,
  ids: Readonly<Ref<readonly string[]>>,
  onReorder: (move: TableReorder) => void,
) {
  const source = shallowRef<string | null>(null);
  const target = shallowRef<{ targetId: string; placement: "before" | "after" } | null>(null);

  function reset() {
    source.value = null;
    target.value = null;
  }

  function start(id: string, event: DragEvent) {
    if (!enabled.value || !ids.value.includes(id) || !event.dataTransfer) {
      event.preventDefault();
      return;
    }

    source.value = id;
    target.value = null;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  function over(id: string | undefined, event: DragEvent) {
    if (!enabled.value || !source.value || !id) return;
    const rowIndex = ids.value.indexOf(id);
    if (rowIndex < 0) return;

    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const row = event.currentTarget as HTMLElement;
    const bounds = row.getBoundingClientRect();
    const after = event.clientY >= bounds.top + bounds.height / 2;
    const nextId = after ? ids.value[rowIndex + 1] : undefined;
    const targetId = nextId || id;
    const placement = after && !nextId ? "after" : "before";
    target.value =
      id === source.value || targetId === source.value ? null : { targetId, placement };
  }

  function overTable(event: DragEvent) {
    if (!event.defaultPrevented) target.value = null;
  }

  function leave(event: DragEvent) {
    const table = event.currentTarget as HTMLElement;
    if (event.relatedTarget instanceof Node && table.contains(event.relatedTarget)) return;
    target.value = null;
  }

  function drop(event: DragEvent) {
    const id = source.value;
    const destination = target.value;
    reset();
    if (!enabled.value || !id || !destination) return;

    const fromIndex = ids.value.indexOf(id);
    const targetIndex = ids.value.indexOf(destination.targetId);
    if (fromIndex < 0 || targetIndex < 0) return;

    event.preventDefault();
    const toIndex =
      targetIndex + (destination.placement === "after" ? 1 : 0) - (fromIndex < targetIndex ? 1 : 0);
    if (fromIndex !== toIndex) onReorder({ fromIndex, toIndex });
  }

  return { enabled, source, target, start, over, overTable, leave, drop, reset };
}
