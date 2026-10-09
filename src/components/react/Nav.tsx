import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const links = [
  { href: '/#studio', label: 'Studio' },
  { href: '/#identita', label: 'Identità' },
  { href: '/contatti', label: 'Contatti' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-sand/40 bg-cream/96 backdrop-blur-sm">
      <div className="section-pad flex h-16 items-center justify-between">
        <a
          href="/"
          className="font-display text-[14.72px] tracking-[0.6px] text-ink"
        >
          Miriana Studio
        </a>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Principale">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[10px] font-medium uppercase tracking-[2px] text-taupe transition-colors hover:text-terracotta"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
          aria-label={open ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span
              className={`block h-px w-full bg-ink transition ${open ? 'translate-y-[3.5px] rotate-45' : ''}`}
            />
            <span
              className={`block h-px w-full bg-ink transition ${open ? 'translate-y-[-3.5px] -rotate-45' : ''}`}
            />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="section-pad border-t border-sand/40 bg-cream pb-8 pt-6 md:hidden"
            aria-label="Mobile"
          >
            <ul className="flex flex-col gap-6">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-display text-2xl text-terracotta"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
