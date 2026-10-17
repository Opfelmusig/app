export function clearPlaybackStorage() {
  localStorage.removeItem("opfelmusig:queue-store");
  localStorage.removeItem("opfelmusig:history-store");
  localStorage.removeItem("opfelmusig:playback:position");
}
