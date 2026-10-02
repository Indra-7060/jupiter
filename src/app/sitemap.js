import { getCustomPageSlugs, getMachines, getPosts, getProductCategories } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const [cats, machines, posts, custom] = await Promise.all([getProductCategories(), getMachines(), getPosts(), getCustomPageSlugs()]);
  const urls = ['/', '/about', '/products', '/power-press', '/press', '/careers', '/contact'];
  cats.forEach((c) => urls.push(`/products/${c.slug}`));
  machines.forEach((m) => urls.push(`/power-press/${m.slug}`));
  posts.forEach((p) => urls.push(`/press/${p.slug}`));
  custom.forEach((s) => urls.push(`/${s}`));
  return urls.map((u) => ({ url: `${base}${u}`, lastModified: new Date() }));
}
