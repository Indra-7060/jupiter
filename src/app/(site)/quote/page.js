import SitePage, { sitePageMetadata } from '@/components/site/SitePage';
import Cta from '@/components/site/Cta';
import QuoteForm from '@/components/site/sections/QuoteForm';
import { getPage, getSettings } from '@/lib/content';
import { quotePage } from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const meta = await sitePageMetadata('quote');
  return Object.keys(meta).length ? meta : { title: quotePage.title, description: quotePage.metaDescription };
}

export default async function QuotePage() {
  const page = await getPage('quote');
  if (page) return <SitePage slug="quote" />;
  // The CMS page is added by `npm run db:seed` / `db:sync-content`; until then render the default form
  // so "Request a Quote" never dead-ends on a database that has not been updated yet.
  const settings = await getSettings();
  return (
    <>
      <main>
        <QuoteForm data={quotePage.sections[0].data} />
      </main>
      <Cta settings={settings} />
    </>
  );
}
