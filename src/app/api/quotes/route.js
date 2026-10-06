import { db } from '@/lib/db';
import { created, fail, readJson, withPublic } from '@/lib/api';
import { getSettings } from '@/lib/content';
import { sendMail, tableEmail } from '@/lib/mailer';

const recent = new Map();

// The quote_requests table is created on first use so the form keeps working on a database
// that has not been migrated yet (e.g. straight after a deploy, before `npm run db:sync`).
let tableReady = null;
function ensureTable(Model) {
  if (!tableReady) {
    tableReady = Model.sync().catch((err) => {
      tableReady = null;
      throw err;
    });
  }
  return tableReady;
}

export const POST = withPublic(async (req) => {
  const body = await readJson(req);
  if (body.website) return created({ id: 0 }); // honeypot – silently accept

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();
  if (name.length < 2) return fail('Please enter your full name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid email address.');
  if (message.length < 5) return fail('Please describe what you need a quote for.');

  const ip = req.headers.get('x-forwarded-for') || 'local';
  const last = recent.get(ip) || 0;
  if (Date.now() - last < 10_000) return fail('Please wait a moment before sending another request.', 429);
  recent.set(ip, Date.now());

  const { QuoteRequest } = db();
  await ensureTable(QuoteRequest);
  const row = await QuoteRequest.create({
    name: name.slice(0, 160),
    email: email.slice(0, 190),
    phone: String(body.phone || '').trim().slice(0, 60) || null,
    company: String(body.company || '').trim().slice(0, 190) || null,
    location: String(body.location || '').trim().slice(0, 160) || null,
    product: String(body.product || '').trim().slice(0, 160) || null,
    specification: String(body.specification || '').trim().slice(0, 255) || null,
    quantity: String(body.quantity || '').trim().slice(0, 80) || null,
    message: message.slice(0, 5000),
    ip: ip.slice(0, 64),
  });

  const settings = await getSettings();
  const contact = settings.contact || {};
  const to = contact.quoteEmail || contact.enquiryEmail || contact.email;
  const rows = [
    ['Reference', `#${row.id}`],
    ['Name', row.name],
    ['Email', row.email],
    ['Phone', row.phone],
    ['Company', row.company],
    ['Location', row.location],
    ['Product', row.product],
    ['Size / specification', row.specification],
    ['Quantity', row.quantity],
    ['Requirement', row.message],
  ];
  if (to) {
    await sendMail({
      to,
      replyTo: row.email,
      subject: `New quote request #${row.id} from ${row.name}${row.product ? ` – ${row.product}` : ''}`,
      html: tableEmail('New quote request', 'Submitted through the Request a Quote form. Answer it from Admin → Quote requests.', rows),
    });
  }
  // acknowledgement to the requester
  await sendMail({
    to: row.email,
    replyTo: to || undefined,
    subject: `We received your quote request (#${row.id}) – Jupiter Industrial Works`,
    html: tableEmail(
      'Thank you for your quote request',
      `Hello ${row.name}, our sales team has received the details below and will send you a quotation shortly. Reply to this e-mail if you want to add anything.`,
      rows
    ),
  });

  return created({ id: row.id });
});
