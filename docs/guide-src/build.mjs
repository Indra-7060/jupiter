// Builds ../Jupiter-CMS-Admin-Guide.pdf from the admin schemas + screenshots in ./shots (run shoot.mjs first).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const PROJ = path.resolve('../..');
const CHROME = process.env.CHROME || execSync('ls -d ~/.cache/puppeteer/chrome/*/chrome-mac-arm64/*.app/Contents/MacOS/* 2>/dev/null | tail -1').toString().trim();
const { SECTION_TYPES } = await import(pathToFileURL(path.join(PROJ, 'src/lib/sectionSchemas.js')));
const { RESOURCES, SETTINGS_SCHEMA } = await import(pathToFileURL(path.join(PROJ, 'src/lib/resources.js')));
const seed = await import(pathToFileURL(path.join(PROJ, 'src/lib/seed-data.js')));

/* ---- convert PNG screenshots to downscaled JPEGs (macOS sips) ---- */
fs.mkdirSync('jpg', { recursive: true });
for (const f of fs.readdirSync('shots').filter((x) => x.endsWith('.png'))) {
  const out = path.join('jpg', f.replace(/\.png$/, '.jpg'));
  if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < fs.statSync(path.join('shots', f)).mtimeMs) {
    execSync(`sips -Z 1500 -s format jpeg -s formatOptions 75 "shots/${f}" --out "${out}"`, { stdio: 'ignore' });
  }
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const img = (name, caption, cls = '') => {
  const p = path.resolve('jpg', name + '.jpg');
  if (!fs.existsSync(p)) return `<p class="missing">[missing screenshot ${name}]</p>`;
  return `<figure class="${cls}"><div class="imgwrap"><img src="file://${p}"></div>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
};
const dims = (p) => { const o = execSync(`sips -g pixelWidth -g pixelHeight "${p}"`).toString(); return { w: +o.match(/pixelWidth: (\d+)/)[1], h: +o.match(/pixelHeight: (\d+)/)[1] }; };
const tallImg = (name, caption) => {
  const p = path.resolve('jpg', name + '.jpg');
  if (!fs.existsSync(p)) return `<p class="missing">[missing ${name}]</p>`;
  const { w, h } = dims(p);
  if (h < w * 1.4) return img(name, caption);
  const half = Math.ceil(h / 2);
  for (const [sfx, off] of [['a', 0], ['b', half]]) {
    execSync(`sips -c ${Math.min(half, h - off)} ${w} --cropOffset ${off} 0 "${p}" --out "${path.resolve('jpg', `${name}-${sfx}.jpg`)}"`, { stdio: 'ignore' });
  }
  return `<div class="pair split"><figure><div class="imgwrap"><img src="file://${path.resolve('jpg', name + '-a.jpg')}"></div><figcaption>${caption} (top half)</figcaption></figure><figure><div class="imgwrap"><img src="file://${path.resolve('jpg', name + '-b.jpg')}"></div><figcaption>(bottom half)</figcaption></figure></div>`;
};
const pair = (a, ca, b, cb) => `<div class="pair">${img(a, ca)}${img(b, cb)}</div>`;

const TYPE_LABEL = { text: 'Single-line text', textarea: 'Multi-line text', html: 'HTML editor (with Preview)', number: 'Number', boolean: 'On / Off switch', select: 'Dropdown', image: 'Image (Browse / upload or paste URL)', video: 'Video file (Browse / upload)', file: 'File', list: 'Repeatable list', tags: 'Comma-separated list', relation: 'Dropdown linked to another record', date: 'Date picker', password: 'Password', slug: 'URL slug', object: 'Group of fields', json: 'JSON' };
const typeText = (f) => {
  let t = TYPE_LABEL[f.type] || f.type;
  if (f.type === 'select' && f.options) t += ': ' + f.options.map((o) => o.label).join(' / ');
  if (f.type === 'relation') t = `Dropdown of ${RESOURCES[f.resource]?.label || f.resource}`;
  if (f.required) t += ' <span class="req">required</span>';
  if (f.readOnly) t += ' <span class="ro">read-only</span>';
  return t;
};

const EX = {
  'section:page_title': { title: 'Careers at Jupiter', ghost: 'Careers' },
  'section:rich_text': { heading: 'Join our team', html: '<p>We are hiring <b>design engineers</b> and CNC operators for our Pune unit.</p><h3>How to apply</h3><ul><li>Email your CV to hr@jupiterclamps.com</li><li>Mention the role in the subject line</li></ul>', narrow: true },
  'section:journey': { background: '/images/timeline-bg.jpg' },
  'section:machine_feature': { machineId: 'Single Power Press' },
  'section:job_openings': {}, 'section:cv_form': {},
  'section:machines_grid': { title: 'Power Press Range', ghost: 'Power Press', linkLabel: 'View machine →' },
  'resource:products': { metaTitle: 'V-Band Clamps | Jupiter Industrial Works', metaDescription: 'Leak-proof V-band couplings for turbochargers, exhaust and engine joints. Standard and custom designs.' },
  'resource:product-items': { categoryId: 'T-Bolt Clamps', name: 'T-Bolt Clamp with Stainless Nut (TBS Type)', description: 'Heavy-duty T-bolt clamp with an AISI 304 nut and bridge, for silicone hose joints on charge-air and coolant lines.', image: '/images/clamp-card.jpg', href: '(leave blank, or e.g. /contact)', order: 7, published: true },
  'resource:machines': { metaTitle: 'Single Power Press 5–100 Ton | Jupiter', metaDescription: 'C-frame single power presses from 5 to 100 Ton with hardened and ground components.' },
  'resource:posts': { title: 'Jupiter Commissions New Automated Clamp Line at Rabale', category: 'Manufacturing', publishedAt: '2026-10-15', author: 'Jupiter Industrial Works Rabale', image: '/images/home-factory.jpg', excerpt: 'A new semi-automated assembly line doubles worm-drive clamp output and shortens lead times for OEM customers.', body: '<p>Our Rabale plant has commissioned a new semi-automated assembly line…</p><h3>What changes for customers</h3><ul><li>Lead times reduced from 4 weeks to 2 weeks</li></ul>', published: true, metaTitle: 'New Automated Clamp Line at Rabale | Jupiter', metaDescription: 'Jupiter Industrial Works commissions a new semi-automated clamp assembly line at its Rabale plant.' },
  'resource:locations': { name: 'Sales Office Chennai', tag: 'Chennai', address: '12, Industrial Estate Road, Ambattur, Chennai 600058.', phone: '+91 44 2625 1234', email: 'chennai@jupiterclamps.com', mapQuery: 'Ambattur Industrial Estate, Chennai 600058', order: 3, published: true },
  'resource:pages': { title: 'Careers', slug: 'careers', published: true, showCta: true, metaTitle: 'Careers | Jupiter Industrial Works', metaDescription: 'Join Jupiter Industrial Works — open roles at Shrivardhan, Rabale and Pune.' },
  'resource:users': { name: 'Priya Sharma', email: 'priya@jupiterclamps.com', password: 'StrongPass#2026', role: 'Editor' },
  'resource:enquiries': { name: 'Rahul Mehta', email: 'rahul.mehta@acmemotors.in', phone: '+91 98200 11223', organization: 'ACME Motors Pvt Ltd', unit: 'Pune unit', status: 'Read', message: 'We need 2,000 pcs of 60-70 mm T-Bolt clamps in AISI 304…' },
  'settings:site': { favicon: '/images/logo.png', catalogUrl: '/uploads/jupiter-catalog-2026.pdf' },
  'settings:header': { extraLinks: [{ label: 'Careers', href: '/careers' }] },
};
const seedSection = (type) => { for (const p of seed.pages) { const s = p.sections.find((x) => x.type === type); if (s) return s.data; } return null; };
const seedResource = { products: seed.productCategories[0], machines: seed.machines[0], locations: seed.locations[0], posts: seed.posts[1] };
const fmt = (v, f) => {
  if (f && f.type === 'select' && f.options) { const o = f.options.find((x) => x.value === v); if (o) return esc(o.label); }
  if (v === undefined || v === null || v === '') return '<span class="dim">(empty)</span>';
  if (typeof v === 'boolean') return v ? 'Yes (on)' : 'No (off)';
  if (Array.isArray(v)) return v.every((x) => typeof x !== 'object') ? esc(v.join(', ')) : `<span class="dim">${v.length} item${v.length === 1 ? '' : 's'} — see rows below</span>`;
  if (typeof v === 'object') return '<span class="dim">see rows below</span>';
  const s = String(v); return esc(s.length > 220 ? s.slice(0, 220) + '…' : s);
};
function fieldRows(fields, data, exMap, depth = 0) {
  let out = '';
  for (const f of fields) {
    const dv = data?.[f.name]; const empty = dv === undefined || dv === null || dv === '' || (Array.isArray(dv) && !dv.length);
    const v = !empty ? dv : exMap?.[f.name] !== undefined ? exMap[f.name] : dv;
    const pad = depth ? `style="padding-left:${depth * 14 + 8}px"` : '';
    out += `<tr><td ${pad}>${depth ? '↳ ' : ''}<b>${esc(f.label)}</b></td><td>${typeText(f)}</td><td>${esc(f.help || '')}</td><td class="ex">${fmt(v, f)}</td></tr>`;
    if ((f.type === 'list' || f.type === 'object') && f.fields) out += fieldRows(f.fields, f.type === 'list' ? (Array.isArray(v) ? v[0] : null) : v, null, depth + 1);
  }
  return out;
}
const table = (fields, data, exMap) => `<table class="fields"><thead><tr><th>Field</th><th>Control</th><th>Notes</th><th>Example value</th></tr></thead><tbody>${fieldRows(fields, data, exMap)}</tbody></table>`;
const groupedTables = (fields, data, exMap) => {
  const groups = []; for (const f of fields) { const g = f.group || ''; let b = groups.find((x) => x.name === g); if (!b) { b = { name: g, fields: [] }; groups.push(b); } b.fields.push(f); }
  return groups.map((g) => `${g.name ? `<h4>${esc(g.name)}</h4>` : ''}${table(g.fields, data, exMap)}`).join('');
};
const STEP = (items) => `<ol class="steps">${items.map((i) => `<li>${i}</li>`).join('')}</ol>`;
const NOTE = (t, kind = 'tip') => `<div class="note ${kind}">${t}</div>`;

let h = '';
const H1 = (t, sub) => (h += `<section class="chapter"><h1>${t}</h1>${sub ? `<p class="lead">${sub}</p>` : ''}`);
const END = () => (h += '</section>');
const H2 = (t) => (h += `<h2>${t}</h2>`);
const P = (t) => (h += `<p>${t}</p>`);
const RAW = (t) => (h += t);

h += `<section class="cover"><div class="brand"><img src="file://${PROJ}/public/images/logo.png"></div>
<h1>Admin Panel<br>User Guide</h1><p class="sub">Jupiter Industrial Works website</p>
<p class="meta">Version 1.1 · October 2026<br>Covers every screen, every field, with example data</p></section>`;

h += `<section class="chapter toc"><h1>Contents</h1><ol>
<li>Getting started</li><li>How the website maps to the admin panel</li><li>Form controls explained</li><li>Dashboard</li>
<li>Pages &amp; sections</li><li>Section types reference</li><li>Navigation menu (automatic)</li><li>Product categories &amp; product items</li>
<li>Power presses</li><li>Press / Insights (posts)</li><li>Careers: job openings &amp; applications</li><li>Locations</li><li>Enquiries</li><li>Media library</li><li>Site settings</li>
<li>Admin users</li><li>Tips, rules &amp; troubleshooting</li><li>Appendix: quick reference</li></ol></section>`;

H1('1. Getting started', 'Where the admin panel lives, how to sign in, and what you see first.');
H2('1.1 Opening the admin panel');
P('The admin panel is part of the website itself. Open your website address followed by <code>/admin</code>. On the development machine this is <code>http://localhost:3000/admin</code>. On the live site it will be <code>https://your-domain.com/admin</code>.');
P('If you are not signed in you are redirected to the sign-in page automatically.');
RAW(img('01-login', 'The sign-in screen.'));
H2('1.2 Signing in');
RAW(STEP(['Type your admin <b>e-mail</b> (example: <code>admin@jupiterclamps.com</code>).', 'Type your <b>password</b>.', 'Press <b>Sign in</b>. You land on the Dashboard.']));
RAW(NOTE('The first admin account is created when the site is installed, from the <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> values in the server\'s <code>.env.local</code> file. Change that password after the first sign-in (see chapter 15).', 'warn'));
P('After 10 wrong attempts from the same computer the sign-in is blocked for 15 minutes. A session stays valid for 7 days; use <b>Logout</b> (bottom of the sidebar) to end it earlier.');
H2('1.3 The layout');
RAW(img('02-dashboard', 'Sidebar on the left (all sections of the admin), work area on the right. "View site ↗" opens the public website in a new tab.'));
P('The sidebar is grouped into <b>Overview</b> (Dashboard, Enquiries), <b>Content</b> (Pages &amp; sections, Press / Insights, Media library), <b>Careers</b> (Job openings, Applications), <b>Catalogue</b> (Product categories, Product items, Power presses, Locations) and <b>System</b> (Site settings, Admin users). On small screens the sidebar collapses behind a <b>☰ Menu</b> button.');
END();

H1('2. How the website maps to the admin panel', 'Every visible part of the public website is edited in exactly one place. Use this table to find it.');
RAW(`<table class="map"><thead><tr><th>What you see on the website</th><th>Where to edit it</th></tr></thead><tbody>
<tr><td>Logo, browser-tab title, favicon, catalog download link</td><td>Site settings → Site &amp; branding</td></tr>
<tr><td>Top navigation links and the two drop-down menus</td><td>Generated automatically from Product categories and Power presses; labels and panel texts in Site settings → Header &amp; navigation</td></tr>
<tr><td>"Request a Quote" button in the header</td><td>Site settings → Header &amp; navigation</td></tr>
<tr><td>Home page: video hero, marquee strips, divisions, vision, mission, stats, industries, "Built to Scale" slider</td><td>Pages &amp; sections → Home → Sections</td></tr>
<tr><td>About page: hero, expertise rows, journey timeline, certifications</td><td>Pages &amp; sections → About Us → Sections</td></tr>
<tr><td>Products page (grid of clamp ranges)</td><td>Product categories (one record per card); page title in Pages → Clamps Product Range</td></tr>
<tr><td>A clamp range page, e.g. /products/v-band-clamps (overview, features, steps, designs, materials, industries)</td><td>Product categories → that record; the design cards are Product items</td></tr>
<tr><td>Power press page /power-press (featured press in full, then the range) and each press's own page</td><td>Power presses (one record per machine); the featured press is chosen in Pages → Power Press Range → Sections</td></tr>
<tr><td>Insights list and article pages (/press)</td><td>Press / Insights</td></tr>
<tr><td>Contact page: three plant cards with maps</td><td>Locations</td></tr>
<tr><td>Contact page: enquiry form texts and unit options</td><td>Pages &amp; sections → Contact Us → "Enquiry form" section</td></tr>
<tr><td>Messages sent through the enquiry form</td><td>Enquiries</td></tr>
<tr><td>Careers page: list of openings, Apply forms, "Send us your CV" form</td><td>Careers → Job openings (the cards); Pages → Careers → Sections (texts); applications arrive under Careers → Applications and by e-mail to HR</td></tr>
<tr><td>"Ready to Integrate Jupiter" banner above the footer</td><td>Site settings → Bottom CTA banner</td></tr>
<tr><td>Footer text, link columns, address, phone, e-mail, social icons</td><td>Site settings → Footer / Contact details / Social links</td></tr>
<tr><td>Pictures, videos, PDFs</td><td>Media library (or the Browse / upload button next to any image field)</td></tr>
<tr><td>Who can sign in to the admin</td><td>Admin users</td></tr>
</tbody></table>`);
RAW(NOTE('Everything you save is <b>live immediately</b> on the public website. There is no separate "publish" step, except the Published / Enabled switches that let you hide a record or a section.', 'tip'));
END();

H1('3. Form controls explained', 'All admin forms are built from the same small set of controls. Learn them once.');
RAW(img('06-section-hero-open', 'A typical form (the Home hero section): text fields, two media fields with a thumbnail preview, and a repeatable "Buttons" list with two items.'));
RAW(`<table class="map"><thead><tr><th>Control</th><th>How it works</th></tr></thead><tbody>
<tr><td><b>Single-line text</b></td><td>Short text such as a title or a link. A red <span class="req">*</span> after the label means it is required.</td></tr>
<tr><td><b>Multi-line text</b></td><td>Longer paragraphs. Line breaks are kept. In the About hero, a <i>blank line</i> starts a new paragraph.</td></tr>
<tr><td><b>HTML editor</b></td><td>For article bodies and free text blocks. Write simple HTML tags (<code>&lt;p&gt;</code>, <code>&lt;h3&gt;</code>, <code>&lt;ul&gt;&lt;li&gt;</code>, <code>&lt;a href&gt;</code>, <code>&lt;img src&gt;</code>). Click <b>Preview</b> to see the result. Scripts are removed automatically for safety.</td></tr>
<tr><td><b>Number</b></td><td>Whole numbers, e.g. the display <b>Order</b> (lower numbers come first).</td></tr>
<tr><td><b>On / Off switch</b></td><td>Green = on. Used for <b>Published</b> / <b>Enabled</b> (visible on the site) and option flags.</td></tr>
<tr><td><b>Dropdown</b></td><td>Pick one option from a fixed list (for example an icon name or a button style).</td></tr>
<tr><td><b>Image / Video field</b></td><td>Shows a thumbnail, the file path, and three buttons: <b>Browse / upload</b> (opens the Media library picker), <b>Open</b> (view the file) and <b>Clear</b>. You may also type a path such as <code>/images/logo.png</code> or paste a full <code>https://…</code> address.</td></tr>
<tr><td><b>Repeatable list</b></td><td>A stack of items (buttons, cards, rows…). Each item has a header with <b>▾</b> collapse, <b>↑ ↓</b> move, <b>⧉</b> duplicate and <b>✕</b> remove. Use <b>+ Add …</b> at the bottom to add an item.</td></tr>
<tr><td><b>Comma-separated list</b></td><td>Type values separated by commas: <code>AISI 304, AISI 316 L, SAE 1010</code>. Each value becomes one chip / badge on the site.</td></tr>
<tr><td><b>Linked dropdown</b></td><td>Chooses a related record, e.g. the Category of a product item or the featured Power press.</td></tr>
<tr><td><b>Date picker</b></td><td>Pick a calendar date (publish date of a post).</td></tr>
<tr><td><b>Page address</b></td><td>Product ranges, presses and posts get their web address automatically from the name (<code>/products/<b>v-band-clamps</b></code>). It is kept when you rename, so links never break. Only custom pages have an editable slug.</td></tr>
<tr><td><b>Group boxes</b></td><td>Long forms are split into collapsible boxes (Listing card, Overview hero, SEO…). Click a box title to open or close it.</td></tr>
</tbody></table>`);
RAW(img('07-media-picker', 'The Media library picker, opened from any Browse / upload button: drag files in, press Upload, click a tile to choose it, or paste an external URL and press Use URL.'));
H2('3.1 Saving');
P('Every form has a blue <b>Save</b> button at the top right (sections have <b>Save section</b> at the bottom of the open section). A small black toast at the bottom right confirms <b>Saved</b>; a red toast shows the reason if something was refused (for example a missing required field). In the sections editor an orange <b>unsaved</b> pill reminds you that a section has changes that are not saved yet.');
RAW(NOTE('<b>Delete</b> buttons ask for confirmation and cannot be undone. Prefer switching <b>Published</b> / <b>Enabled</b> off if you may need the content later.', 'warn'));
END();

H1('4. Dashboard', 'A quick overview of the content and the latest enquiries.');
RAW(img('02-dashboard', 'Counters are clickable shortcuts. The "Enquiries" counter shows how many are still new. The table lists the six latest enquiries.'));
P('The <b>Enquiries</b> entry in the sidebar also shows an orange badge with the number of unread enquiries.');
END();

H1('5. Pages &amp; sections', 'A page is a list of sections. You edit the page details (title, SEO) in one place and its sections in another.');
H2('5.1 Pages list');
RAW(img('03-pages-list', 'Six system pages are created at installation (Home, About Us, Clamps Product Range, Power Press Range, Press, Contact Us). System pages cannot be deleted. "Sections" edits the content, "View ↗" opens the page on the site.'));
H2('5.2 Page settings');
RAW(img('04-page-form', 'Page settings for the Home page.'));
RAW(table(RESOURCES.pages.fields, null, EX['resource:pages']));
RAW(NOTE('The slug <code>home</code> is the front page. Custom pages are served at <code>/&lt;slug&gt;</code>, e.g. slug <code>careers</code> → <code>/careers</code>. The slug of a system page cannot be changed.', 'tip'));
H2('5.3 Sections editor');
RAW(img('05-sections-list', 'The Home page has eight sections. Each row shows its type, a short preview, an Enabled switch, ↑ ↓ reorder arrows and ✕ remove.'));
RAW(STEP(['Click the <b>▸</b> arrow of a section to open its fields.', 'Edit the fields.', 'Press <b>Save section</b>. Each section is saved separately.', 'Use the <b>switch</b> to hide a section without deleting it; use <b>↑ ↓</b> to change the order on the page (saved instantly).', 'To add a section choose a type in the box at the bottom and press <b>+ Add section</b>; it appears last and opens for editing. Fill it in and save it — an empty section is simply not shown on the site.']));
RAW(img('08-add-section', 'The add-section box. The grey text explains the selected type.'));
H2('5.4 Creating a brand-new page (example: Careers)');
RAW(STEP(['Go to <b>Pages &amp; sections → + New page</b>. Title <code>Careers</code>, leave the slug blank (it becomes <code>careers</code>), Published on, Show bottom CTA banner on. Save.', 'Press <b>Edit sections</b>. Add a <b>Page title</b> section: Title <code>Careers at Jupiter</code>, Ghost text <code>Careers</code>. Save section.', 'Add a <b>Rich text</b> section with the job description HTML (see the example in chapter 6). Save section.', 'Open <code>/careers</code> on the site to check. To put it in the top navigation, add an Extra link in Site settings → Header &amp; navigation with Label <code>Careers</code> and Link <code>/careers</code>.']));
END();

H1('6. Section types reference', `All ${Object.keys(SECTION_TYPES).length} section types, every field, with example values taken from the live site.`);
const sectionShots = {
  hero_video: ['06-section-hero-open', '50-site-home-hero', 'Admin: the Headline, Sub-line, Video, Poster and Buttons fields.', 'Website: the same values rendered as the Home hero. Button 1 is "Primary (blue)", button 2 is "White".'],
  divisions: [null, '51-site-home-divisions', null, 'Website: "Two Divisions." is the Heading, "One Standard." the accent. Each card has a title, text, tag links, an arrow link and a cut-out image. The first card is marked "Wide card".'],
  crafting: [null, '52-site-home-crafting', null, 'Website: heading + accent, the five animated Stats, the two ghost words, the manufacturer blurb and the numbered Industry rows (images expand on hover).'],
  journey: ['09-section-journey-list', '56-site-about', 'Admin: the Milestones list — each item has a Tab label, Title, Text and Image.', 'Website (About page): the hero section above, then the timeline built from the Milestones.'],
  product_grid: [null, '57-site-products', null, 'Website: the Title and Ghost text come from this section; the cards come from Product categories (chapter 8).'],
  machine_feature: ['26b-machine-feature-section', '60-site-machine', 'Admin: choose which press is shown in full on the Power Press page.', 'Website: the featured press — hero, gallery, features and specification table — exactly as on each press\'s own page.'],
  machines_grid: [null, '61b-site-machine-grid', null, 'Website: the range grid below the featured press; cards come from Power presses (chapter 9).'],
  job_openings: ['46-careers-sections', '66-site-careers', 'Admin: the texts of the openings block.', 'Website: the openings cards come from Careers → Job openings; each has an Apply Now button.'],
  cv_form: [null, '68-site-cv-form', null, 'Website: the general "Send us your CV" form with phone / WhatsApp / e-mail contacts.'],
  press_list: [null, '62-site-press', null, 'Website: Title from this section; rows come from Press / Insights posts (chapter 10).'],
  contact_locations: [null, '64-site-contact', null, 'Website: Title and Lead text from this section; the three cards come from Locations (chapter 11).'],
  contact_form: [null, '65-site-contact-form', null, 'Website: Heading, Intro text, Bullet points, Unit options (the dropdown), Button label and Success message all come from this section.'],
};
const whereUsed = { job_openings: 'Careers', cv_form: 'Careers', hero_video: 'Home', marquee: 'Home (twice)', divisions: 'Home', vision: 'Home', mission: 'Home', crafting: 'Home', built_to_scale: 'Home', about_hero: 'About Us', expertise: 'About Us', journey: 'About Us', certifications: 'About Us', page_title: 'any custom page', product_grid: 'Clamps Product Range', machine_feature: 'Power Press Range', machines_grid: 'Power Press Range', press_list: 'Press', contact_locations: 'Contact Us', contact_form: 'Contact Us', rich_text: 'any custom page' };
let n = 0;
for (const [type, def] of Object.entries(SECTION_TYPES)) {
  n++;
  H2(`6.${n} ${esc(def.label)} <span class="code">${type}</span>`);
  P(`${esc(def.description || '')} <span class="dim">Used on: ${whereUsed[type] || 'any page'}.</span>`);
  RAW(table(def.fields, seedSection(type), EX['section:' + type] || {}));
  const s = sectionShots[type];
  if (s) { if (s[0]) RAW(pair(s[0], s[2], s[1], s[3])); else RAW(img(s[1], s[3])); }
}
RAW(NOTE('<b>Automatic sections</b> (Product categories grid, Featured power press, Power press grid, Press / news list, Contact locations) only hold the heading texts or a choice. Their content is the published records of the matching catalogue, so you never type it twice.', 'tip'));
END();

H1('7. Navigation menu (automatic)', 'The top navigation builds itself. There is nothing to maintain twice.');
P('The header always shows: <b>Home · About Us · Power Press ▾ · Products ▾ · Insights · Contact</b>, plus the "Request a Quote" button.');
RAW(`<table class="map"><thead><tr><th>Part of the header</th><th>Where it comes from</th></tr></thead><tbody>
<tr><td>Link labels (Home, About Us, …)</td><td>Site settings → Header &amp; navigation → <b>Menu labels</b></td></tr>
<tr><td>Tiles inside the <b>Products</b> drop-down</td><td>Your published <b>Product categories</b> (name, card text, card image), in their Order</td></tr>
<tr><td>Tiles inside the <b>Power Press</b> drop-down</td><td>Your published <b>Power presses</b> (name, card text, image), in their Order</td></tr>
<tr><td>Left panel and bottom bar of each drop-down</td><td>Site settings → Header &amp; navigation → <b>Products drop-down</b> / <b>Power Press drop-down</b></td></tr>
<tr><td>Extra links (e.g. Careers)</td><td>Site settings → Header &amp; navigation → <b>Extra links</b>; they appear before Contact</td></tr>
<tr><td>"Request a Quote" button</td><td>Site settings → Header &amp; navigation → Header button label / link</td></tr>
</tbody></table>`);
RAW(img('55-site-mega-menu', 'Website: the Products drop-down. Left panel = "Products drop-down" settings; the seven tiles = the published product categories; bottom bar = Bottom bar text + link.'));
RAW(NOTE('A drop-down is hidden automatically when it has no published records. To take a range out of the menu, switch its <b>Published</b> off; to add one, create a new Product category or Power press.', 'tip'));
END();

H1('8. Product categories &amp; product items', 'A <b>category</b> is one clamp range (its own page); <b>items</b> are the individual designs shown as cards inside it.');
RAW(img('14-products-list', 'One row per range. "Items" jumps to that range\'s product items; "View ↗" opens the public page.'));
H2('8.1 Two page layouts');
RAW(pair('58-site-product-detail', 'Layout "Overview hero + features + steps + designs" (V-Band Clamps): kicker, H1, H2, description, chips, buttons, hero image and badge; then the optional blocks.', '59-site-product-grid-layout', 'Layout "Simple cards grid" (T-Bolt Clamps): just the title and the item cards with name + description; then the optional blocks.'));
P('Blocks that are left empty are simply not shown. So a range can have only a hero, or a hero plus materials, and so on. The designs grid is titled "&lt;Name&gt; Designs", the materials block "Material Options" and the industries block "Industries &amp; Application" automatically.');
H2('8.2 Category fields');
const cat = { ...seed.productCategories[0] }; const tb = seed.productCategories[5];
for (const k of Object.keys(tb)) { const v = cat[k]; if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) cat[k] = tb[k]; }
RAW(groupedTables(RESOURCES.products.fields, { ...cat, layout: 'hero' }, EX['resource:products']));
RAW(pair('15-product-basics', 'Top of the form: Name, Order, Published and the page layout. The page address is created automatically from the name.', '16-product-card', 'Listing card group — what appears on the /products grid.'));
RAW(img('17-product-hero', 'Overview hero group. "Badge small text" uses | for a line break: "equal pressure|around the joint".'));
RAW(pair('18-product-features', 'Features group: icon cards (each with an Icon, Title, Text) and the check-list badges.', '19-product-steps', 'How it works group: numbered steps.'));
RAW(pair('21-product-materials', 'Materials group: comma-separated values become grey chips.', '22-product-industries', 'Industries group: label + image tiles.'));
RAW(img('23-product-seo', 'SEO group: browser-tab title and search description.'));
H2('8.3 Product items');
RAW(pair('24-product-items-list', 'Product items are grouped by category. Click a category to open it.', '24b-product-items-open', 'An open category lists only its own items; "+ Add item" creates an item already assigned to that category.'));
RAW(table(RESOURCES['product-items'].fields, null, EX['resource:product-items']));
RAW(img('25-product-item-new-filled', 'Example: a new T-Bolt item filled in. Category is chosen from the linked dropdown.'));
RAW(NOTE('On the "Overview hero" layout, items are shown as a designs grid with image and name only. On the "Simple cards grid" layout the Description is shown too. Order sorts the cards; lower numbers first.', 'tip'));
END();

H1('9. Power presses', 'One record per machine. The Power Press page shows the featured press in full and then the whole range; every press also has its own page under <code>/power-press/&lt;name&gt;</code>.');
RAW(img('26-machines-list', 'The four machines created at installation.'));
RAW(pair('60-site-machine', 'Website: /power-press — the featured press hero (kicker, name, description, buttons, image, badge), followed by Gallery and Features.', '61-site-machine-specs', 'Website: the Technical Specifications table built from Model columns + Rows.'));
RAW(img('61b-site-machine-grid', 'Website: the "Power Press Range" grid below the featured press. Each card opens that press\'s own page.'));
H2('9.1 Fields');
RAW(groupedTables(RESOURCES.machines.fields, seedResource.machines, EX['resource:machines']));
RAW(pair('27-machine-basics', 'Top of the form. Card text is used on the /power-press grid and in the drop-down menu.', '28-machine-hero', 'Hero group.'));
RAW(pair('29-machine-gallery', 'Gallery items: label, optional "open" link and image.', '30-machine-features', 'Feature cards with icons.'));
RAW(img('31-machine-specs', 'Specifications group (cropped). Model columns = the table header; each Row = one line, with its Values separated by | in the same order as the columns.', 'tall'));
RAW(NOTE('<b>Spec table rule:</b> if Model columns is <code>5 Ton, 10 Ton, 20 Ton</code> then a row\'s Values must contain three entries, e.g. <code>605|715|715</code>. Use <code>--</code> for an empty Code. Leave Model columns empty to hide the whole table (as on the Hydraulic press).', 'tip'));
H2('9.2 Choosing the featured press');
RAW(img('26b-machine-feature-section', 'Pages &amp; sections → Power Press Range → Sections → "Featured power press": pick the press from the dropdown and save. Leave it empty to show the first press in your Order.'));
END();

H1('10. Press / Insights (posts)', 'News articles listed at /press, each with its own page.');
RAW(img('32-posts-list', 'Newest first. Views counts visits to the article page and updates automatically.'));
RAW(table(RESOURCES.posts.fields, null, EX['resource:posts']));
RAW(tallImg('33-post-new-filled', 'Admin: a complete example post. The page address is generated from the title'));
RAW(img('63-site-post', 'Website: an article page — cover image, category chip, title, date, author, views, then the HTML body and three recent posts.'));
RAW(NOTE('If the Body is left empty the Excerpt is shown as the article text. Switch Published off to hide a post without deleting it.', 'tip'));
END();

H1('10b. Careers: job openings &amp; applications', 'The Careers page lists your current openings. Candidates apply to an opening or send a general CV; HR is notified by e-mail with the CV attached.');
H2('Job openings');
RAW(img('42-jobs-list', 'One row per opening. Switch Published off to take an opening down without deleting it.'));
RAW(table(RESOURCES.jobs.fields, seed.jobs[0], {}));
RAW(tallImg('43-job-form', 'Admin: an opening. Qualifications is the short text on the card; the HTML description shows when a visitor presses "View details"'));
RAW(pair('66-site-careers', 'Website: the openings grid. Each card shows title, department, location, experience, type and the qualifications text.', '67-site-apply-modal', 'Website: pressing Apply Now opens the application form for that opening (name, e-mail, phone, city, company, experience, message, CV upload).'));
H2('Applications');
RAW(pair('44-applications-list', 'Every application, newest first, with the opening it was for and a status.', '45-application-detail', 'The detail view: all submitted values, a Download CV button, a Status dropdown and Reply by email.'));
RAW(table(RESOURCES.applications.fields, null, { jobTitle: 'Quality Engineer – IATF 16949', name: 'Anita Deshmukh', email: 'anita.deshmukh@example.com', phone: '+91 98765 43210', city: 'Thane', company: 'Precision Auto Parts', experience: '4 yrs', status: 'Shortlisted', message: 'IATF lead auditor, PPAP experience with Tier-1s.' }));
RAW(STEP(['A candidate applies on the website. The application is saved here, HR receives an e-mail with the CV attached, and the candidate receives an acknowledgement.', 'Open the application, press <b>Download CV</b>, and set the <b>Status</b> (Shortlisted, Interview, Hired, Rejected). Save.', 'Use <b>Reply by email</b> to contact the candidate from your own mail program.']));
RAW(NOTE('Which address receives the applications is set in <b>Site settings → Contact details → Send job applications to (HR)</b>. Contact-form enquiries go to the address in "Send contact-form enquiries to". E-mail sending needs the SMTP settings on the server (see the deployment notes).', 'tip'));
H2('Texts on the Careers page');
P('The headings, intro, button labels, success messages and the phone / WhatsApp / e-mail shown next to the CV form are edited in <b>Pages &amp; sections → Careers → Sections</b> (sections "Current openings" and "Send us your CV").');
END();

H1('11. Locations', 'The plant / office cards with embedded Google Maps on the Contact page.');
RAW(img('34-locations-list', 'Three units created at installation.'));
RAW(table(RESOURCES.locations.fields, null, EX['resource:locations']));
RAW(pair('35-location-new-filled', 'Admin: example of a fourth location.', '64-site-contact', 'Website: each location becomes a card with map, tag, name, address, phone, e-mail and a Get Directions link.'));
RAW(NOTE('"Google Maps search text" is what Google will search for, both for the embedded map and the Get Directions link — use the same text you would type into Google Maps.', 'tip'));
END();

H1('12. Enquiries', 'Messages sent through the contact form on the website.');
RAW(pair('36-enquiries-list', 'New enquiries show an orange "new" status. Click a name to open it.', '37-enquiry-detail', 'The detail view: all submitted values (read-only), a Status dropdown you can save, and a "Reply by email" button that opens your mail program.'));
RAW(table(RESOURCES.enquiries.fields, null, EX['resource:enquiries']));
RAW(STEP(['Open the enquiry.', 'Press <b>Reply by email</b> to answer the customer from your own e-mail client.', 'Set <b>Status</b> to <b>Read</b> or <b>Replied</b> and press <b>Save</b> so colleagues know it is handled.', 'Delete only spam; enquiries are not shown anywhere on the public site.']));
END();

H1('13. Media library', 'All uploaded files. Images and videos used on the site are referenced by their path.');
RAW(img('38-media-library', 'Upload with the button or by dragging files onto the dashed area. Click a tile to copy its URL; hover and press ✕ to delete.'));
RAW(`<table class="map"><thead><tr><th>Topic</th><th>Details</th></tr></thead><tbody>
<tr><td>Allowed types</td><td>JPG, PNG, WebP, GIF, SVG, AVIF images · MP4 / WebM video · PDF. Maximum 25 MB per file.</td></tr>
<tr><td>Where files go</td><td>Uploads are stored at <code>/uploads/&lt;timestamp&gt;-&lt;name&gt;.&lt;ext&gt;</code>. That path is what you paste into an image field (or pick it with Browse / upload).</td></tr>
<tr><td>Built-in images</td><td>The pictures shipped with the site live under <code>/images/…</code> and the hero video under <code>/video/hero.mp4</code>; you can type those paths directly.</td></tr>
<tr><td>External images</td><td>A full address such as <code>https://jupiter-clamps.com/…/clamp.png</code> works everywhere an image is expected.</td></tr>
<tr><td>Catalog PDF</td><td>Upload the PDF here, copy its URL, then paste it into Site settings → Site &amp; branding → <b>Catalog download URL</b>. All "Download Catalog" buttons then point to it.</td></tr>
<tr><td>Deleting</td><td>Deleting a file does not update the pages that use it — those will show a broken image. Replace the field value first.</td></tr>
</tbody></table>`);
END();

H1('14. Site settings', 'Branding, header and navigation, contact details, social links, footer and the bottom banner. Each tab is saved separately with the button at the top right.');
const settingsShots = { site: '39-settings-1', header: '39-settings-2', contact: '39-settings-3', social: '39-settings-4', footer: '39-settings-5', cta: '39-settings-6' };
let k = 0;
for (const [key, grp] of Object.entries(SETTINGS_SCHEMA)) {
  k++;
  H2(`14.${k} ${esc(grp.label)}`);
  RAW(table(grp.fields, seed.settings[key], EX['settings:' + key]));
  RAW(tallImg(settingsShots[key], `The ${esc(grp.label)} tab`));
}
RAW(pair('53-site-cta-footer', 'Website: the Bottom CTA banner — Heading (| = line break), italic line, two buttons and the big ghost word.', '54-site-footer', 'Website: footer — logo, About text, social icons, Links column, Products column, Contact details and the copyright line ({year} becomes the current year).'));
END();

H1('15. Admin users', 'Who can sign in to the admin panel.');
RAW(pair('40-users-list', 'The users list (password hashes are never shown).', '41-user-new-filled', 'Example of a new Editor account.'));
RAW(table(RESOURCES.users.fields, null, EX['resource:users']));
RAW(`<table class="map"><thead><tr><th>Role</th><th>Can do</th></tr></thead><tbody>
<tr><td><b>Administrator</b></td><td>Everything, including creating / deleting other users.</td></tr>
<tr><td><b>Editor</b></td><td>Everything except managing other users (an editor can still change their own password).</td></tr>
</tbody></table>`);
RAW(STEP(['<b>Change your password:</b> open Admin users → your name, type a new Password, Save. Leave the field blank to keep the current one.', '<b>Add a colleague:</b> + New admin user, fill Name, Email, Password, Role, Save. Tell them the password privately; they can change it after signing in.']));
RAW(NOTE('You cannot delete your own account, and the last Administrator cannot be deleted.', 'warn'));
END();

H1('16. Tips, rules &amp; troubleshooting');
RAW(`<table class="map"><thead><tr><th>Situation</th><th>What to do</th></tr></thead><tbody>
<tr><td>I saved but the website still shows the old text</td><td>Reload the page in the browser (Cmd/Ctrl + Shift + R). Changes are live immediately; the browser may show a cached copy.</td></tr>
<tr><td>"A record with the same unique value already exists"</td><td>Another record already uses that name/address or e-mail. Change the name slightly (addresses are generated from it) or the e-mail.</td></tr>
<tr><td>A product range is missing from the drop-down menu</td><td>The menu lists published Product categories / Power presses only — check that record's Published switch.</td></tr>
<tr><td>Something disappeared from the site</td><td>Check the <b>Published</b> / <b>Enabled</b> switch of the record or section, and for sections the page it belongs to.</td></tr>
<tr><td>A section shows no content</td><td>Automatic sections show published catalogue records — make sure those records are published. A hero section with nothing filled in is hidden until you fill it.</td></tr>
<tr><td>Image not showing</td><td>Open the field's <b>Open</b> link. The path must start with <code>/</code> (site file) or <code>https://</code> (external). Re-pick it with Browse / upload.</td></tr>
<tr><td>Line breaks inside a short field</td><td>Badge texts and the CTA heading accept <code>|</code> as a line break: <code>Ready to|Integrate Jupiter</code>.</td></tr>
<tr><td>Lists of words</td><td>Chips, materials, marquee words, bullet points and unit options are typed as one line separated by commas.</td></tr>
<tr><td>Ordering</td><td>Lists on the site follow the <b>Order</b> number (0, 1, 2…); sections and list items use the ↑ ↓ arrows.</td></tr>
<tr><td>Copyright year</td><td>Keep <code>{year}</code> in the Footer copyright line; it is replaced automatically.</td></tr>
<tr><td>HTML looks wrong</td><td>Use the <b>Preview</b> button. Close every tag you open (<code>&lt;p&gt;…&lt;/p&gt;</code>). Scripts are removed on purpose.</td></tr>
<tr><td>Deleted a system page?</td><td>Not possible — Home, About, Products, Power Press, Press and Contact are protected. Disable their sections instead.</td></tr>
<tr><td>Forgot the admin password</td><td>Another administrator can set a new one in Admin users. If nobody can sign in, the site developer can reset it from the server.</td></tr>
</tbody></table>`);
END();

H1('17. Appendix: quick reference');
RAW(`<table class="map"><thead><tr><th>Screen</th><th>Address</th></tr></thead><tbody>
<tr><td>Sign in</td><td><code>/admin/login</code></td></tr><tr><td>Dashboard</td><td><code>/admin</code></td></tr>
<tr><td>Pages / sections of page #1</td><td><code>/admin/pages</code> · <code>/admin/pages/1/sections</code></td></tr>
<tr><td>Product categories / items</td><td><code>/admin/products</code> · <code>/admin/product-items</code></td></tr>
<tr><td>Power presses</td><td><code>/admin/machines</code></td></tr><tr><td>Press / Insights</td><td><code>/admin/posts</code></td></tr>
<tr><td>Job openings / Applications</td><td><code>/admin/jobs</code> · <code>/admin/applications</code></td></tr>
<tr><td>Locations</td><td><code>/admin/locations</code></td></tr><tr><td>Enquiries</td><td><code>/admin/enquiries</code></td></tr>
<tr><td>Media library</td><td><code>/admin/media</code></td></tr><tr><td>Site settings</td><td><code>/admin/settings</code></td></tr><tr><td>Admin users</td><td><code>/admin/users</code></td></tr>
</tbody></table>
<h3>Section types at a glance</h3>
<table class="map"><thead><tr><th>Type</th><th>Use it for</th></tr></thead><tbody>${Object.entries(SECTION_TYPES).map(([t, d]) => `<tr><td><b>${esc(d.label)}</b></td><td>${esc(d.description || '')} <span class="dim">(${t})</span></td></tr>`).join('')}</tbody></table>
<h3>Icon names</h3><p>Available in every "Icon" dropdown: globe, badge, spark, growth, sliders, sun, layers, layers2, wrench, shield, shieldCheck, bolt, drop, check, gear, target, factory, truck, star, clock.</p>`);
END();

const css = `
@page { size: A4; margin: 18mm 15mm 18mm 15mm; }
* { box-sizing: border-box; }
body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #1a2234; font-size: 10.5pt; line-height: 1.5; margin: 0; }
.cover { height: 257mm; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; page-break-after: always; border-left: 6px solid #1f4c9a; padding-left: 14mm; }
.cover .brand img { height: 70px; margin-bottom: 30px; }
.cover h1 { font-size: 40pt; line-height: 1.05; margin: 0 0 14px; color: #1f4c9a; }
.cover .sub { font-size: 16pt; color: #333; margin: 0 0 30px; }
.cover .meta { color: #666; font-size: 11pt; }
.chapter { page-break-before: always; }
.toc ol { font-size: 12pt; line-height: 1.9; }
h1 { font-size: 22pt; color: #1f4c9a; margin: 0 0 6px; border-bottom: 2px solid #f39c12; padding-bottom: 6px; }
h2 { font-size: 14.5pt; margin: 20px 0 6px; color: #173a78; page-break-after: avoid; }
h3 { font-size: 12pt; margin: 14px 0 4px; page-break-after: avoid; }
h4 { font-size: 10.5pt; margin: 12px 0 4px; color: #44506a; text-transform: uppercase; letter-spacing: .05em; page-break-after: avoid; }
p { margin: 5px 0 8px; }
.lead { color: #555; font-size: 11pt; }
code, .code { font-family: Menlo, Consolas, monospace; font-size: 9pt; background: #eef1f6; padding: 1px 4px; border-radius: 3px; }
h2 .code { font-size: 9pt; color: #666; vertical-align: middle; margin-left: 6px; }
table { width: 100%; border-collapse: collapse; margin: 6px 0 12px; font-size: 9pt; }
th, td { border: 1px solid #d9dee8; padding: 5px 7px; vertical-align: top; text-align: left; }
th { background: #eef2fa; color: #173a78; font-size: 8.5pt; text-transform: uppercase; letter-spacing: .04em; }
tr { page-break-inside: avoid; }
tbody tr:nth-child(even) td { background: #fafbfd; }
.fields td.ex { font-family: Menlo, Consolas, monospace; font-size: 8.2pt; color: #0b3d2e; background: #f3faf6 !important; }
.req { color: #c0392b; font-size: 8pt; font-weight: 600; }
.ro { color: #777; font-size: 8pt; }
.dim { color: #777; font-style: italic; }
figure { margin: 10px 0 14px; page-break-inside: avoid; }
.imgwrap { border: 1px solid #d0d6e0; border-radius: 6px; overflow: hidden; background: #fff; }
.imgwrap img { width: 100%; display: block; }
figure.tall .imgwrap { max-height: 150mm; }
figcaption { font-size: 8.8pt; color: #555; margin-top: 4px; }
.pair { display: flex; gap: 10px; page-break-inside: avoid; }
.pair figure { flex: 1; min-width: 0; }
.pair .imgwrap { max-height: 110mm; }
.pair.split .imgwrap { max-height: 170mm; }
.note { border-left: 4px solid #1f4c9a; background: #eef3fc; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0; font-size: 9.6pt; page-break-inside: avoid; }
.note.warn { border-color: #f39c12; background: #fff6e8; }
.steps { padding-left: 22px; }
.steps li { margin: 3px 0; }
.missing { color: red; }
`;
fs.writeFileSync('guide.html', `<!doctype html><html><head><meta charset="utf-8"><title>Jupiter Admin Guide</title><style>${css}</style></head><body>${h}</body></html>`);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.goto(pathToFileURL(path.resolve('guide.html')).href, { waitUntil: 'networkidle0' });
await page.pdf({
  path: '../Jupiter-CMS-Admin-Guide.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true,
  headerTemplate: '<div style="font-size:8px;color:#888;width:100%;padding:0 15mm;display:flex;justify-content:space-between"><span>Jupiter Industrial Works — Admin Panel User Guide</span><span></span></div>',
  footerTemplate: '<div style="font-size:8px;color:#888;width:100%;padding:0 15mm;display:flex;justify-content:space-between"><span>Jupiter Industrial Works</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
});
await browser.close();
console.log('pdf written to docs/Jupiter-CMS-Admin-Guide.pdf');
