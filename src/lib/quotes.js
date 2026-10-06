import { db } from './db.js';

// The quote_requests table was added after the first deployments. Creating it on first use keeps the
// public form and the admin list working on a database that has not run `npm run db:sync` yet.
let ready = null;

export function ensureQuoteTable() {
  if (!ready) {
    ready = db()
      .QuoteRequest.sync()
      .catch((err) => {
        ready = null;
        throw err;
      });
  }
  return ready;
}
