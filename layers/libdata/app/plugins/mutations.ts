import { LibraryMutations } from "#layers/libdata/app/lib/mutations";

export default defineNuxtPlugin({
  name: "mutations:ready",
  dependsOn: ["session:ready"],
  setup: () => {
    return {
      provide: {
        mutations: new LibraryMutations(),
      },
    };
  },
});
