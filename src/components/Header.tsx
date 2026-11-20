import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface HeaderProps {
  entranceStarted: boolean;
  reducedMotion: boolean;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

const NAV_LINKS = [
  { href: '#alur-kerja', label: 'Alur Kerja' },
  { href: '#simulator', label: 'Simulator' },
  { href: '#fitur', label: 'Fitur' },
  { href: '#harga', label: 'Harga' },
  { href: '#faq', label: 'FAQ' },
];

export function Header({ entranceStarted, reducedMotion, onOpenAuth }: HeaderProps) {
  const [compact, setCompact] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const leftPillRef = useRef<HTMLDivElement | null>(null);
  const rightPillRef = useRef<HTMLDivElement | null>(null);
  const animatedInRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      setCompact(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const left = leftPillRef.current;
    const right = rightPillRef.current;
    if (!left || !right) return;

    if (reducedMotion) {
      gsap.set([left, right], { y: 0, opacity: 1 });
      return;
    }

    if (!entranceStarted) {
      gsap.set([left, right], { y: -20, opacity: 0 });
      return;
    }

    if (!animatedInRef.current) {
      animatedInRef.current = true;
      gsap.to([left, right], {
        y: 0,
        opacity: 1,
        duration: 0.9,
        delay: 0.4,
        stagger: 0.08,
        ease: 'expo.out',
      });
    }
  }, [entranceStarted, reducedMotion]);

  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('[data-more-menu]')) {
        setMoreOpen(false);
      }
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [moreOpen]);

  return (
    <header className="deome-header">
      <div
        ref={leftPillRef}
        className={`deome-pill deome-pill-left ${compact ? 'is-compact' : ''}`}
        data-more-menu
      >
        <a href="#top" className="deome-logo" aria-label="Beranda Deome">
          Deome<span className="deome-logo-dot" aria-hidden="true" />
        </a>

        <nav className="deome-nav" aria-label="Navigasi utama" aria-hidden={compact}>
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href} tabIndex={compact ? -1 : 0}>
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="deome-more-btn"
          aria-label="Menu navigasi cepat"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
        >
          <svg
            viewBox="0 0 4 16"
            className="deome-more-glyph"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="2" cy="2" r="2" />
            <circle cx="2" cy="14" r="2" />
          </svg>
        </button>
      </div>

      {moreOpen && (
        <div className="deome-more-popover" data-more-menu role="menu">
          <div className="flex flex-col gap-1 text-[15px] font-medium text-[#111418]">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setMoreOpen(false)}
                className="rounded-lg px-3 py-2 transition-colors hover:bg-[#111418]/5"
              >
                {item.label}
              </a>
            ))}
            <div className="my-1 h-px bg-[#111418]/10" />
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                onOpenAuth('signup');
              }}
              className="rounded-lg bg-[#16191f] px-3 py-2 text-left text-white transition-colors hover:bg-[#2b3140]"
            >
              Coba Simulator Gratis
            </button>
          </div>
        </div>
      )}

      <div ref={rightPillRef} className="deome-pill deome-pill-right">
        <button
          type="button"
          className="deome-login-btn"
          onClick={() => onOpenAuth('login')}
        >
          Masuk
        </button>
        <button
          type="button"
          className="deome-try-btn"
          onClick={() => onOpenAuth('signup')}
        >
          Coba Gratis
        </button>
      </div>
    </header>
  );
}
