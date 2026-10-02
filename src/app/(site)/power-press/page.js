import SitePage, { sitePageMetadata } from '@/components/site/SitePage';

export const dynamic = 'force-dynamic';
export const generateMetadata = () => sitePageMetadata('power-press');

export default function PowerPressPage() {
  return <SitePage slug="power-press" />;
}
