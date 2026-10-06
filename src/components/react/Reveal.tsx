import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';

type RevealProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  delay?: number;
  y?: number;
  /** Animate on mount instead of when entering the viewport */
  onMount?: boolean;
};

export default function Reveal({
  children,
  delay = 0,
  y = 28,
  onMount = false,
  className,
  ...props
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const hidden = { opacity: 0, y };
  const visible = { opacity: 1, y: 0 };
  const transition = { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay };
  const mergedClass = ['block', className].filter(Boolean).join(' ');

  if (onMount) {
    return (
      <motion.div
        className={mergedClass}
        initial={ready ? hidden : false}
        animate={ready ? visible : undefined}
        transition={transition}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={mergedClass}
      initial={ready ? hidden : false}
      whileInView={visible}
      viewport={{ once: true, amount: 0.2 }}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}
