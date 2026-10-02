'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Port of the original main.js / home.js / about.js behaviours.
 * Runs once per route change; every handler registers its own cleanup.
 */
const closedMenus = new Set();

export default function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanups = [];
    const on = (target, ev, fn, opts) => {
      target.addEventListener(ev, fn, opts);
      cleanups.push(() => target.removeEventListener(ev, fn, opts));
    };
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;

    // close mobile nav on route change
    $('.nav')?.classList.remove('open');
    $$('.nav .nv.open').forEach((x) => x.classList.remove('open'));

    // Desktop mega menus are opened purely by CSS :hover. With client-side navigation the pointer
    // is still over the panel after a click, so it would never close. On click we hide the panel
    // with inline !important styles (React never touches this element's style, so a header
    // re-render during navigation cannot undo it), remember it in a module-level set so route
    // changes re-apply it, and release it only when the pointer really leaves that menu.
    const hidePanel = (nv) => {
      const m = nv.querySelector('.mega');
      if (!m) return;
      m.style.setProperty('opacity', '0', 'important');
      m.style.setProperty('visibility', 'hidden', 'important');
      m.style.setProperty('pointer-events', 'none', 'important');
      m.style.setProperty('transition', 'none', 'important');
      nv.classList.add('closed');
    };
    const showPanel = (nv) => {
      const m = nv.querySelector('.mega');
      if (m) ['opacity', 'visibility', 'pointer-events', 'transition'].forEach((k) => m.style.removeProperty(k));
      nv.classList.remove('closed');
    };
    $$('.nav .nv').forEach((nv) => {
      const key = nv.querySelector(':scope > a')?.textContent.trim() || '';
      if (closedMenus.has(key) && innerWidth > 900) hidePanel(nv);
      on(nv, 'click', (e) => {
        if (innerWidth <= 900) return;
        if (e.target.closest('a')) {
          closedMenus.add(key);
          hidePanel(nv);
        }
      });
      const release = () => {
        closedMenus.delete(key);
        showPanel(nv);
      };
      on(nv, 'mouseleave', release);
      on(nv, 'pointerleave', release);
    });

    // burger
    const burger = $('.burger');
    if (burger) on(burger, 'click', () => $('.nav')?.classList.toggle('open'));

    // mobile: accordion for mega menus
    $$('.nav .nv > a').forEach((a) =>
      on(a, 'click', (e) => {
        if (innerWidth > 900) return;
        const nv = a.parentNode;
        if (!nv.classList.contains('open')) {
          e.preventDefault();
          $$('.nav .nv.open').forEach((x) => x.classList.remove('open'));
          nv.classList.add('open');
        }
      })
    );

    // header shadow
    const hdr = $('.hdr');
    const onS = () => hdr && hdr.classList.toggle('sc', scrollY > 10);
    on(window, 'scroll', onS, { passive: true });
    onS();

    // scroll reveal
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    $$('.rv').forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // grid-cell hover
    if (!reduced && !matchMedia('(hover:none)').matches) {
      const d = document.createElement('div');
      d.className = 'gcell';
      document.body.appendChild(d);
      let last = '',
        t;
      on(
        window,
        'mousemove',
        (e) => {
          const s = parseFloat(getComputedStyle(document.documentElement).fontSize) * 6.625;
          const x = Math.floor(e.pageX / s),
            y = Math.floor(e.pageY / s),
            k = x + ',' + y;
          if (k !== last) {
            last = k;
            d.style.left = x * s + 'px';
            d.style.top = y * s + 'px';
          }
          d.classList.add('on');
          clearTimeout(t);
          t = setTimeout(() => d.classList.remove('on'), 1400);
        },
        { passive: true }
      );
      cleanups.push(() => {
        clearTimeout(t);
        d.remove();
      });
    }

    // ghost text: rise + scroll drift
    (() => {
      const els = $$('.cta3 .gh2,.jf .gt');
      if (!els.length) return;
      els.forEach((el, k) => (el._dir = k % 2 ? 1 : -1));
      if (reduced) {
        els.forEach((e) => e.classList.add('in'));
        return;
      }
      const gio = new IntersectionObserver(
        (en) =>
          en.forEach((x) => {
            if (x.isIntersecting) x.target.classList.add('in');
            else if (x.boundingClientRect.top > 0) x.target.classList.remove('in');
          }),
        { threshold: 0.35 }
      );
      els.forEach((e) => gio.observe(e));
      cleanups.push(() => gio.disconnect());
      let tk = false;
      const upd = () => {
        tk = false;
        const vh = innerHeight;
        els.forEach((e) => {
          const r = e.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          const p = (vh - r.top) / (vh + r.height);
          e.style.transform = 'translateX(' + ((p - 0.5) * e._dir * 7).toFixed(2) + 'vw)';
        });
      };
      on(window, 'scroll', () => {
        if (!tk) {
          tk = true;
          requestAnimationFrame(upd);
        }
      }, { passive: true });
      upd();
    })();

    // hero video
    (() => {
      const v = $('.hv-v');
      if (!v) return;
      v.muted = true;
      if (reduced) {
        v.removeAttribute('autoplay');
        v.pause();
        return;
      }
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
      const vio = new IntersectionObserver((e) => (e[0].isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.05 });
      vio.observe(v);
      cleanups.push(() => vio.disconnect());
    })();

    // marquees: identical scroll speed
    (() => {
      const tks = $$('.mq .tk');
      if (!tks.length) return;
      const set = () => {
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize),
          speed = 6 * rem;
        tks.forEach((t) => {
          const half = t.scrollWidth / 2;
          if (half > 0) t.style.animationDuration = (half / speed).toFixed(2) + 's';
        });
      };
      set();
      on(window, 'load', set);
      on(window, 'resize', set);
    })();

    // rows (.erow / .prow): nearest-to-centre row expands its image
    [$$('.erow'), $$('.prow')].forEach((rows) => {
      if (!rows.length) return;
      const act = () => {
        if (innerWidth <= 900) return;
        const mid = innerHeight * 0.5;
        let best = null,
          bd = 1e9;
        rows.forEach((r) => {
          const b = r.getBoundingClientRect();
          const d = Math.abs(b.top + b.height / 2 - mid);
          if (b.bottom > 0 && b.top < innerHeight && d < bd) {
            bd = d;
            best = r;
          }
        });
        rows.forEach((r) => r.classList.toggle('act', r === best));
      };
      on(window, 'scroll', act, { passive: true });
      on(window, 'resize', act);
      act();
      rows.forEach((r) =>
        on(r, 'mouseenter', () => {
          if (innerWidth > 900) rows.forEach((x) => x.classList.toggle('act', x === r));
        })
      );
    });

    // mobile read-more
    (() => {
      const added = [];
      const go = () => {
        if (innerWidth > 900) return;
        $$('.vh .g p,.a-hero p,.mf>p,.art p:first-of-type').forEach((p) => {
          if (p.dataset.rm || p.scrollHeight < 20) return;
          p.dataset.rm = 1;
          p.classList.add('rm-c');
          if (p.scrollHeight <= p.clientHeight + 2) {
            p.classList.remove('rm-c');
            return;
          }
          const b = document.createElement('button');
          b.className = 'rm-b';
          b.type = 'button';
          b.textContent = 'Read more ↓';
          b.onclick = () => {
            const c = p.classList.toggle('rm-c');
            b.textContent = c ? 'Read more ↓' : 'Read less ↑';
          };
          p.after(b);
          added.push([p, b]);
        });
      };
      go();
      on(window, 'load', go);
      cleanups.push(() =>
        added.forEach(([p, b]) => {
          b.remove();
          p.classList.remove('rm-c');
          delete p.dataset.rm;
        })
      );
    })();

    // mission dots (mobile carousel)
    (() => {
      const f = $('.mis2 .four2');
      if (!f) return;
      const s = $('.mis2'),
        d = document.createElement('div');
      d.className = 'mis-dots';
      const n = f.children.length;
      for (let i = 0; i < n; i++) d.appendChild(document.createElement('i'));
      s.appendChild(d);
      const up = () => {
        const k = Math.round(f.scrollLeft / (f.clientWidth || 1));
        [...d.children].forEach((x, j) => (x.className = j === k ? 'on' : ''));
      };
      on(f, 'scroll', up, { passive: true });
      up();
      const t = setInterval(() => {
        if (innerWidth > 900) return;
        const k = Math.round(f.scrollLeft / f.clientWidth);
        f.scrollTo({ left: ((k + 1) % n) * f.clientWidth, behavior: 'smooth' });
      }, 4500);
      on(f, 'touchstart', () => clearInterval(t), { passive: true });
      cleanups.push(() => {
        clearInterval(t);
        d.remove();
      });
    })();

    // carousel dots (mobile)
    $$('.vkg,.vsg,.glg,.cq .cgrid').forEach((c) => {
      const n = c.children.length;
      if (n < 2) return;
      const d = document.createElement('div');
      d.className = 'cdots';
      for (let i = 0; i < n; i++) d.appendChild(document.createElement('i'));
      c.after(d);
      const up = () => {
        const w = c.children[0].offsetWidth + 12,
          k = Math.min(n - 1, Math.round(c.scrollLeft / w));
        [...d.children].forEach((x, j) => (x.className = j === k ? 'on' : ''));
      };
      on(c, 'scroll', up, { passive: true });
      up();
      cleanups.push(() => d.remove());
    });

    // built-to-scale slider
    (() => {
      const rl = $('.bs .rl');
      if (!rl) return;
      const sd = [...rl.children],
        bt = $$('.bs .ctl button'),
        dot = $('.bs .pl i'),
        pl = $('.bs .pl');
      let i = 0,
        t;
      const go = (n) => {
        i = (n + sd.length) % sd.length;
        rl.style.transform = 'translateX(-' + i * 100 + '%)';
        sd.forEach((s, k) => s.classList.toggle('on', k === i));
        bt.forEach((b, k) => b.classList.toggle('on', k === i));
        if (dot && pl) dot.style.left = (sd.length > 1 ? i / (sd.length - 1) : 0) * (pl.clientWidth - 9) + 'px';
      };
      const play = () => {
        clearInterval(t);
        t = setInterval(() => go(i + 1), 5200);
      };
      bt.forEach((b, k) =>
        on(b, 'click', () => {
          go(k);
          play();
        })
      );
      go(0);
      play();
      cleanups.push(() => clearInterval(t));
    })();

    // count-up stats
    (() => {
      const els = $$('.st b[data-n]');
      if (!els.length) return;
      const cio = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (!e.isIntersecting) return;
            cio.unobserve(e.target);
            const el = e.target,
              n = +el.dataset.n,
              suf = el.dataset.s || '',
              st = performance.now();
            (function f(now) {
              const p = Math.min((now - st) / 1400, 1),
                v = Math.round(n * (1 - Math.pow(1 - p, 3)));
              el.textContent = v + suf;
              if (p < 1) requestAnimationFrame(f);
            })(st);
          }),
        { threshold: 0.6 }
      );
      els.forEach((e) => cio.observe(e));
      cleanups.push(() => cio.disconnect());
    })();

    // parallax: Vision & Mission
    (() => {
      if (reduced) return;
      const vis = $('.vis2'),
        mis = $('.mis2');
      if (!vis || !mis) return;
      const vi = vis.querySelector('img'),
        mi = mis.querySelector('img'),
        vt = vis.querySelectorAll('h2,p'),
        mt = mis.querySelector('h2');
      if (!vi || !mi || vt.length < 2 || !mt) return;
      const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
      const prog = (el) => {
        const r = el.getBoundingClientRect(),
          vh = innerHeight;
        return Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
      };
      let tick = false;
      const upd = () => {
        tick = false;
        const R = rem();
        if (innerWidth > 900) {
          let p = prog(vis);
          vi.style.transform = 'translateY(' + p * -4 * R + 'px) scale(' + (1.06 - Math.abs(p) * 0.04) + ')';
          vt[0].style.transform = 'translateY(' + p * 2.2 * R + 'px)';
          vt[1].style.transform = 'translateY(' + p * 3.2 * R + 'px)';
          p = prog(mis);
          mi.style.transform = 'translateY(' + p * -5 * R + 'px) scale(' + (1.14 - (1 - Math.abs(p)) * 0.08) + ')';
          mt.style.transform = 'translateY(' + p * 2.4 * R + 'px)';
          mt.style.opacity = 1 - Math.max(0, Math.abs(p) - 0.55) * 1.6;
        } else {
          vi.style.transform = mi.style.transform = vt[0].style.transform = vt[1].style.transform = mt.style.transform = '';
        }
      };
      const req = () => {
        if (!tick) {
          tick = true;
          requestAnimationFrame(upd);
        }
      };
      on(window, 'scroll', req, { passive: true });
      on(window, 'resize', req);
      upd();
    })();

    // timeline (about)
    (() => {
      const track = $('.track');
      if (!track) return;
      const items = $$('.tli'),
        tabs = $$('.tabs2 button'),
        dot = $('.pline i'),
        bar = $('.pline b'),
        line = $('.pline');
      const setOn = (i) => {
        tabs.forEach((t, k) => t.classList.toggle('on', k === i));
        items.forEach((t, k) => t.classList.toggle('on', k === i));
        if (line && dot && bar) {
          const p = (items.length > 1 ? i / (items.length - 1) : 0) * (line.clientWidth - 7);
          dot.style.left = p + 'px';
          bar.style.width = p + 'px';
        }
      };
      tabs.forEach((t, i) =>
        on(t, 'click', () => {
          track.scrollTo({ left: items[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
          setOn(i);
        })
      );
      let tmr;
      on(
        track,
        'scroll',
        () => {
          clearTimeout(tmr);
          tmr = setTimeout(() => {
            const l = track.scrollLeft;
            let bi = 0,
              bd = 1e9;
            items.forEach((it, k) => {
              const d = Math.abs(it.offsetLeft - track.offsetLeft - l);
              if (d < bd) {
                bd = d;
                bi = k;
              }
            });
            setOn(bi);
          }, 80);
        },
        { passive: true }
      );
      let dn = false,
        sx = 0,
        sl = 0;
      on(track, 'mousedown', (e) => {
        dn = true;
        sx = e.pageX;
        sl = track.scrollLeft;
        track.style.scrollSnapType = 'none';
        track.style.cursor = 'grabbing';
      });
      on(window, 'mouseup', () => {
        if (dn) {
          dn = false;
          track.style.scrollSnapType = '';
          track.style.cursor = '';
        }
      });
      on(window, 'mousemove', (e) => {
        if (dn) track.scrollLeft = sl - (e.pageX - sx);
      });
      setOn(0);
      cleanups.push(() => clearTimeout(tmr));
    })();

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
