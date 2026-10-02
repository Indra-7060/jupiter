import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ResourceList from '@/components/admin/ResourceList';
import { ToastProvider } from '@/components/admin/Toast';
import { RESOURCES } from '@/lib/resources';

export async function generateMetadata({ params }) {
  const { resource } = await params;
  return { title: RESOURCES[resource]?.label || 'Not found' };
}

export default async function ResourceListPage({ params }) {
  const { resource } = await params;
  const def = RESOURCES[resource];
  if (!def) notFound();
  return (
    <ToastProvider>
      <Suspense fallback={<div className="empty">Loading…</div>}>
        <ResourceList name={resource} def={def} />
      </Suspense>
    </ToastProvider>
  );
}
