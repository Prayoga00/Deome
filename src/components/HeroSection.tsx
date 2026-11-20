import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { HeroKeychain3D } from './HeroKeychain3D';

interface HeroSectionProps {
  entranceStarted: boolean;
  reducedMotion: boolean;
  onSceneReady: () => void;
}

export function HeroSection({
  entranceStarted,
  reducedMotion,
  onSceneReady,
}: HeroSectionProps) {
  const line1Ref = useRef<HTMLSpanElement | null>(null);
  const line2Ref = useRef<HTMLSpanElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const l1 = line1Ref.current;
    const l2 = line2Ref.current;
    const sub = subRef.current;
    const cta = ctaRef.current;
    if (!l1 || !l2 || !sub || !cta) return;

    if (reducedMotion) {
      gsap.set([l1, l2], { yPercent: 0 });
      gsap.set([sub, cta], { y: 0, opacity: 1 });
      return;
    }

    if (!entranceStarted) {
      gsap.set([l1, l2], { yPercent: 105 });
      gsap.set([sub, cta], { y: 24, opacity: 0 });
      return;
    }

    if (!animatedRef.current) {
      animatedRef.current = true;
      gsap.to([l1, l2], {
        yPercent: 0,
        duration: 1.2,
        delay: 0.35,
        ease: 'expo.out',
      });
      gsap.to([sub, cta], {
        y: 0,
        opacity: 1,
        duration: 1.0,
        delay: 0.55,
        stagger: 0.1,
        ease: 'expo.out',
      });
    }
  }, [entranceStarted, reducedMotion]);

  return (
    <section id="top" className="deome-hero">
      <HeroKeychain3D
        reducedMotion={reducedMotion}
        startEntrance={entranceStarted}
        onSceneReady={onSceneReady}
      />

      <div className="deome-hero-content">
        <h1 className="deome-hero-headline">
          <span className="deome-line-mask">
            <span ref={line1Ref} className="deome-line-inner">
              Strategi Dulu,
            </span>
          </span>
          <span className="deome-line-mask">
            <span ref={line2Ref} className="deome-line-inner">
              Baru FYP
            </span>
          </span>
        </h1>

        <div className="deome-hero-right">
          <p ref={subRef} className="deome-hero-sub">
            Deome, AI video studio dari riset tren
            <br />
            hingga edit siap viral.
          </p>
          <a ref={ctaRef} href="#simulator" className="deome-hero-cta">
            Mulai Sekarang
          </a>
        </div>
      </div>
    </section>
  );
}
