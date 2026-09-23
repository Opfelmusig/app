import { isTauri } from "@tauri-apps/api/core";
import {
  debug as tauriDebug,
  error as tauriError,
  info as tauriInfo,
  trace as tauriTrace,
  warn as tauriWarn,
} from "@tauri-apps/plugin-log";
import { createConsola, type ConsolaReporter, type LogObject } from "consola";

const MAX_LOG_LENGTH = 8_000;

const tauriReporter: ConsolaReporter = {
  log(log) {
    if (!isTauri()) return;

    const write = getTauriLogger(log.level);

    void write(formatLog(log)).catch((cause) => {
      console.error("Could not write log through Tauri", cause);
    });
  },
};

export const logger = createConsola({
  level: import.meta.dev ? 4 : 3,

  formatOptions: {
    colors: import.meta.dev,

    maxArrayLength: 25,
    maxStringLength: 1_000,
  },
});

logger.addReporter(tauriReporter);

function getTauriLogger(level: number) {
  if (level <= 0) return tauriError;
  if (level === 1) return tauriWarn;
  if (level <= 3) return tauriInfo;
  if (level === 4) return tauriDebug;
  return tauriTrace;
}

function formatLog(log: LogObject) {
  const message = [`[${log.tag || "app"}]`, ...log.args.map(formatArgument)].join(" ");

  if (message.length <= MAX_LOG_LENGTH) return message;

  return `${message.slice(0, MAX_LOG_LENGTH)}… [truncated]`;
}

function formatArgument(value: unknown) {
  if (typeof value === "string") return value;

  const seen = new WeakSet<object>();

  try {
    return (
      JSON.stringify(value, (_key, nestedValue) => {
        if (typeof nestedValue !== "object" || nestedValue === null) return nestedValue;

        if (seen.has(nestedValue)) return "[Circular]";
        seen.add(nestedValue);

        if (nestedValue instanceof Error) {
          return {
            name: nestedValue.name,
            message: nestedValue.message,
            stack: nestedValue.stack,
            cause: nestedValue.cause,
          };
        }

        return nestedValue;
      }) ?? String(value)
    );
  } catch {
    return String(value);
  }
}
