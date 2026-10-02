import { notFound } from 'next/navigation';
import SectionRenderer from './SectionRenderer';
import Cta from './Cta';
import { getPage, getSettings } from '@/lib/content';

/** Build metadata (title, description, Open Graph) for a CMS page. */
export async function sitePageMetadata(slug) {
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page) return {};
  const site = settings.site || {};
  const title = page.metaTitle || page.title;
  const description = page.metaDescription || site.metaDescription || undefined;
  return {
    // The layout's "%s | suffix" template only applies to sub-pages, so the front page sets it explicitly.
    title: slug === 'home' ? { absolute: `${title}${site.titleSuffix || ''}` } : title,
    description,
    ...openGraph({ title: `${title}${site.titleSuffix || ''}`, description, image: site.shareImage, site }),
  };
}

export function openGraph({ title, description, image, site = {}, type = 'website' }) {
  const img = image || site.shareImage || site.logo;
  return {
    openGraph: { title, description, type, siteName: site.name || undefined, images: img ? [{ url: img }] : undefined },
    twitter: { card: img ? 'summary_large_image' : 'summary', title, description, images: img ? [img] : undefined },
  };
}

export default async function SitePage({ slug, mainClass }) {
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page || !page.published) notFound();
  return (
    <>
      <main className={mainClass}>
        <SectionRenderer sections={page.sections || []} />
      </main>
      {page.showCta !== false && <Cta settings={settings} />}
    </>
  );
}
