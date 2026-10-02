'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Login failed');
      const next = sp.get('next');
      router.replace(next && next.startsWith('/admin') ? next : '/admin');
      router.refresh();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <form className="card" onSubmit={submit}>
        <img src="/images/logo.png" alt="Jupiter Industrial Works" />
        <h1 style={{ marginBottom: 18 }}>Admin sign in</h1>
        {err && <div className="err-box">{err}</div>}
        <div className="frm">
          <div className="fld">
            <label>Email</label>
            <input className="in" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required autoFocus />
          </div>
          <div className="fld">
            <label>Password</label>
            <input className="in" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          <div className="fld">
            <button className="btn p" disabled={busy} style={{ justifyContent: 'center', padding: '11px' }}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
