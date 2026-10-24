import { fetch } from "@tauri-apps/plugin-http";

const appleMusicUrl = "https://music.apple.com";
const indexPathPattern = /\/assets\/index(?!-legacy[-~])[-~][^/"\s<>]+\.js/;
const legacyIndexPathPattern = /\/assets\/index-legacy[-~][^/"\s<>]+\.js/;
const tokenPattern = /"(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)"/;

const log = logger.withTag("devtoken");

export async function getAppleMusicDeveloperToken() {
  log.info("Apple Music developer token discovery started");

  const mainPageBody = await fetchText(appleMusicUrl);

  const indexJsPaths = [
    mainPageBody.match(legacyIndexPathPattern)?.[0],
    mainPageBody.match(indexPathPattern)?.[0],
  ].filter((path) => path !== undefined);
  if (!indexJsPaths.length) {
    log.error("Apple Music index script URL not found");
    throw new Error("Apple Music index script not found");
  }

  let lastError: unknown = new Error("Apple Music developer token not found");

  for (const indexJsPath of indexJsPaths) {
    log.info("Apple Music index script fetch started", { path: indexJsPath });

    try {
      const jsFileBody = await fetchText(`${appleMusicUrl}${indexJsPath}`);
      const token = jsFileBody.match(tokenPattern)?.[1];
      if (!token) {
        lastError = new Error("Apple Music developer token not found");
        log.warn("Apple Music developer token not found in index script", {
          path: indexJsPath,
        });
        continue;
      }

      log.info("Apple Music developer token discovered");

      return token;
    } catch (cause) {
      lastError = cause;
    }
  }

  log.error("Apple Music developer token discovery failed");
  throw lastError;
}

async function fetchText(url: string) {
  const startedAt = performance.now();

  const response = await fetch(url, {
    headers: {
      Origin: "",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    log.error("Fetching text failed", {
      url,
      status: response.status,
      statusText: response.statusText,
      durationMs: Math.round(performance.now() - startedAt),
    });
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  } else {
    log.info("Fetched text", {
      url,
      status: response.status,
      durationMs: Math.round(performance.now() - startedAt),
    });
  }

  return await response.text();
}
