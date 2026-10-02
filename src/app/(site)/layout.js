import '@/styles/style.css';
import '@/styles/about.css';
import '@/styles/home.css';
import '@/styles/shell.css';
import '@/styles/pages.css';
import '@/styles/mobile.css';
import '@/styles/careers.css';
import '@/styles/motion.css';
import '@/styles/layout-fixes.css';

import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import SiteEffects from '@/components/site/SiteEffects';
import WhatsAppButton from '@/components/site/WhatsAppButton';
import { getMenu, getSettings } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSettings();
  const site = settings.site || {};
  return {
    title: { default: site.name || 'Jupiter Industrial Works', template: `%s${site.titleSuffix || ''}` },
    description: site.metaDescription || '',
    icons: site.favicon ? { icon: site.favicon } : undefined,
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  };
}

export default async function SiteLayout({ children }) {
  const [settings, menu] = await Promise.all([getSettings(), getMenu()]);
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header menu={menu} settings={settings} />
        {children}
        <Footer settings={settings} />
        <WhatsAppButton contact={settings.contact} />
        <SiteEffects />
      </body>
    </html>
  );
}
