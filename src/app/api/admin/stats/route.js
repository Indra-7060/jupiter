import { ok, withAdmin } from '@/lib/api';
import { db, plain } from '@/lib/db';

export const GET = withAdmin(async () => {
  const m = db();
  const [products, items, machines, posts, enquiries, newEnquiries, media, pages, recent] = await Promise.all([
    m.ProductCategory.count(),
    m.Product.count(),
    m.Machine.count(),
    m.Post.count(),
    m.Enquiry.count(),
    m.Enquiry.count({ where: { status: 'new' } }),
    m.Media.count(),
    m.Page.count(),
    m.Enquiry.findAll({ order: [['createdAt', 'DESC']], limit: 6 }),
  ]);
  return ok({ products, items, machines, posts, enquiries, newEnquiries, media, pages, recent: plain(recent) });
});
