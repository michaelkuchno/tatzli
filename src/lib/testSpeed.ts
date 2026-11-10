/**
 * Time-lapse for automated tests only: `window.__tatzliSpeed = 16` makes every pause, wait and recording run 16× faster,
 * so a whole presentation can be watched to its end in seconds. Never set by the app itself (always 1 for children).
 */
export function timeLapse(): number {
  if (typeof window === 'undefined') return 1
  const s = Number((window as unknown as { __tatzliSpeed?: number }).__tatzliSpeed)
  return s > 1 ? Math.min(16, s) : 1
}
