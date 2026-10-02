'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ActiveLink({ href, children, className, ...rest }) {
  const pathname = usePathname();
  const on = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
  return (
    <Link href={href} className={[className, on && 'on'].filter(Boolean).join(' ') || undefined} {...rest}>
      {children}
    </Link>
  );
}
