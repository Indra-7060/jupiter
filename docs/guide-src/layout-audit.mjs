// Finds clipped button labels, horizontal page overflow and elements sticking out of cards, across pages and widths.
import puppeteer from 'puppeteer-core';
import { execSync } from 'node:child_process';
const CHROME = execSync('ls -d ~/.cache/puppeteer/chrome/*/chrome-mac-arm64/*.app/Contents/MacOS/* 2>/dev/null | tail -1').toString().trim();
const BASE = process.env.BASE || 'http://localhost:3000';
const PAGES = ['/', '/about', '/products', '/products/v-band-clamps', '/products/worm-drive-clamps', '/products/spring-band-clamps', '/products/strap-bands', '/products/pipe-fitting-clips', '/products/t-bolt-clamps', '/products/muffler-clamps', '/products/customised-clamps', '/power-press', '/power-press/duplex-power-press', '/power-press/hydraulic-power-press', '/press', '/press/our-founding-story', '/careers', '/contact'];
const WIDTHS = (process.env.WIDTHS || '1920,1440,1280,1024,820,390').split(',').map(Number);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
let total = 0;
for (const w of WIDTHS) {
  await page.setViewport({ width: w, height: 900 });
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'networkidle2' });
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important} .rv{opacity:1!important;transform:none!important} *{animation-duration:0s!important;transition:none!important}' });
    await new Promise((r) => setTimeout(r, 250));
    let issues = await page.evaluate(() => {
      const out = [];
      const inScroller = (e) => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if ((o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') && p.scrollWidth > p.clientWidth + 1 && p.getBoundingClientRect().right <= innerWidth + 1) return true; } return false; };
      const label = (e) => (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : e.tagName.toLowerCase());
      const txt = (e) => (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      // 1. page-level horizontal overflow
      const sw = document.documentElement.scrollWidth;
      if (sw > innerWidth + 1) {
        const culprits = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed' && !inScroller(e); })
          .filter((e) => ![...e.children].some((c) => c.getBoundingClientRect().right > innerWidth + 1)).slice(0, 4).map((e) => `${label(e)} "${txt(e)}" right=${Math.round(e.getBoundingClientRect().right)}`);
        out.push(`PAGE OVERFLOW scrollWidth=${sw} > ${innerWidth}: ${culprits.join(' | ')}`);
      }
      // 2. clipped animated-button labels
      for (const tx of document.querySelectorAll('.cb .tx')) {
        const b = tx.querySelector('b'); if (!b || !tx.offsetParent) continue;
        if (b.scrollWidth > tx.clientWidth + 2) out.push(`CLIPPED BUTTON "${txt(b)}" text=${b.scrollWidth} box=${tx.clientWidth}`);
      }
      // 3. children sticking out of card-like containers
      const cards = document.querySelectorAll('.job, .pc3, .ccard, .ucard, .apps-grid > div, .vkg > div, .vsg > div, .cc, .dc, .fwrap, .apply-modal, .indg > div, .glg > a, .prow, .four2 > div, .mf, .erow');
      for (const c of cards) {
        if (!c.offsetParent) continue;
        const cr = c.getBoundingClientRect(); if (!cr.width) continue;
        for (const ch of c.querySelectorAll('*')) {
          const r = ch.getBoundingClientRect(); if (!r.width || !r.height) continue;
          if (getComputedStyle(ch).position === 'absolute') continue;
          if (r.right > cr.right + 2 || r.left < cr.left - 2) { out.push(`OUT OF CARD ${label(c)} > ${label(ch)} "${txt(ch)}" (${Math.round(r.left)}-${Math.round(r.right)} vs card ${Math.round(cr.left)}-${Math.round(cr.right)})`); break; }
        }
      }
      // 4. text overflowing its own box horizontally (headings, chips)
      for (const e of document.querySelectorAll('h1,h2,h3,h4,.kick,.job-meta span,.chips span,.mats span,.tg a,.hv-hl li,.badge')) {
        if (!e.offsetParent) continue;
        if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX !== 'visible') out.push(`TEXT CLIPPED ${label(e)} "${txt(e)}"`);
        const r = e.getBoundingClientRect(); if (r.right > innerWidth + 1 && !inScroller(e)) out.push(`OFFSCREEN ${label(e)} "${txt(e)}" right=${Math.round(r.right)}`);
      }
      // 5. header: logo, menu and button must not overlap or leave the screen
      const hdrParts = ['.hdr .logo', '.hdr .nav', '.hdr .cb', '.hdr .burger'].map((q) => document.querySelector(q)).filter((e) => e && e.offsetParent && getComputedStyle(e).display !== 'none' && getComputedStyle(e).position !== 'fixed');
      for (let i = 0; i < hdrParts.length; i++) {
        const a = hdrParts[i].getBoundingClientRect();
        if (a.right > innerWidth + 1 || a.left < -1) out.push(`HEADER OFFSCREEN ${label(hdrParts[i])}`);
        for (let j = i + 1; j < hdrParts.length; j++) { const b = hdrParts[j].getBoundingClientRect(); if (a.width && b.width && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) out.push(`HEADER OVERLAP ${label(hdrParts[i])} / ${label(hdrParts[j])}`); }
      }
      const links = [...document.querySelectorAll('.hdr .nav > a, .hdr .nav .nv > a')].filter((a) => a.offsetParent && innerWidth > 900);
      const tops = new Set(links.map((a) => Math.round(a.getBoundingClientRect().top)));
      if (tops.size > 1) out.push(`MENU WRAPS onto ${tops.size} lines`);
      return [...new Set(out)];
    });
    // 6. dropdowns (desktop): open each, check it fits the screen and the cards are equal
    if (p === '/' && w > 900) {
      for (const nv of await page.$$('.hdr .nv')) {
        const r = await nv.evaluate((n) => {
          const m = n.querySelector('.mega'); m.style.setProperty('opacity', '1', 'important'); m.style.setProperty('visibility', 'visible', 'important'); m.style.setProperty('transform', 'none', 'important');
          const mr = m.getBoundingClientRect(); const cards = [...m.querySelectorAll('ul.mg li')].map((l) => l.getBoundingClientRect());
          const res = { name: n.querySelector('a').textContent.trim(), bottom: Math.round(mr.bottom), sizes: new Set(cards.map((c) => Math.round(c.width) + 'x' + Math.round(c.height))).size, off: cards.filter((c) => c.right > innerWidth || c.left < 0).length, perRow: cards.filter((c) => Math.abs(c.top - cards[0].top) < 2).length };
          ['opacity', 'visibility', 'transform'].forEach((k) => m.style.removeProperty(k)); return res;
        });
        const bad = [];
        if (r.bottom > 900) bad.push(`taller than the screen (${r.bottom}px)`);
        if (r.sizes > 1) bad.push('unequal cards');
        if (r.off) bad.push(`${r.off} cards off-screen`);
        if (r.perRow !== Math.min(4, r.perRow)) bad.push(`${r.perRow} per row`);
        if (bad.length) issues.push(`DROPDOWN ${r.name}: ${bad.join(', ')}`);
      }
    }
    // 7. phone menu: open it and check nothing sticks out
    if (p === '/' && w <= 900) {
      const r = await page.evaluate(async () => {
        document.querySelector('.burger')?.click(); await new Promise((x) => setTimeout(x, 300));
        document.querySelectorAll('.nav .nv > a')[1]?.click(); await new Promise((x) => setTimeout(x, 300));
        const nav = document.querySelector('.nav'); const bad = [...nav.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.width && (b.right > innerWidth + 1 || b.left < -1); }).length;
        return { bad, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      if (r.bad || r.overflow) issues.push(`PHONE MENU: ${r.bad} items off-screen${r.overflow ? ', page overflows' : ''}`);
    }
    if (issues.length) { total += issues.length; console.log(`\n[${w}px] ${p}`); issues.forEach((i) => console.log('  - ' + i)); }
  }
}
// apply modal
await page.setViewport({ width: 1280, height: 900 });
await page.goto(BASE + '/careers', { waitUntil: 'networkidle2' });
await page.evaluate(() => document.querySelector('.job .cb')?.click()); await new Promise((r) => setTimeout(r, 400));
const m = await page.evaluate(() => { const md = document.querySelector('.apply-modal'); if (!md) return 'no modal'; const r = md.getBoundingClientRect(); const bad = [...md.querySelectorAll('*')].filter((e) => e.getBoundingClientRect().right > r.right + 2).map((e) => e.className || e.tagName); return bad.length ? 'MODAL OVERFLOW ' + bad.slice(0, 3).join(',') : 'modal ok'; });
console.log('\n' + m);
console.log(`\nTOTAL ISSUES: ${total}`);
await browser.close();
