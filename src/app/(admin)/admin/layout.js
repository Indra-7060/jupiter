import '@/styles/admin.css';

export const metadata = {
  title: { default: 'Admin · Jupiter Industrial Works', template: '%s · Jupiter Admin' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
