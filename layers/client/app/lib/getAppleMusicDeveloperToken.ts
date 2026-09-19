import { fetch } from "@tauri-apps/plugin-http";

const appleMusicUrl = "https://music.apple.com";
const indexPathPattern = /\/assets\/index-legacy[-~][^/]+\.js/;
const tokenPattern = /"(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)"/;

export async function getAppleMusicDeveloperToken() {
  const mainPageBody = await fetchText(appleMusicUrl, "main page");
  const indexJsPath = mainPageBody.match(indexPathPattern)?.[0];
  if (!indexJsPath) throw new Error("Apple Music index script not found");

  const jsFileBody = await fetchText(`${appleMusicUrl}${indexJsPath}`, "JS file");
  const token = jsFileBody.match(tokenPattern)?.[1];
  if (!token) throw new Error("Apple Music Developer Token not found");

  return token;
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
