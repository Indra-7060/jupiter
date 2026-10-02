import SettingsEditor from '@/components/admin/SettingsEditor';
import { ToastProvider } from '@/components/admin/Toast';

export const metadata = { title: 'Site settings' };

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsEditor />
    </ToastProvider>
  );
}
