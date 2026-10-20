import { LibraryMutations } from "#layers/libdata/app/lib/mutations";

export default defineNuxtPlugin({
  name: "mutations:ready",
  dependsOn: ["session:ready"],
  setup: () => {
    const client = useClient();
    const cache = useQueryCache();
    const toast = useToast();

    const mutations = new LibraryMutations(client, cache, toast);

    return {
      provide: {
        mutations,
      },
    };
  },
});
