import path from 'node:path';
import { saveCv } from '@/lib/storage';
import { db } from '@/lib/db';
import { created, fail, withPublic } from '@/lib/api';
import { getSettings } from '@/lib/content';
import { sendMail, tableEmail } from '@/lib/mailer';

const recent = new Map();
const ALLOWED = new Set(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
const MAX = 5 * 1024 * 1024;

export const POST = withPublic(async (req) => {
  const form = await req.formData();
  const get = (k, max = 190) => String(form.get(k) || '').trim().slice(0, max) || null;
  if (get('website')) return created({ id: 0 }); // honeypot

  const name = get('name', 160);
  const email = get('email');
  if (!name || name.length < 2) return fail('Please enter your name.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid e-mail address.');

  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (Date.now() - (recent.get(ip) || 0) < 10_000) return fail('Please wait a moment before sending another application.', 429);
  recent.set(ip, Date.now());

  const file = form.get('cv');
  let cvFile = null, cvName = null, buffer = null;
  if (file && typeof file === 'object' && file.size) {
    const ext = path.extname(file.name || '').toLowerCase();
    if (!ALLOWED.has(file.type) && !['.pdf', '.doc', '.docx'].includes(ext)) return fail('Please attach your CV as a PDF or Word file.');
    if (file.size > MAX) return fail('The CV must be smaller than 5 MB.');
    buffer = Buffer.from(await file.arrayBuffer());
    cvName = path.basename(file.name || `cv${ext}`).slice(0, 120);
    try {
      cvFile = await saveCv(buffer, `${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext || '.pdf'}`, file.type || 'application/octet-stream');
    } catch (err) {
      console.warn('[applications] could not store CV:', err.message);
      cvFile = null; // still e-mailed as an attachment below
    }
  }

  const { JobApplication, JobOpening } = db();
  const jobId = Number(form.get('jobId')) || null;
  const job = jobId ? await JobOpening.findByPk(jobId) : null;
  const interest = get('interest', 200);
  const row = await JobApplication.create({
    jobId: job ? job.id : null,
    jobTitle: job ? job.title : interest ? `General application – ${interest}` : 'General application',
    name,
    email,
    phone: get('phone', 60),
    company: get('company'),
    city: get('city', 120),
    experience: get('experience', 80),
    message: get('message', 5000),
    cvFile,
    cvName,
    ip: ip.slice(0, 64),
  });

  const settings = await getSettings();
  const hr = settings.contact?.hrEmail || settings.contact?.email;
  const site = settings.site?.name || 'Jupiter Industrial Works';
  const base = process.env.NEXT_PUBLIC_SITE_URL || '';
  if (hr) {
    await sendMail({
      to: hr,
      replyTo: email,
      subject: `New job application: ${row.jobTitle} – ${name}`,
      html: tableEmail('New job application', `Received through the careers page of the ${site} website.`, [
        ['Applied for', row.jobTitle], ['Name', name], ['Email', email], ['Phone', row.phone], ['City', row.city], ['Current company', row.company],
        ['Experience', row.experience], ['Message', row.message], ['CV', cvName ? `${cvName} (attached)` : 'not attached'],
        ['Admin link', base ? `${base}/admin/applications/${row.id}` : ''],
      ]),
      attachments: buffer ? [{ filename: cvName, content: buffer }] : undefined,
    });
  }
  await sendMail({
    to: email,
    subject: `We received your application – ${site}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111"><p>Dear ${name.replace(/[<>]/g, '')},</p><p>Thank you for applying${job ? ` for <b>${job.title.replace(/[<>]/g, '')}</b>` : ''} at ${site}. Our HR team has received your details${cvName ? ' and CV' : ''} and will get back to you shortly.</p><p>Regards,<br>HR Team, ${site}</p></div>`,
  });

  return created({ id: row.id });
});
