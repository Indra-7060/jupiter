'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ActiveLink({ href, children, ...rest }) {
  const pathname = usePathname();
  const on = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
  return (
    <Link href={href} className={on ? 'on' : undefined} {...rest}>
      {children}
    </Link>
  );
}
