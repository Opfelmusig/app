import type { LibraryState } from "#layers/libcore/app/types/database";
import { liveQuery } from "dexie";

export default function () {
  const db = useLibraryDb();

  const state = ref<LibraryState>();
  const loading = ref(true);
  const error = ref<string>();

  const subscription = liveQuery(() => db.library_state.get("library")).subscribe({
    next(value) {
      state.value = value;
      loading.value = false;
      error.value = undefined;
    },
    error(cause) {
      error.value = cause instanceof Error ? cause.message : String(cause);
      loading.value = false;
    },
  });

  onScopeDispose(() => subscription.unsubscribe());

  return {
    state: readonly(state),
    loading: readonly(loading),
    error: readonly(error),
  };
}
