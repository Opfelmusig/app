export function clearSessionStorage() {
  localStorage.removeItem("opfelmusig:queue-store:v2");
  localStorage.removeItem("opfelmusig:history-store:v2");
  localStorage.removeItem("opfelmusig:playback:position");
  localStorage.removeItem("opfelmusig:search-history");
}
