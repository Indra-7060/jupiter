import { fail, ok, readJson, withAdmin } from '@/lib/api';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/content';
import { sendMail } from '@/lib/mailer';
import { escapeHtml } from '@/lib/util';

/** Build the e-mail sent to the person who asked for the quote. */
function replyEmail({ quote, message, signature }) {
  const paragraphs = message
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px;white-space:pre-wrap">${escapeHtml(p)}</p>`)
    .join('');
  const original = [
    ['Product', quote.product],
    ['Size / specification', quote.specification],
    ['Quantity', quote.quantity],
    ['Requirement', quote.message],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 10px;color:#555;white-space:nowrap;vertical-align:top"><b>${escapeHtml(k)}</b></td><td style="padding:4px 10px;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
    .join('');
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111;line-height:1.5">
  <h2 style="color:#1f4c9a;margin:0 0 14px">Jupiter Industrial Works</h2>
  <p style="margin:0 0 12px">Hello ${escapeHtml(quote.name)},</p>
  ${paragraphs}
  ${signature ? `<p style="margin:16px 0 0;color:#555;white-space:pre-wrap">${escapeHtml(signature)}</p>` : ''}
  <hr style="border:0;border-top:1px solid #e3e7ee;margin:22px 0 12px">
  <p style="margin:0 0 6px;color:#555;font-size:12px">Your request #${quote.id}:</p>
  <table style="border-collapse:collapse;border:1px solid #e3e7ee;font-size:12px">${original}</table>
</div>`;
}

export const POST = withAdmin(async (req, { params, session }) => {
  const { QuoteRequest } = db();
  const row = await QuoteRequest.findByPk(Number(params.id));
  if (!row) return fail('Not found', 404);

  const body = await readJson(req);
  const message = String(body.message || '').trim();
  if (message.length < 2) return fail('Please write a reply before sending.');

  const settings = await getSettings();
  const contact = settings.contact || {};
  const replyTo = contact.quoteEmail || contact.enquiryEmail || contact.email || undefined;
  const subject = String(body.subject || '').trim() || `Your quote request #${row.id}${row.product ? ` – ${row.product}` : ''} – Jupiter Industrial Works`;
  const signature = [contact.company, contact.phone, contact.email].filter(Boolean).join('\n');

  const quote = row.get({ plain: true });
  const mail = await sendMail({ to: row.email, replyTo, subject, html: replyEmail({ quote, message, signature }), text: message });

  await row.update({
    reply: message,
    repliedAt: new Date(),
    repliedBy: session.name || session.email || null,
    status: 'quoted',
  });

  return ok({ quote: JSON.parse(JSON.stringify(row.get({ plain: true }))), mailSent: mail.ok, mailError: mail.ok ? null : mail.error });
});
