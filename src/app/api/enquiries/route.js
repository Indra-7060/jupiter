import { db } from '@/lib/db';
import { created, fail, readJson, withPublic } from '@/lib/api';
import { getSettings } from '@/lib/content';
import { sendMail, tableEmail } from '@/lib/mailer';

const recent = new Map();

export const POST = withPublic(async (req) => {
  const body = await readJson(req);
  if (body.website) return created({ id: 0 }); // honeypot – silently accept

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  if (name.length < 2) return fail('Please enter your full name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid email address.');

  const ip = req.headers.get('x-forwarded-for') || 'local';
  const last = recent.get(ip) || 0;
  if (Date.now() - last < 10_000) return fail('Please wait a moment before sending another enquiry.', 429);
  recent.set(ip, Date.now());

  const { Enquiry } = db();
  const row = await Enquiry.create({
    name: name.slice(0, 160),
    email: email.slice(0, 190),
    phone: String(body.phone || '').slice(0, 60) || null,
    organization: String(body.organization || '').slice(0, 190) || null,
    unit: String(body.unit || '').slice(0, 120) || null,
    message: String(body.message || '').slice(0, 5000) || null,
    ip: ip.slice(0, 64),
  });

  const settings = await getSettings();
  const to = settings.contact?.enquiryEmail || settings.contact?.email;
  if (to) {
    await sendMail({
      to,
      replyTo: row.email,
      subject: `New website enquiry from ${row.name}${row.unit ? ` (${row.unit})` : ''}`,
      html: tableEmail('New enquiry', 'Submitted through the contact form on the website.', [
        ['Name', row.name], ['Email', row.email], ['Phone', row.phone], ['Organization', row.organization], ['Unit', row.unit], ['Message', row.message],
      ]),
    });
  }
  return created({ id: row.id });
});
