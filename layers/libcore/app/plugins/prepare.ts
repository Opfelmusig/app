export default defineNuxtPlugin({
  name: "libcore:prepare",
  setup: async () => {
    const db = new LibraryDatabase("opfelmusig-library");

    let state = await db.library_state.get("library");

    if (!state) {
      state = {
        id: "library",
        state: "pending",
      };

      await db.library_state.add(state);
    }

    return {
      provide: {
        libraryDb: db,
      },
    };
  },
});
