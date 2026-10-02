import SitePage, { sitePageMetadata } from '@/components/site/SitePage';

export const dynamic = 'force-dynamic';
export const generateMetadata = () => sitePageMetadata('contact');

export default function ContactPage() {
  return <SitePage slug="contact" />;
}
