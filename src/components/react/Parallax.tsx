import { useRef, type ReactNode } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Vertical travel in px from start→end of scroll through the section */
  distance?: number;
  /** Invert direction */
  reverse?: boolean;
};

/**
 * Soft scroll parallax. Wrap images/text; parent should usually have overflow-hidden.
 */
export default function Parallax({
  children,
  className,
  distance = 48,
  reverse = false,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const from = reverse ? distance : -distance;
  const to = reverse ? -distance : distance;
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [from, to]);

  return (
    <div ref={ref} className={className}>
      <motion.div className="h-full w-full will-change-transform" style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
