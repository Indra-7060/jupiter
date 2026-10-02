import SitePage, { sitePageMetadata } from '@/components/site/SitePage';

export const dynamic = 'force-dynamic';
export const generateMetadata = () => sitePageMetadata('home');

export default function HomePage() {
  return <SitePage slug="home" mainClass="home" />;
}
