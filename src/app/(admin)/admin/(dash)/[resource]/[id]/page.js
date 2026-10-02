import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ResourceForm from '@/components/admin/ResourceForm';
import { ToastProvider } from '@/components/admin/Toast';
import { RESOURCES } from '@/lib/resources';

export async function generateMetadata({ params }) {
  const { resource, id } = await params;
  const def = RESOURCES[resource];
  return { title: def ? `${id === 'new' ? 'New' : 'Edit'} ${def.singular}` : 'Not found' };
}

export default async function ResourceFormPage({ params }) {
  const { resource, id } = await params;
  const def = RESOURCES[resource];
  if (!def) notFound();
  if (id !== 'new' && !/^\d+$/.test(id)) notFound();
  if (id === 'new' && def.readOnly) notFound();
  return (
    <ToastProvider>
      <Suspense fallback={<div className="empty">Loading…</div>}>
        <ResourceForm name={resource} def={def} id={id} />
      </Suspense>
    </ToastProvider>
  );
}
