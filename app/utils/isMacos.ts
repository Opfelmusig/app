import { platform } from "@tauri-apps/plugin-os";

export const isMacos = platform() === "macos";
