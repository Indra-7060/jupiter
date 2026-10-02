'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * One row of dropdown cards. Every dropdown shows the same four card slots;
 * when a menu has more items the row scrolls sideways with arrow buttons.
 */
export default function MegaRow({ children }) {
  const ref = useRef(null);
  const [can, setCan] = useState({ prev: false, next: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () =>
      setCan({
        prev: el.scrollLeft > 4,
        next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, []);

  const go = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className={`mg-row${can.prev ? ' has-prev' : ''}${can.next ? ' has-next' : ''}`}>
      <ul className="mg" ref={ref}>
        {children}
      </ul>
      <button type="button" className="mg-nav prev" aria-label="Previous items" hidden={!can.prev} onClick={() => go(-1)}>
        <span aria-hidden="true">‹</span>
      </button>
      <button type="button" className="mg-nav next" aria-label="More items" hidden={!can.next} onClick={() => go(1)}>
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}
