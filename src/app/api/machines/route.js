import { ok, withPublic } from '@/lib/api';
import { getMachines } from '@/lib/content';

export const GET = withPublic(async () => ok(await getMachines()));
