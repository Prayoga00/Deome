import { useEffect, useRef } from 'react';
import { TICKER_ITEMS, type TickerItem } from '../data/deomeData';

interface LogoTickerProps {
  reducedMotion: boolean;
}

const VARIANT_CLASS: Record<TickerItem['variant'], string> = {
  archivo: 'deome-logo-archivo',
  unbounded: 'deome-logo-unbounded',
  syncopate: 'deome-logo-syncopate',
  michroma: 'deome-logo-michroma',
  'inter-light': 'deome-logo-inter-light',
  'inter-semi': 'deome-logo-inter-semi',
};

export function LogoTicker({ reducedMotion }: LogoTickerProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const firstList = firstListRef.current;
    if (!section || !track || !firstList || reducedMotion) return;

    let x = 0;
    let boost = 0;
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let visible = true;
    let rafId = 0;

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.01 }
    );
    io.observe(section);

    const onScroll = () => {
      const nextY = window.scrollY;
      const delta = Math.abs(nextY - lastScrollY);
      lastScrollY = nextY;
      boost = Math.min(900, boost + delta * 2.2);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (!visible) return;

      const listWidth = firstList.offsetWidth;
      if (listWidth <= 0) return;

      const phoneScale = window.innerWidth <= 820 ? 2.4 : 1;
      const speed = (70 + boost) * dt * (window.innerWidth / 1536) * phoneScale;
      x -= speed;
      if (x <= -listWidth) {
        x += listWidth;
      }

      boost *= Math.pow(0.04, dt);
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [reducedMotion]);

  return (
    <section id="alur-kerja" ref={sectionRef} className="deome-ticker-section">
      <p className="deome-ticker-caption">
        Kreator, UMKM, dan agency lokal bertumbuh bersama Deome
      </p>

      <div className="deome-ticker-marquee">
        <div ref={trackRef} className="deome-ticker-track">
          <div ref={firstListRef} className="deome-ticker-list">
            {TICKER_ITEMS.map((item) => (
              <span
                key={`a-${item.text}`}
                className={`deome-ticker-item ${VARIANT_CLASS[item.variant]}`}
              >
                {item.text}
              </span>
            ))}
          </div>
          <div className="deome-ticker-list" aria-hidden="true">
            {TICKER_ITEMS.map((item) => (
              <span
                key={`b-${item.text}`}
                className={`deome-ticker-item ${VARIANT_CLASS[item.variant]}`}
              >
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
