/**
 * Named icon set used by CMS-editable content (mission items, product features, etc.).
 * Each entry: { viewBox, paths: [svg path/shape markup strings] }.
 */
export const ICONS = {
  globe: { viewBox: '0 0 32 32', body: '<circle cx="16" cy="16" r="13"/><path d="M3 16h26M16 3c-6 7-6 19 0 26M16 3c6 7 6 19 0 26"/>' },
  badge: { viewBox: '0 0 32 32', body: '<rect x="4" y="6" width="24" height="20" rx="3"/><circle cx="16" cy="16" r="4"/><path d="M4 12h4M24 12h4M4 20h4M24 20h4"/>' },
  spark: { viewBox: '0 0 32 32', body: '<circle cx="16" cy="16" r="3"/><path d="M16 3v7M16 22v7M3 16h7M22 16h7M7 7l5 5M20 20l5 5M25 7l-5 5M12 20l-5 5"/>' },
  growth: { viewBox: '0 0 32 32', body: '<path d="M4 28h24M7 24v-6M13 24v-10M19 24v-14M25 24V6M21 8l4-3 3 4"/>' },
  sliders: { viewBox: '0 0 24 24', body: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>' },
  sun: { viewBox: '0 0 24 24', body: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>' },
  layers: { viewBox: '0 0 24 24', body: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17.5l9 5 9-5"/>' },
  layers2: { viewBox: '0 0 24 24', body: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>' },
  wrench: { viewBox: '0 0 24 24', body: '<path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>' },
  shield: { viewBox: '0 0 24 24', body: '<path d="M12 3l8 3v6c0 4.5-3.3 8-8 9-4.7-1-8-4.5-8-9V6z"/>' },
  shieldCheck: { viewBox: '0 0 24 24', body: '<path d="M12 3l8 3v6c0 4.5-3.3 8-8 9-4.7-1-8-4.5-8-9V6z"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>' },
  bolt: { viewBox: '0 0 24 24', body: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>' },
  drop: { viewBox: '0 0 24 24', body: '<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>' },
  check: { viewBox: '0 0 24 24', body: '<circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-7"/>' },
  gear: { viewBox: '0 0 24 24', body: '<path d="M19.4 13a7.5 7.5 0 000-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 00-1.7-1l-.4-2.6h-4l-.4 2.6a7.6 7.6 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7.5 7.5 0 000 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.4 2.6h4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/>' },
  target: { viewBox: '0 0 24 24', body: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>' },
  factory: { viewBox: '0 0 24 24', body: '<path d="M3 21V9l6 4V9l6 4V5l6 3v13z"/><path d="M7 17h2M11 17h2M15 17h2"/>' },
  truck: { viewBox: '0 0 24 24', body: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>' },
  star: { viewBox: '0 0 24 24', body: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>' },
  clock: { viewBox: '0 0 24 24', body: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
};

export const ICON_OPTIONS = Object.keys(ICONS).map((k) => ({ value: k, label: k }));
