import { notFound } from 'next/navigation';
import { openGraph } from '@/components/site/SitePage';
import Cta from '@/components/site/Cta';
import MachineDetail from '@/components/site/MachineDetail';
import { getMachine, getSettings } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const m = await getMachine(slug);
  if (!m) return {};
  const settings = await getSettings();
  const title = m.metaTitle || m.name;
  const description = m.metaDescription || m.cardText || undefined;
  return { title, description, ...openGraph({ title: `${title}${settings.site?.titleSuffix || ''}`, description, image: m.image, site: settings.site, type: 'website' }) };
}

export default async function MachinePage({ params }) {
  const { slug } = await params;
  const [m, settings] = await Promise.all([getMachine(slug), getSettings()]);
  if (!m) notFound();
  return (
    <>
      <main>
        <MachineDetail m={m} />
      </main>
      <Cta settings={settings} />
    </>
  );
}
