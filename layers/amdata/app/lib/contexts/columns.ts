import type { ComputedRef, InjectionKey } from "vue";

import type { SongColumns } from "#layers/amdata/app/types/songs";

export const tableColumnsKey: InjectionKey<ComputedRef<SongColumns[]>> = Symbol("table-columns");
