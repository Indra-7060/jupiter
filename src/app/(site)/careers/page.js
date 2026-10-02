import SitePage, { sitePageMetadata } from '@/components/site/SitePage';

export const dynamic = 'force-dynamic';
export const generateMetadata = () => sitePageMetadata('careers');

export default function CareersPage() {
  return <SitePage slug="careers" />;
}
