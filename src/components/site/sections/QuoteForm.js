'use client';

import { useEffect, useState } from 'react';

export const DEFAULT_QUOTE_PRODUCTS = [
  'V-Band Clamps',
  'T-Bolt Clamps',
  'Worm Drive Clamps',
  'Spring Band Clamps',
  'Strap Bands',
  'Pipe Fitting Clips',
  'Muffler Clamps',
  'Customised Clamps',
  'Power Press',
  'Other',
];

/** Public "Request a Quote" form. Submissions go to /api/quotes and show up under Admin → Quote requests. */
export default function QuoteForm({ data }) {
  const products = data.products?.length ? data.products : DEFAULT_QUOTE_PRODUCTS;
  const [product, setProduct] = useState(products[0]);
  const [state, setState] = useState({ status: 'idle', error: '', id: null });

  // /quote?product=V-Band%20Clamps pre-selects the product the visitor came from.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('product');
    if (!wanted) return;
    const match = products.find((p) => p.toLowerCase() === wanted.toLowerCase()) || products.find((p) => wanted.toLowerCase().includes(p.toLowerCase()));
    setProduct(match || (products.includes('Other') ? 'Other' : products[0]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    setState({ status: 'sending', error: '', id: null });
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Could not send your request.');
      form.reset();
      setProduct(products[0]);
      setState({ status: 'ok', error: '', id: json.data?.id || null });
    } catch (err) {
      setState({ status: 'error', error: err.message, id: null });
    }
  }

  const label = state.status === 'sending' ? 'Sending…' : data.buttonLabel || 'Request Quote';

  return (
    <section className="fsec quote-sec">
      <div className="wrap">
        <div className="fwrap">
          <div className="in rv">
            {data.kicker && <span className="kick">{data.kicker}</span>}
            <h2>{data.heading}</h2>
            {data.text && <p>{data.text}</p>}
            {data.bullets?.length > 0 && (
              <ul>
                {data.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
          <form className="enq rv" onSubmit={onSubmit}>
            <div className="g2">
              <input name="name" required placeholder="Full name *" autoComplete="name" />
              <input name="email" required type="email" placeholder="Work e-mail *" autoComplete="email" />
              <input name="phone" placeholder="Phone / WhatsApp" autoComplete="tel" />
              <input name="company" placeholder="Company name" autoComplete="organization" />
            </div>
            <div className="g2">
              <select name="product" aria-label="Product" value={product} onChange={(e) => setProduct(e.target.value)}>
                {products.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input name="quantity" placeholder="Quantity (e.g. 5,000 pcs / month)" />
            </div>
            <div className="g2">
              <input name="specification" placeholder="Size / material / specification" />
              <input name="location" placeholder="City, Country" />
            </div>
            <textarea name="message" required placeholder="Describe your requirement: application, drawings available, delivery timeline…" />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />
            <button className="cb" type="submit" disabled={state.status === 'sending'}>
              <span className="tx">
                <span>
                  <b>{label}</b>
                  <b>{label}</b>
                </span>
              </span>
              <span className="ar">
                <svg viewBox="0 0 24 24">
                  <path d="M6 18L18 6M7.5 6H18v10.5" />
                </svg>
              </span>
            </button>
            {state.status === 'ok' && (
              <div className="ok" style={{ display: 'block' }}>
                {data.successMessage || 'Thank you — your quote request has been received. Our sales team will get back to you shortly.'}
                {state.id ? ` (Reference #${state.id})` : ''}
              </div>
            )}
            {state.status === 'error' && (
              <div className="ok" style={{ display: 'block', color: '#b42318' }}>
                {state.error}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
