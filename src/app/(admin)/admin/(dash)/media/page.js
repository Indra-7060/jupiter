import MediaLibrary from '@/components/admin/MediaLibrary';
import { ToastProvider } from '@/components/admin/Toast';

export const metadata = { title: 'Media library' };

export default function MediaPage() {
  return (
    <ToastProvider>
      <MediaLibrary />
    </ToastProvider>
  );
}
