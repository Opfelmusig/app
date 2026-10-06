import { fetch } from "@tauri-apps/plugin-http";

const appleMusicUrl = "https://music.apple.com";
const indexPathPattern = /\/assets\/index(?!-legacy[-~])[-~][^/"\s<>]+\.js/;
const legacyIndexPathPattern = /\/assets\/index-legacy[-~][^/"\s<>]+\.js/;
const tokenPattern = /"(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)"/;

const log = logger.withTag("auth:devtoken");

export async function getAppleMusicDeveloperToken() {
  log.info("Apple Music Developer Token discovery started");

  const mainPageBody = await fetchText(appleMusicUrl, "main page");

  const indexJsPaths = [
    mainPageBody.match(legacyIndexPathPattern)?.[0],
    mainPageBody.match(indexPathPattern)?.[0],
  ].filter((path) => path !== undefined);
  if (!indexJsPaths.length) {
    log.error("Apple Music index script URL not found");
    throw new Error("Apple Music index script not found");
  }

  let lastError: unknown = new Error("Apple Music Developer Token not found");

  for (const indexJsPath of indexJsPaths) {
    log.info("Apple Music index script fetch started", { path: indexJsPath });

    try {
      const jsFileBody = await fetchText(`${appleMusicUrl}${indexJsPath}`, "JS file");
      const token = jsFileBody.match(tokenPattern)?.[1];
      if (!token) {
        lastError = new Error("Apple Music Developer Token not found");
        log.warn("Apple Music Developer Token not found in index script", { path: indexJsPath });
        continue;
      }

      log.info("Apple Music Developer Token discovered");

      return token;
    } catch (cause) {
      lastError = cause;
      log.warn("Apple Music index script fetch failed", { path: indexJsPath, cause });
    }
  }

  log.error("Apple Music Developer Token discovery failed");
  throw lastError;
}

async function fetchText(url: string, label: string) {
  const response = await fetch(url, {
    headers: {
      Origin: "",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${label}: ${response.status} ${response.statusText}`);
  }

  return await response.text();
}
