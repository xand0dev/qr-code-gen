// Builds a timestamped download filename in the format qr-code-YYYYMMDD-HHMMSS (local time).
export function downloadName(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `qr-code-${y}${m}${d}-${hh}${mm}${ss}`;
}