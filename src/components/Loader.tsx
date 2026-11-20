import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface LoaderProps {
  sceneReady: boolean;
  reducedMotion: boolean;
  onEntranceStart: () => void;
}

export function Loader({ sceneReady, reducedMotion, onEntranceStart }: LoaderProps) {
  const [removed, setRemoved] = useState(reducedMotion);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const minTimeDoneRef = useRef(false);
  const sceneReadyRef = useRef(sceneReady);
  const exitedRef = useRef(false);
  const onEntranceRef = useRef(onEntranceStart);
  onEntranceRef.current = onEntranceStart;

  useEffect(() => {
    sceneReadyRef.current = sceneReady;
  }, [sceneReady]);

  useEffect(() => {
    if (reducedMotion) {
      onEntranceRef.current();
      setRemoved(true);
      return;
    }

    const layer = layerRef.current;
    const text = textRef.current;
    if (!layer || !text) return;

    const enterTween = gsap.fromTo(
      text,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.7, delay: 0.15, ease: 'expo.out' }
    );

    const tryExit = () => {
      if (exitedRef.current) return;
      if (!minTimeDoneRef.current || !sceneReadyRef.current) return;
      exitedRef.current = true;

      const tl = gsap.timeline({
        onComplete: () => setRemoved(true),
      });
      tl.to(text, {
        yPercent: -110,
        duration: 0.55,
        ease: 'expo.in',
      });
      tl.add(() => {
        onEntranceRef.current();
      }, '-=0.15');
      tl.to(
        layer,
        {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.8,
          ease: 'expo.inOut',
        },
        '<'
      );
    };

    const minTimer = window.setTimeout(() => {
      minTimeDoneRef.current = true;
      tryExit();
    }, 1400);

    const failsafeTimer = window.setTimeout(() => {
      minTimeDoneRef.current = true;
      sceneReadyRef.current = true;
      tryExit();
    }, 6000);

    const pollInterval = window.setInterval(() => {
      if (minTimeDoneRef.current && sceneReadyRef.current) {
        tryExit();
        window.clearInterval(pollInterval);
      }
    }, 50);

    return () => {
      enterTween.kill();
      window.clearTimeout(minTimer);
      window.clearTimeout(failsafeTimer);
      window.clearInterval(pollInterval);
    };
  }, [reducedMotion]);

  if (removed) return null;

  return (
    <div ref={layerRef} className="deome-loader" aria-live="polite">
      <div className="deome-loader-mask">
        <p ref={textRef} className="deome-loader-text">
          Tekan play untuk ide siap FYP.
        </p>
      </div>
    </div>
  );
}
