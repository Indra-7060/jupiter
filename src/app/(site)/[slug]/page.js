import { notFound } from 'next/navigation';
import SitePage, { sitePageMetadata } from '@/components/site/SitePage';
import { getPage } from '@/lib/content';

export const dynamic = 'force-dynamic';

const RESERVED = new Set(['home', 'about', 'products', 'power-press', 'press', 'contact', 'quote', 'careers', 'admin', 'api']);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return sitePageMetadata(slug);
}

export default async function CustomPage({ params }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();
  const page = await getPage(slug);
  if (!page || page.isSystem) notFound();
  return <SitePage slug={slug} mainClass={page.bodyClass || undefined} />;
}
