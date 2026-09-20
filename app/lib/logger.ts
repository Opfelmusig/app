import { createConsola } from "consola";

export const logger = createConsola({
  // TODO: uncommend once finished and ready to release
  level: 4 /* import.meta.dev ? 4 : 1 */,

  defaults: {
    tag: "app",
  },

  formatOptions: {
    colors: import.meta.dev,

    maxArrayLength: 25,
    maxStringLength: 1_000,
  },
});
