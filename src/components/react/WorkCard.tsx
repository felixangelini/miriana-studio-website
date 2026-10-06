import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

type WorkCardProps = {
  src: string;
  alt: string;
  label: string;
  className?: string;
  /** Horizontal offset: positive = from right, negative = from left */
  x?: number;
  /** Vertical offset (default 36) */
  y?: number;
  delay?: number;
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function WorkCard({
  src,
  alt,
  label,
  className = '',
  x = 0,
  y = 36,
  delay = 0,
}: WorkCardProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.25,
    margin: '0px 0px -8% 0px',
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const play = ready && inView;

  return (
    <motion.article
      ref={ref}
      className={`group relative h-full w-full min-h-0 overflow-hidden bg-sand ${className}`}
      initial={reduceMotion ? false : { opacity: 0, x, y }}
      animate={
        reduceMotion || play
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x, y }
      }
      whileHover={reduceMotion ? undefined : { scale: 1.01 }}
      transition={{ duration: 0.9, ease, delay }}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <p className="absolute bottom-4 left-4 text-[10px] font-medium uppercase tracking-[2px] text-cream/70">
        {label}
      </p>
    </motion.article>
  );
}
