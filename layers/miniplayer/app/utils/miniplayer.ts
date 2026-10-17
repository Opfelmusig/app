import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const MINIPLAYER_LABEL = "miniplayer";

export const isMiniplayer = getCurrentWindow().label === MINIPLAYER_LABEL;

export function getMiniplayerWindow() {
  return WebviewWindow.getByLabel(MINIPLAYER_LABEL);
}

export const layoutConfiguration: Record<MiniplayerLayout, { height: number; width: number }> = {
  default: { width: 240, height: 80 },
  artwork: { width: 280, height: 280 },
};
