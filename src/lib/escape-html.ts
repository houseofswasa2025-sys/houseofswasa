const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// For values interpolated into hand-built HTML (transactional emails).
// Customer-typed fields must never reach an email as raw markup.
export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ENTITIES[c]);
}
