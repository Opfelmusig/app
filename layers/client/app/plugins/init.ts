export default defineNuxtPlugin({
  name: "client:ready",
  dependsOn: ["client:setup"],
  setup: async () => {
    const { $auth } = useNuxtApp();
    const { refetch, clear } = useAuth();

    if (!$auth.valid.value) {
      clear();
      return;
    }

    try {
      await refetch();
    } catch (ex) {
      if (!isAuthError(ex)) throw ex;

      await $auth.logout();
      clear();
    }
  },
});
