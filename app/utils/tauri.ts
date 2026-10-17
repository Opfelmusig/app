import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export const currentWindow = WebviewWindow.getCurrent();

export function getMainWindow() {
  return WebviewWindow.getByLabel("main");
}
