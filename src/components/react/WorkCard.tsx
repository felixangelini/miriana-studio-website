import { motion } from 'motion/react';

type WorkCardProps = {
  src: string;
  alt: string;
  label: string;
  className?: string;
};

export default function WorkCard({ src, alt, label, className = '' }: WorkCardProps) {
  return (
    <motion.article
      className={`group relative h-full w-full min-h-0 overflow-hidden bg-sand ${className}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
