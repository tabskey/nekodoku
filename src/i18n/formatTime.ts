/** Seconds as MM:SS, the clock format of the design: "00:48", "01:05". */
export function formatTime(totalSeconds: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`;
}
