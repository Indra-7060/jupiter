/**
 * Resolve the link of a call-to-action button.
 * - Buttons labelled "… Quote …" that still point at /contact (content saved before the quote page existed)
 *   go to /quote instead, so the Request-a-Quote flow works even before `db:sync-content` has run.
 * - A "/quote" link gets ?product=… so the quote form pre-selects what the visitor was looking at.
 */
export function quoteHref(href, product, label) {
  let h = href;
  if ((h === '/contact' || h === '/contact/') && /quot/i.test(label || '')) h = '/quote';
  if (!h || !h.startsWith('/quote') || h.includes('?') || !product) return h;
  return `/quote?product=${encodeURIComponent(product)}`;
}

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
