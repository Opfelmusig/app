import { LibraryClient } from "#layers/libcore/app/database/client";

export default defineNuxtPlugin({
  name: "libcore:prepare",
  dependsOn: ["client:ready"],
  setup: () => {
    const client = new LibraryClient();

    return {
      provide: {
        library: {
          client,
          state: {
            ready: true,
          },
        },
      },
    };
  },
});
