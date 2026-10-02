import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DashLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  const [newEnquiries, newApplications] = await Promise.all([db().Enquiry.count({ where: { status: 'new' } }), db().JobApplication.count({ where: { status: 'new' } })]);
  return (
    <AdminShell user={user} badges={{ newEnquiries, newApplications }}>
      {children}
    </AdminShell>
  );
}
