import { openUrl } from "@tauri-apps/plugin-opener";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";

type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "ready" | "installing";

export const useUpdaterStore = defineStore("opfelmusig:updater-store", () => {
  const toast = useToast();
  const log = logger.withTag("updater");
  const status = ref<UpdateStatus>("idle");
  const version = ref<string>();
  const progress = ref<number>();
  const busy = computed(() => ["checking", "downloading", "installing"].includes(status.value));
  let release: Update | null = null;

  async function failed(title: string, cause: unknown) {
    await release?.close().catch((cause) => log.warn("Could not release update", { cause }));

    release = null;
    version.value = undefined;
    progress.value = undefined;
    status.value = "idle";

    log.error(title, { cause });
    toast.add({
      title,
      description: cause instanceof Error ? cause.message : String(cause),
      color: "error",
      actions: [
        {
          label: "Download manually",
          icon: "lucide:external-link",
          onClick: () => openUrl("https://github.com/opfelmusig/downloads/releases/latest"),
        },
      ],
    });
  }

  async function checkForUpdate(silent = false) {
    if (busy.value) return;
    if (status.value === "ready") return version.value;

    status.value = "checking";

    try {
      const next = await check({ timeout: ms("30s") });
      await release?.close().catch((cause) => log.warn("Could not release update", { cause }));
      release = next;
      version.value = next?.version;
      progress.value = undefined;
      status.value = next ? "available" : "idle";

      if (!silent && !next) toast.add({ title: "You are up to date", color: "success" });
      return version.value;
    } catch (cause) {
      await failed("Could not check for updates", cause);
    }
  }

  async function update() {
    if (busy.value) return;
    if (!release) {
      await checkForUpdate();
      return;
    }

    let installed = false;

    try {
      if (status.value === "available") {
        status.value = "downloading";
        progress.value = undefined;
        let downloaded = 0;
        let total: number | undefined;

        await release.download((event) => {
          if (event.event === "Started") total = event.data.contentLength;
          if (event.event === "Progress") {
            downloaded += event.data.chunkLength;
            if (total) progress.value = Math.min(100, Math.floor((downloaded / total) * 100));
          }
        });

        progress.value = 100;
        status.value = "ready";
        toast.add({
          id: "update-ready",
          title: "Update ready",
          description: `Restart to install Öpfelmusig v${version.value}.`,
          duration: 0,
          actions: [{ label: "Restart", onClick: () => update() }],
        });
      } else {
        status.value = "installing";
        await release.install();
        installed = true;
        await relaunch();
      }
    } catch (cause) {
      await failed(installed ? "Could not restart" : "Update failed", cause);
    }
  }

  function openChangelog() {
    return openUrl("https://github.com/opfelmusig/downloads/blob/main/CHANGELOG.md");
  }

  return { status, version, progress, busy, checkForUpdate, update, openChangelog };
});
