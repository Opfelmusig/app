import { getCurrentWindow } from "@tauri-apps/api/window";

export const isMiniplayer = getCurrentWindow().label === "miniplayer";
