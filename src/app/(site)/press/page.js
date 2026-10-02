import SitePage, { sitePageMetadata } from '@/components/site/SitePage';

export const dynamic = 'force-dynamic';
export const generateMetadata = () => sitePageMetadata('press');

export default function PressPage() {
  return <SitePage slug="press" />;
}
