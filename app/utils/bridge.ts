import { emitTo } from "@tauri-apps/api/event";
import { createBirpc, type BirpcReturn } from "birpc";

export interface MiniplayerPlayback {
  track: AmSong | null;
  position: number;
  paused: boolean;
  loading: boolean;
}

export interface MiniplayerSync {
  layout: MiniplayerLayout;
  playback: MiniplayerPlayback;
}

export interface MainFunctions {
  sync(): MiniplayerSync;
  seek(position: number): void;
  toggle(): void;
  next(): void;
  previous(): void;
}

export interface MiniplayerFunctions {
  setLayout(layout: MiniplayerLayout): void;
  setPlayback(playback: MiniplayerPlayback): void;
  updatePosition(position: number): void;
}

interface WindowApis {
  main: MainFunctions;
  miniplayer: MiniplayerFunctions;
}

export function createWindowBridge<Target extends keyof WindowApis, Local extends object>(
  target: Target,
  handlers: Local,
): BirpcReturn<WindowApis[Target], Local> {
  const event = `bridge:${[currentWindow.label, target].sort().join(":")}`;

  return createBirpc<WindowApis[Target], Local>(handlers, {
    post: (message) => emitTo({ kind: "WebviewWindow", label: target }, event, message),

    on: (receive) => currentWindow.listen<unknown>(event, ({ payload }) => receive(payload)),

    resolver: (name, handler) => (Object.hasOwn(handlers, name) ? handler : undefined),

    timeout: 2000,
  });
}
