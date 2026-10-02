export function slugify(input = '') {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150);
}

export function formatDate(d, opts) {
  if (!d) return '';
  const date = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', opts || { day: '2-digit', month: 'short', year: 'numeric' });
}

export function splitList(str, sep = '|') {
  if (Array.isArray(str)) return str;
  if (!str) return [];
  return String(str)
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Very small sanitiser for admin-entered HTML: strips script/style tags and inline event handlers. */
export function sanitizeHtml(html = '') {
  return String(html)
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}
