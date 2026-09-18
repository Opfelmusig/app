export default function () {
  const db = useLibraryDb();
  const client = useClient();

  const syncing = useState("library:syncing", () => false);
  const error = useState<string | undefined>("library:sync-error", () => undefined);
  const progress = useState("library:sync-progress", () => 0);

  async function refresh() {
    void db;
    void client;
  }

  return {
    refresh,
    progress: readonly(progress),
    syncing: readonly(syncing),
    error: readonly(error),
  };
}
