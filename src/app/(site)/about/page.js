import SitePage, { sitePageMetadata } from '@/components/site/SitePage';

export const dynamic = 'force-dynamic';
export const generateMetadata = () => sitePageMetadata('about');

export default function AboutPage() {
  return <SitePage slug="about" mainClass="about" />;
}
