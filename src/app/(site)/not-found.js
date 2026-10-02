import Cb from '@/components/site/Cb';

export default function NotFound() {
  return (
    <main>
      <div className="wrap pgw" style={{ textAlign: 'center', padding: '6rem 24px' }}>
        <h1 className="pg-t">Page not found</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>The page you are looking for does not exist or has been moved.</p>
        <Cb href="/" label="Back to Home" />
      </div>
    </main>
  );
}
