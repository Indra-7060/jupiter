'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { grp: 'Overview' },
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/enquiries', label: 'Enquiries', badgeKey: 'newEnquiries' },
  { href: '/admin/quotes', label: 'Quote requests', badgeKey: 'newQuotes' },
  { grp: 'Content' },
  { href: '/admin/pages', label: 'Pages & sections' },
  { href: '/admin/posts', label: 'Press / Insights' },
  { href: '/admin/media', label: 'Media library' },
  { grp: 'Careers' },
  { href: '/admin/jobs', label: 'Job openings' },
  { href: '/admin/applications', label: 'Applications', badgeKey: 'newApplications' },
  { grp: 'Catalogue' },
  { href: '/admin/products', label: 'Product categories' },
  { href: '/admin/product-items', label: 'Product items' },
  { href: '/admin/machines', label: 'Power presses' },
  { href: '/admin/locations', label: 'Locations' },
  { grp: 'System' },
  { href: '/admin/settings', label: 'Site settings' },
  { href: '/admin/users', label: 'Admin users' },
];

export default function AdminShell({ user, badges = {}, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className="ad">
      <aside className={`ad-side${open ? ' open' : ''}`} onClick={() => setOpen(false)}>
        <div className="ad-brand">
          <img src="/images/logo.png" alt="" />
          <div>
            <b>Jupiter Industrial Works</b>
            <small>Admin panel</small>
          </div>
        </div>
        <nav className="ad-nav">
          {NAV.map((n, i) =>
            n.grp ? (
              <div className="grp" key={i}>
                {n.grp}
              </div>
            ) : (
              <Link key={n.href} href={n.href} className={(n.exact ? pathname === n.href : pathname.startsWith(n.href)) ? 'on' : ''}>
                {n.label}
                {n.badgeKey && badges[n.badgeKey] > 0 && <span className="badge">{badges[n.badgeKey]}</span>}
              </Link>
            )
          )}
          <div className="grp">Website</div>
          <a href="/" target="_blank" rel="noopener">
            View site ↗
          </a>
        </nav>
        <div className="ad-user">
          <div>
            <b>{user?.name}</b>
            <small>{user?.email}</small>
          </div>
          <button className="btn sm" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </aside>
      <main className="ad-main">
        <button className="btn ad-burger" type="button" onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>
          ☰ Menu
        </button>
        {children}
      </main>
    </div>
  );
}
