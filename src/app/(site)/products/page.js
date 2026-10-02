import SitePage, { sitePageMetadata } from '@/components/site/SitePage';

export const dynamic = 'force-dynamic';
export const generateMetadata = () => sitePageMetadata('products');

export default function ProductsPage() {
  return <SitePage slug="products" />;
}
