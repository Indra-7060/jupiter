import SmartLink from './SmartLink';
import { quoteHref } from '@/lib/util';

/** The animated "cb" call-to-action button used across the site. */
export default function Cb({ href = '#', label, variant = '', className = '', as = 'a', ...rest }) {
  href = quoteHref(href, undefined, label); // "Request a Quote" buttons always reach the quote page
  const cls = ['cb', variant, className].filter(Boolean).join(' ');
  const inner = (
    <>
      <span className="tx">
        <span>
          <b>{label}</b>
          <b>{label}</b>
        </span>
      </span>
      <span className="ar">
        <svg viewBox="0 0 24 24">
          <path d="M6 18L18 6M7.5 6H18v10.5" />
        </svg>
      </span>
    </>
  );
  if (as === 'button') {
    return (
      <button className={cls} {...rest}>
        {inner}
      </button>
    );
  }
  return (
    <SmartLink href={href} className={cls} {...rest}>
      {inner}
    </SmartLink>
  );
}
