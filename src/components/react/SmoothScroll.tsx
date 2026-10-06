import { useEffect } from 'react';
import Lenis from 'lenis';
import Snap from 'lenis/snap';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll() {
  useEffect(() => {
    let frame = 0;
    const preferReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      duration: preferReduced ? 0.6 : 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !preferReduced,
      touchMultiplier: 1.15,
    });

    let snap: Snap | null = null;

    if (!preferReduced) {
      // Calamita solo vicino ai bordi sezione — scroll libero nel mezzo
      snap = new Snap(lenis, {
        type: 'proximity',
        distanceThreshold: '18%',
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        debounce: 120,
      });

      const sections = [
        ...document.querySelectorAll<HTMLElement>('[data-snap]'),
      ];
      snap.addElements(sections, { align: 'start' });
    }

    window.__lenis = lenis;
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const onHashClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const el = document.querySelector(hash);
      if (!el) return;
      event.preventDefault();
      lenis.scrollTo(el as HTMLElement, {
        offset: 0,
        duration: preferReduced ? 0.5 : 1.3,
      });
      history.pushState(null, '', hash);
    };

    const onResize = () => {
      snap?.resize();
    };

    document.addEventListener('click', onHashClick);
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('click', onHashClick);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
      snap?.destroy();
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <div aria-hidden="true" className="hidden" data-smooth-scroll />;
}
