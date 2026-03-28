/** Case- and whitespace-insensitive comparison for short answers. */
export function normalizeShortAnswer(s: string): string {
  let t = s.trim().toLowerCase();
  t = t.replace(/\s+/g, " ");
  t = t.replace(/[""''`]/g, "");
  t = t.replace(/[.,;:!?]+$/g, "");
  return t.trim();
}
