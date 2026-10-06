import { useEffect } from 'react';
import Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll() {
  useEffect(() => {
    let frame = 0;
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });

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
      lenis.scrollTo(el as HTMLElement, { offset: -72 });
      history.pushState(null, '', hash);
    };

    document.addEventListener('click', onHashClick);

    return () => {
      document.removeEventListener('click', onHashClick);
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <div aria-hidden="true" className="hidden" data-smooth-scroll />;
}
