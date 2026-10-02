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
    const issues = await page.evaluate(() => {
      const out = [];
      const inScroller = (e) => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth) return true; } return false; };
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
      return [...new Set(out)];
    });
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
