import Link from 'next/link';
import { db, plain } from '@/lib/db';
import { formatDate } from '@/lib/util';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

export default async function Dashboard() {
  const m = db();
  const [products, items, machines, posts, enquiries, newEnquiries, media, pages, newApplications, openJobs, recent] = await Promise.all([
    m.ProductCategory.count(),
    m.Product.count(),
    m.Machine.count(),
    m.Post.count(),
    m.Enquiry.count(),
    m.Enquiry.count({ where: { status: 'new' } }),
    m.Media.count(),
    m.Page.count(),
    m.JobApplication.count({ where: { status: 'new' } }),
    m.JobOpening.count({ where: { published: true } }),
    m.Enquiry.findAll({ order: [['createdAt', 'DESC']], limit: 6 }).then(plain),
  ]);

  const stats = [
    ['Pages', pages, '/admin/pages'],
    ['Product categories', products, '/admin/products'],
    ['Product items', items, '/admin/product-items'],
    ['Power presses', machines, '/admin/machines'],
    ['Posts', posts, '/admin/posts'],
    ['Enquiries', `${enquiries} (${newEnquiries} new)`, '/admin/enquiries'],
    ['Job openings', openJobs, '/admin/jobs'],
    ['Applications', `${newApplications} new`, '/admin/applications'],
    ['Media files', media, '/admin/media'],
  ];

  return (
    <>
      <div className="ad-top">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of the website content.</p>
        </div>
        <div className="row">
          <Link className="btn" href="/admin/pages">
            Edit pages
          </Link>
          <Link className="btn p" href="/admin/posts/new">
            + New post
          </Link>
        </div>
      </div>

      <div className="stats">
        {stats.map(([label, value, href]) => (
          <Link key={label} href={href} className="card stat" style={{ textDecoration: 'none', color: 'inherit' }}>
            <small>{label}</small>
            <b>{value}</b>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="hd">
          <h2>Latest enquiries</h2>
          <Link className="btn sm" href="/admin/enquiries">
            View all
          </Link>
        </div>
        <div className="tbl-wrap">
          {recent.length ? (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Unit</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link href={`/admin/enquiries/${e.id}`}>{e.name}</Link>
                    </td>
                    <td>{e.email}</td>
                    <td>{e.unit}</td>
                    <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.message}</td>
                    <td>
                      <span className={`pill ${e.status === 'new' ? 'new' : 'ok'}`}>{e.status}</span>
                    </td>
                    <td>{formatDate(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty">No enquiries yet.</div>
          )}
        </div>
      </div>
    </>
  );
}
