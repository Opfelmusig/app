import { writeText } from "@tauri-apps/plugin-clipboard-manager";

export default function useResourceSharing() {
  const auth = useAuth();

  async function copyLink(resource: AmResource) {
    const link = appleMusicLink(resource, auth.storefront.value?.id);
    if (!link) return;

    try {
      await writeText(link);
    } catch (cause) {
      logger.withTag("sharing").error("Failed to copy Apple Music link", { cause });
    }
  }

  return { copyLink };
}
