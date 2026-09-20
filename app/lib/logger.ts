import { createConsola } from "consola";

export const logger = createConsola({
  level: import.meta.dev ? 4 : 3,

  defaults: {
    tag: "app",
  },

  formatOptions: {
    colors: import.meta.dev,

    maxArrayLength: 25,
    maxStringLength: 1_000,
  },
});
