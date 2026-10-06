import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DashLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  const [newEnquiries, newApplications, newQuotes] = await Promise.all([
    db().Enquiry.count({ where: { status: 'new' } }),
    db().JobApplication.count({ where: { status: 'new' } }),
    db().QuoteRequest.count({ where: { status: 'new' } }).catch(() => 0), // table may not exist before db:sync
  ]);
  return (
    <AdminShell user={user} badges={{ newEnquiries, newApplications, newQuotes }}>
      {children}
    </AdminShell>
  );
}
