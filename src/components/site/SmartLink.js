import Link from 'next/link';

export default function SmartLink({ href = '#', children, ...rest }) {
  const isInternal = href.startsWith('/') && !href.startsWith('//');
  if (isInternal) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
