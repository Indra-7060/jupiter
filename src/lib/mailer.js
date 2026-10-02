import nodemailer from 'nodemailer';

let transport = null;

/** SMTP transport from env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM). */
function getTransport() {
  if (transport) return transport;
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transport;
}

export function mailConfigured() {
  return !!process.env.SMTP_HOST;
}

/** Send an e-mail. Never throws: returns { ok, error } so a mail problem cannot break a form submission. */
export async function sendMail({ to, subject, html, text, replyTo, attachments }) {
  const t = getTransport();
  if (!t) {
    console.warn('[mail] SMTP_HOST not set; skipping e-mail:', subject);
    return { ok: false, error: 'SMTP not configured' };
  }
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || 'Jupiter Website <no-reply@jupiterclamps.com>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      replyTo,
      attachments,
    });
    return { ok: true };
  } catch (err) {
    console.error('[mail] failed:', err.message);
    return { ok: false, error: err.message };
  }
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Simple two-column table e-mail body. */
export function tableEmail(title, intro, rows) {
  const body = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `<tr><td style="padding:6px 10px;color:#555;white-space:nowrap;vertical-align:top"><b>${esc(k)}</b></td><td style="padding:6px 10px;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join('');
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111"><h2 style="color:#1f4c9a;margin:0 0 6px">${esc(title)}</h2><p style="margin:0 0 14px;color:#555">${esc(intro)}</p><table style="border-collapse:collapse;border:1px solid #e3e7ee">${body}</table></div>`;
}
