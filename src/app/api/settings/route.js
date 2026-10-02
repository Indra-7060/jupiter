import { ok, withPublic } from '@/lib/api';
import { getSettings } from '@/lib/content';

export const GET = withPublic(async () => {
  const s = await getSettings();
  const { site, contact, social, header, footer, cta } = s;
  return ok({ site, contact, social, header, footer, cta });
});
