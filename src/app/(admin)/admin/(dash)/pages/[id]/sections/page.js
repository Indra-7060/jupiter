import { notFound } from 'next/navigation';
import SectionsEditor from '@/components/admin/SectionsEditor';
import { ToastProvider } from '@/components/admin/Toast';
import { db, plain } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const page = await db().Page.findByPk(Number(id));
  return { title: page ? `${page.title} sections` : 'Not found' };
}

export default async function SectionsPage({ params }) {
  const { id } = await params;
  const page = await db().Page.findByPk(Number(id));
  if (!page) notFound();
  return (
    <ToastProvider>
      <SectionsEditor page={plain(page)} />
    </ToastProvider>
  );
}
