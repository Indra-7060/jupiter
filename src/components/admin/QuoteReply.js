'use client';

import { useState } from 'react';
import { api } from '@/lib/adminClient';
import { formatDate } from '@/lib/util';
import { useToast } from './Toast';

/** Reply panel on a quote request: the message is e-mailed to the requester and stored on the record. */
export default function QuoteReply({ quote, onReplied }) {
  const toast = useToast();
  const [subject, setSubject] = useState(`Your quote request #${quote.id}${quote.product ? ` – ${quote.product}` : ''} – Jupiter Industrial Works`);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [warn, setWarn] = useState('');

  async function send() {
    if (message.trim().length < 2) {
      toast('Write a reply first', 'err');
      return;
    }
    setBusy(true);
    setWarn('');
    try {
      const d = await api(`/api/admin/quotes/${quote.id}/reply`, { method: 'POST', body: { subject, message } });
      if (d.mailSent) toast(`Reply sent to ${quote.email}`);
      else {
        toast('Reply saved, but the e-mail could not be sent', 'err');
        setWarn(`The reply was saved on the request but the e-mail was not delivered (${d.mailError || 'SMTP not configured'}). Use the "Open in e-mail app" button to send it manually.`);
      }
      setMessage('');
      onReplied?.(d.quote);
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setBusy(false);
    }
  }

  const mailto = `mailto:${quote.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message || quote.reply || '')}`;

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="hd">
        <h2>Reply to {quote.name}</h2>
        <span className="pill">{quote.email}</span>
      </div>
      <div className="bd">
        {quote.reply && (
          <div className="f" style={{ marginBottom: 16 }}>
            <label>
              Last reply{quote.repliedAt ? ` · ${formatDate(quote.repliedAt)}` : ''}
              {quote.repliedBy ? ` · by ${quote.repliedBy}` : ''}
            </label>
            <div className="in" style={{ whiteSpace: 'pre-wrap', minHeight: 0, background: 'var(--bg, #f6f7fb)' }}>
              {quote.reply}
            </div>
          </div>
        )}
        <div className="f">
          <label>Subject</label>
          <input className="in" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="f">
          <label>{quote.reply ? 'Send another reply' : 'Your reply'}</label>
          <textarea
            className="in"
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Dear ${quote.name},\n\nThank you for your enquiry. Please find our quotation below…`}
          />
          <small style={{ color: 'var(--muted)' }}>The e-mail opens with "Hello {quote.name}," and ends with your contact details from Site settings → Contact details. A copy of the original request is attached below your message.</small>
        </div>
        {warn && <div className="err-box">{warn}</div>}
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn p" type="button" onClick={send} disabled={busy}>
            {busy ? 'Sending…' : 'Send reply by e-mail'}
          </button>
          <a className="btn" href={mailto}>
            Open in e-mail app
          </a>
        </div>
      </div>
    </div>
  );
}
