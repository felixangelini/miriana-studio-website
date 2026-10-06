import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
} from 'motion/react';

type RevealProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  delay?: number;
  duration?: number;
  /** Vertical offset (default 40). Set 0 to disable. */
  y?: number;
  /** Horizontal offset: positive = from right, negative = from left */
  x?: number;
  /** Animate as soon as the island mounts (hero / client:visible) */
  onMount?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function Reveal({
  children,
  delay = 0,
  duration = 1,
  y = 40,
  x = 0,
  onMount = false,
  className,
  ...props
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: '0px 0px -10% 0px',
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  const play = ready && (onMount || inView);
  const hidden = { opacity: 0, x, y };
  const visible = { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={hidden}
      animate={play ? visible : hidden}
      transition={{ duration, ease, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
