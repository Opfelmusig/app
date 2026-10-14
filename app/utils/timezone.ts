export function currentAppleTimezoneOffset() {
  const minutes = -new Date().getTimezoneOffset();
  const sign = minutes >= 0 ? "+" : "-";
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (absolute % 60).toString().padStart(2, "0");
  return `${sign}${hours}:${remainder}`;
}
