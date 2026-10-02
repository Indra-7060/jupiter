// Captures every admin / site screen used by the guide. Requires the dev server on :3000.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const BASE = 'http://localhost:3000';
const OUT = 'shots';
const CHROME = process.env.CHROME || execSync('ls -d ~/.cache/puppeteer/chrome/*/chrome-mac-arm64/*.app/Contents/MacOS/* 2>/dev/null | tail -1').toString().trim();
const EMAIL = process.env.ADMIN_EMAIL || 'admin@jupiterclamps.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 860, deviceScaleFactor: 1.5 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const go = async (path, wait = 1200) => { await page.goto(BASE + path, { waitUntil: 'networkidle2' }); await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {}); await sleep(wait); };
const shot = async (name, opts = {}) => { await page.screenshot({ path: `${OUT}/${name}.png`, ...opts }); console.log('shot', name); };
const shotEl = async (name, selector, index = 0) => {
  const el = (await page.$$(selector))[index];
  if (!el) { console.log('MISSING', name, selector); return; }
  await el.evaluate((e) => e.scrollIntoView({ block: 'center' })); await sleep(300);
  await el.screenshot({ path: `${OUT}/${name}.png` }); console.log('shotEl', name);
};
const openGroups = () => page.evaluate(() => document.querySelectorAll('details.grp-box').forEach((d) => (d.open = true)));
const clickText = async (selector, text) => {
  const ok = await page.evaluate((sel, t) => { const el = [...document.querySelectorAll(sel)].find((e) => e.textContent.trim().startsWith(t)); if (el) { el.scrollIntoView({ block: 'center' }); el.click(); return true; } return false; }, selector, text);
  if (!ok) console.log('clickText MISSING', text);
  await sleep(500);
};
const fill = async (label, value, nth = 0) => {
  const ok = await page.evaluate((label, value, nth) => {
    const l = [...document.querySelectorAll('.fld > label')].filter((x) => x.textContent.replace('*', '').trim() === label)[nth];
    if (!l) return false;
    const fld = l.parentElement;
    const input = fld.querySelector('input:not([type=checkbox]):not([type=file]), textarea, select');
    const chk = fld.querySelector('input[type=checkbox]');
    if (chk) { if (!!value !== chk.checked) chk.click(); return true; }
    if (!input) return false;
    const proto = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : input.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, String(value));
    input.dispatchEvent(new Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    return true;
  }, label, value, nth);
  if (!ok) console.log('fill MISSING', label);
  await sleep(120);
};

// login
await go('/admin/login', 800); await shot('01-login');
await page.type('input[type=email]', EMAIL); await page.type('input[type=password]', PASSWORD);
await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('button.btn.p')]);
await sleep(1000);

// pages
await go('/admin/pages'); await shot('03-pages-list');
await go('/admin/pages/1'); await openGroups(); await sleep(300); await shot('04-page-form');
await go('/admin/pages/1/sections'); await shot('05-sections-list');
await clickText('.sec .ib', '▸'); await sleep(600); await openGroups();
await shotEl('06-section-hero-open', '.card.sec', 0);
await clickText('button.btn.sm', 'Browse / upload'); await sleep(1200); await shot('07-media-picker');
await clickText('.modal .btn', 'Close'); await sleep(300);
await shotEl('08-add-section', '.card:last-of-type .bd.row');
await go('/admin/pages/2/sections');
await page.evaluate(() => [...document.querySelectorAll('.sec .ib')].filter((b) => b.textContent.trim() === '▸')[2]?.click()); await sleep(600);
await shotEl('09-section-journey-list', '.card.sec', 2);

// products
await go('/admin/products'); await shot('14-products-list');
await go('/admin/products/1'); await openGroups(); await sleep(400);
await page.evaluate(() => window.scrollTo(0, 0)); await sleep(300); await shot('15-product-basics', { clip: { x: 0, y: 0, width: 1280, height: 520 } });
await shotEl('16-product-card', 'details.grp-box', 0);
await shotEl('17-product-hero', 'details.grp-box', 1);
await shotEl('18-product-features', 'details.grp-box', 2);
await shotEl('19-product-steps', 'details.grp-box', 3);
await go('/admin/products/6'); await openGroups(); await sleep(400);
await shotEl('21-product-materials', 'details.grp-box', 4);
await shotEl('22-product-industries', 'details.grp-box', 5);
await shotEl('23-product-seo', 'details.grp-box', 6);
await go('/admin/product-items'); await shot('24-product-items-list');
await page.evaluate(() => [...document.querySelectorAll('.acc-h')].find((b) => b.textContent.includes('T-Bolt'))?.click()); await sleep(600); await shot('24b-product-items-open');
await go('/admin/product-items/new?filter.categoryId=6');
await fill('Name', 'T-Bolt Clamp with Stainless Nut (TBS Type)');
await fill('Description', 'Heavy-duty T-bolt clamp with an AISI 304 nut and bridge, for silicone hose joints on charge-air and coolant lines.');
await fill('Image', '/images/clamp-card.jpg'); await fill('Order', 7); await fill('Published', true);
await sleep(300); await shot('25-product-item-new-filled');

// machines
await go('/admin/machines'); await shot('26-machines-list');
await go('/admin/machines/1'); await openGroups(); await sleep(400);
await page.evaluate(() => window.scrollTo(0, 0)); await sleep(300); await shot('27-machine-basics', { clip: { x: 0, y: 0, width: 1280, height: 520 } });
await shotEl('28-machine-hero', 'details.grp-box', 0);
await shotEl('29-machine-gallery', 'details.grp-box', 1);
await shotEl('30-machine-features', 'details.grp-box', 2);
await shotEl('31-machine-specs', 'details.grp-box', 3);
await go('/admin/pages/4/sections'); await clickText('.sec .ib', '▸'); await sleep(500); await shotEl('26b-machine-feature-section', '.card.sec', 0);

// careers
await go('/admin/jobs'); await shot('42-jobs-list');
await go('/admin/jobs/1'); await openGroups(); await sleep(300); await shot('43-job-form', { fullPage: true });
await go('/admin/applications'); await shot('44-applications-list');
const appHref = await page.evaluate(() => document.querySelector('.tbl tbody a')?.getAttribute('href'));
if (appHref) { await go(appHref); await shot('45-application-detail'); }
await go('/admin/pages/8/sections'); await page.evaluate(() => [...document.querySelectorAll('.sec .ib')].filter((b) => b.textContent.trim() === '▸')[1]?.click()); await sleep(600); await shotEl('46-careers-sections', '.card.sec', 1);

// posts
await go('/admin/posts'); await shot('32-posts-list');
await go('/admin/posts/new'); await openGroups();
await fill('Title', 'Jupiter Commissions New Automated Clamp Line at Rabale');
await fill('Category', 'Manufacturing'); await fill('Publish date', '2026-10-15'); await fill('Author / location', 'Jupiter Industrial Works Rabale');
await fill('Cover image', '/images/home-factory.jpg');
await fill('Excerpt', 'A new semi-automated assembly line doubles worm-drive clamp output and shortens lead times for OEM customers.');
await fill('Body (HTML)', '<p>Our Rabale plant has commissioned a new semi-automated assembly line for worm-drive and spring band clamps.</p>\n<h3>What changes for customers</h3>\n<ul>\n  <li>Lead times reduced from 4 weeks to 2 weeks</li>\n  <li>100% automated torque testing</li>\n</ul>\n<p>Contact <a href="/contact">our sales team</a> for details.</p>');
await fill('Published', true);
await fill('SEO title', 'New Automated Clamp Line at Rabale | Jupiter'); await fill('SEO description', 'Jupiter Industrial Works commissions a new semi-automated clamp assembly line at its Rabale plant.');
await sleep(300); await shot('33-post-new-filled', { fullPage: true });

// locations
await go('/admin/locations'); await shot('34-locations-list');
await go('/admin/locations/new');
await fill('Name', 'Sales Office Chennai'); await fill('Tag (city)', 'Chennai');
await fill('Address', '12, Industrial Estate Road, Ambattur, Chennai 600058.');
await fill('Phone', '+91 44 2625 1234'); await fill('Email', 'chennai@jupiterclamps.com');
await fill('Google Maps search text', 'Ambattur Industrial Estate, Chennai 600058'); await fill('Order', 3); await fill('Published', true);
await sleep(300); await shot('35-location-new-filled');

// enquiries
await go('/admin/enquiries'); await shot('36-enquiries-list');
const enqHref = await page.evaluate(() => document.querySelector('.tbl tbody a')?.getAttribute('href'));
if (enqHref) { await go(enqHref); await shot('37-enquiry-detail'); }
await go('/admin'); await shot('02-dashboard');

// media
await go('/admin/media'); await shot('38-media-library');

// settings
await go('/admin/settings');
const tabs = ['Site & branding', 'Header & navigation', 'Contact details', 'Social links', 'Footer', 'Bottom CTA banner'];
for (const [i, t] of tabs.entries()) { await clickText('.tabs button', t); await sleep(400); await openGroups(); await sleep(200); await shot(`39-settings-${i + 1}`, { fullPage: true }); }

// users
await go('/admin/users'); await shot('40-users-list');
await go('/admin/users/new');
await fill('Name', 'Priya Sharma'); await fill('Email', 'priya@jupiterclamps.com'); await fill('Password', 'StrongPass#2026'); await fill('Role', 'editor');
await sleep(300); await shot('41-user-new-filled');

// public site
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5 });
await go('/', 2000); await shot('50-site-home-hero');
await page.evaluate(() => window.scrollTo(0, document.querySelector('.dv')?.offsetTop - 60)); await sleep(1200); await shot('51-site-home-divisions');
await page.evaluate(() => window.scrollTo(0, document.querySelector('.cr')?.offsetTop - 60)); await sleep(1200); await shot('52-site-home-crafting');
await page.evaluate(() => window.scrollTo(0, document.querySelector('.cta3')?.offsetTop - 40)); await sleep(1200); await shot('53-site-cta-footer');
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await sleep(1200); await shot('54-site-footer');
await page.evaluate(() => window.scrollTo(0, 0)); await page.hover('.nav .nv:nth-of-type(2) > a'); await sleep(800); await shot('55-site-mega-menu');
await go('/about', 1500); await shot('56-site-about');
await go('/products', 1500); await shot('57-site-products');
await go('/products/v-band-clamps', 1500); await shot('58-site-product-detail');
await go('/products/t-bolt-clamps', 1500); await shot('59-site-product-grid-layout');
await go('/power-press', 1500); await shot('60-site-machine');
await page.evaluate(() => window.scrollTo(0, document.querySelector('#specs').getBoundingClientRect().top + window.scrollY - 60)); await sleep(1000); await shot('61-site-machine-specs');
await page.evaluate(() => window.scrollTo(0, document.querySelector('.pr3').getBoundingClientRect().top + window.scrollY - 140)); await sleep(1000); await shot('61b-site-machine-grid');
await go('/press', 1500); await shot('62-site-press');
const firstPost = await page.evaluate(() => document.querySelector('.prow')?.getAttribute('href'));
await go(firstPost || '/press', 1500); await shot('63-site-post');
await go('/careers', 1800); await shot('66-site-careers');
await page.evaluate(() => [...document.querySelectorAll('.job .cb')][0]?.click()); await sleep(700); await shot('67-site-apply-modal');
await page.keyboard.press('Escape'); await page.evaluate(() => document.querySelector('.apply-close')?.click()); await sleep(300);
await page.evaluate(() => window.scrollTo(0, document.querySelector('.cvsec').getBoundingClientRect().top + window.scrollY - 60)); await sleep(1000); await shot('68-site-cv-form');
await go('/contact', 2500); await shot('64-site-contact');
await page.evaluate(() => window.scrollTo(0, document.querySelector('.fsec')?.offsetTop - 60)); await sleep(1000); await shot('65-site-contact-form');

await browser.close();
console.log('done');
