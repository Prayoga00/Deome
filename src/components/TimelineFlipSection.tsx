import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { DEOME_SQUIRCLE_PATH } from '../utils/superellipse';
import { drawDeomeTile, type TileVariant } from '../utils/tileRenderer';

interface TimelineFlipSectionProps {
  reducedMotion: boolean;
}

interface ClipDef {
  id: number;
  track: 'V1' | 'V2';
  leftPct: string;
  topPct: string;
  variant: TileVariant;
  label: string;
}

const CLIPS: ClipDef[] = [
  { id: 0, track: 'V1', leftPct: '9.5%', topPct: '18.5%', variant: 0, label: 'Hook Visual' },
  { id: 1, track: 'V2', leftPct: '22.9%', topPct: '58.5%', variant: 1, label: 'Deome Core' },
  { id: 2, track: 'V1', leftPct: '34.1%', topPct: '18.5%', variant: 2, label: 'SEO Pulse' },
  { id: 3, track: 'V2', leftPct: '50.6%', topPct: '58.5%', variant: 3, label: 'FYP Plan' },
  { id: 4, track: 'V1', leftPct: '66.2%', topPct: '18.5%', variant: 4, label: 'Viral Edit' },
];

const RULER_SECONDS = [0, 1, 2, 3, 4, 5, 6];

export function TimelineFlipSection({ reducedMotion }: TimelineFlipSectionProps) {
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  const sectionRef = useRef<HTMLElement | null>(null);
  const timelineBoxRef = useRef<HTMLDivElement | null>(null);
  const statementRef = useRef<HTMLHeadingElement | null>(null);
  const playheadRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);

  const timelineSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const clipBlockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const clipInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sentenceSlotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tileCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  // 1. Live playhead + 60fps canvas tile rendering (only while section in viewport)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let visible = true;
    let rafId = 0;
    let simTime = 2.4;
    let lastNow = performance.now();

    const syncTileSizes = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      tileCanvasRefs.current.forEach((canvas) => {
        if (!canvas) return;
        const size = Math.max(64, Math.round(canvas.clientWidth * dpr));
        if (canvas.width !== size || canvas.height !== size) {
          canvas.width = size;
          canvas.height = size;
        }
      });
    };

    const renderAllTiles = (t: number) => {
      tileCanvasRefs.current.forEach((canvas, idx) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        drawDeomeTile(ctx, canvas.width, CLIPS[idx].variant, t);
      });
    };

    const updatePlayheadDom = (t: number) => {
      const ph = playheadRef.current;
      const pill = pillRef.current;
      if (!ph || !pill) return;
      const leftPct = 8 + 89.6 * (t / 6);
      ph.style.left = `${leftPct}%`;
      const wholeSec = Math.floor(t);
      const centis = Math.floor((t - wholeSec) * 100);
      pill.textContent = `00:${String(wholeSec).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
    };

    syncTileSizes();
    renderAllTiles(simTime);
    updatePlayheadDom(simTime);

    const ro = new ResizeObserver(() => {
      syncTileSizes();
      renderAllTiles(simTime);
    });
    if (timelineBoxRef.current) ro.observe(timelineBoxRef.current);

    if (reducedMotion) {
      return () => ro.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: '200px' }
    );
    io.observe(section);

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

      if (!visible || pausedRef.current) return;

      simTime = (simTime + dt) % 6;
      updatePlayheadDom(simTime);
      renderAllTiles(simTime);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
    };
  }, [reducedMotion]);

  // 2. GSAP FLIP timeline <-> statement choreography + first-reveal drop
  useEffect(() => {
    const section = sectionRef.current;
    const timelineBox = timelineBoxRef.current;
    const statement = statementRef.current;
    if (!section || !timelineBox || !statement) return;

    let inSentence = false;
    let firstRevealed = false;
    let sectionOnScreen = true;
    let lastScrollY = window.scrollY;
    let activeFlight: gsap.core.Timeline | null = null;
    let prevWidth = window.innerWidth;

    const getTargetFor = (i: number) => {
      const slot = timelineSlotRefs.current[i];
      const targetSlot = sentenceSlotRefs.current[i];
      if (!slot || !targetSlot) return null;
      const slotRect = slot.getBoundingClientRect();
      const targetRect = targetSlot.getBoundingClientRect();
      if (slotRect.width <= 0) return null;
      return {
        scale: targetRect.width / slotRect.width,
        x: targetRect.left - slotRect.left + (targetRect.width - slotRect.width) / 2,
        y: targetRect.top - slotRect.top + (targetRect.height - slotRect.height) / 2,
      };
    };

    const syncImmediate = () => {
      activeFlight?.kill();
      activeFlight = null;
      CLIPS.forEach((_, i) => {
        const block = clipBlockRefs.current[i];
        if (!block) return;
        if (!inSentence) {
          gsap.set(block, {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            transformOrigin: 'center center',
          });
        } else {
          const target = getTargetFor(i);
          if (target) {
            gsap.set(block, {
              x: target.x,
              y: target.y,
              scale: target.scale,
              rotation: 0,
              transformOrigin: 'center center',
            });
          }
        }
      });
    };

    const flyTo = (toSentence: boolean) => {
      if (inSentence === toSentence) return;
      inSentence = toSentence;

      if (reducedMotion) {
        syncImmediate();
        return;
      }

      activeFlight?.kill();
      const tl = gsap.timeline();
      activeFlight = tl;

      CLIPS.forEach((_, i) => {
        const block = clipBlockRefs.current[i];
        if (!block) return;
        const startAt = i * (toSentence ? 0.1 : 0.05);
        const wobble = (Math.random() * 30 - 15) || 8;

        if (toSentence) {
          const target = getTargetFor(i);
          if (!target) return;
          tl.to(
            block,
            {
              x: target.x,
              y: target.y,
              scale: target.scale,
              transformOrigin: 'center center',
              duration: 1.5,
              ease: 'power2.inOut',
            },
            startAt
          );
        } else {
          tl.to(
            block,
            {
              x: 0,
              y: 0,
              scale: 1,
              transformOrigin: 'center center',
              duration: 1.5,
              ease: 'power2.inOut',
            },
            startAt
          );
        }

        tl.to(
          block,
          {
            rotation: wobble,
            duration: 0.75,
            ease: 'power2.in',
          },
          startAt
        ).to(
          block,
          {
            rotation: 0,
            duration: 0.75,
            ease: 'power2.out',
          },
          startAt + 0.75
        );
      });
    };

    const checkScroll = () => {
      const currY = window.scrollY;
      const goingDown = currY > lastScrollY;
      const goingUp = currY < lastScrollY;
      lastScrollY = currY;

      if (!firstRevealed && !reducedMotion) {
        const tlRect = timelineBox.getBoundingClientRect();
        if (tlRect.top <= window.innerHeight + 300) {
          firstRevealed = true;
          const firstInner = clipInnerRefs.current[0];
          if (firstInner && !inSentence) {
            gsap.fromTo(
              firstInner,
              { y: -300, rotation: 15 },
              { y: 0, rotation: 0, duration: 2, ease: 'power1.out' }
            );
          }
        }
      }

      if (!sectionOnScreen) return;
      const sentRect = statement.getBoundingClientRect();
      const sentenceVisible = sentRect.top < window.innerHeight && sentRect.bottom > 0;
      if (!sentenceVisible) return;

      if (goingDown && !inSentence) {
        flyTo(true);
      } else if (goingUp && inSentence) {
        flyTo(false);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        sectionOnScreen = entries[0]?.isIntersecting ?? false;
      },
      { rootMargin: '200px' }
    );
    io.observe(section);

    const onResize = () => {
      if (window.innerWidth !== prevWidth) {
        prevWidth = window.innerWidth;
        syncImmediate();
      }
    };

    syncImmediate();
    document.fonts?.ready.then(() => {
      syncImmediate();
    });

    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      activeFlight?.kill();
      io.disconnect();
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="deome-story-section">
      {/* Inline SVG clipPath for superellipse (exponent 4.2, 160 points) */}
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="deome-squircle" clipPathUnits="objectBoundingBox">
            <path d={DEOME_SQUIRCLE_PATH} />
          </clipPath>
        </defs>
      </svg>

      {/* Part 1: Dark Timeline Panel */}
      <div className="deome-timeline-wrap">
        <div ref={timelineBoxRef} className="deome-timeline-box">
          <div className="deome-timeline-panel" aria-label="Timeline editor Deome" />

          <button
            type="button"
            className="deome-pause-btn"
            aria-label={paused ? 'Putar timeline' : 'Jeda timeline'}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? (
              <svg
                viewBox="0 0 11 12"
                className="deome-pause-icon"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M1.5 0.6L10.2 6L1.5 11.4V0.6Z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 11 12"
                className="deome-pause-icon"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="1" y="0.5" width="3" height="11" rx="0.8" />
                <rect x="7" y="0.5" width="3" height="11" rx="0.8" />
              </svg>
            )}
          </button>

          {/* Time Ruler */}
          <div className="deome-ruler" aria-hidden="true">
            {RULER_SECONDS.map((sec, idx) => (
              <div key={sec} className="contents">
                <span className="deome-ruler-label">{sec}s</span>
                {idx < RULER_SECONDS.length - 1 && (
                  <>
                    <span className="deome-ruler-tick" />
                    <span className="deome-ruler-tick deome-ruler-tick-minor-alt" />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Track Labels & Lanes */}
          <span className="deome-track-label deome-track-label-v1">V1</span>
          <span className="deome-track-label deome-track-label-v2">V2</span>
          <div className="deome-track-lane deome-track-lane-v1" aria-hidden="true" />
          <div className="deome-track-lane deome-track-lane-v2" aria-hidden="true" />

          {/* 5 Staggered Motion-Graphic Clip Slots */}
          {CLIPS.map((clip, i) => (
            <div
              key={clip.id}
              ref={(el) => {
                timelineSlotRefs.current[i] = el;
              }}
              className="deome-clip-slot"
              style={{ left: clip.leftPct, top: clip.topPct }}
            >
              <div
                ref={(el) => {
                  clipBlockRefs.current[i] = el;
                }}
                className="deome-clip-block"
              >
                <div
                  ref={(el) => {
                    clipInnerRefs.current[i] = el;
                  }}
                  className="deome-clip-inner"
                >
                  <div className="deome-tile" title={clip.label}>
                    <canvas
                      ref={(el) => {
                        tileCanvasRefs.current[i] = el;
                      }}
                      className="deome-tile-canvas"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Sweeping Orange Playhead */}
          <div ref={playheadRef} className="deome-playhead" aria-hidden="true">
            <span ref={pillRef} className="deome-playhead-pill">
              00:02.40
            </span>
          </div>
        </div>
      </div>

      {/* Part 2: 3-Line Centered FLIP Statement */}
      <div className="deome-statement-wrap">
        <h2 ref={statementRef} className="deome-statement-heading">
          Deome{' '}
          <span
            ref={(el) => {
              sentenceSlotRefs.current[0] = el;
            }}
            className="deome-inline-slot"
            aria-hidden="true"
          />{' '}
          meramu strategi konten{' '}
          <span
            ref={(el) => {
              sentenceSlotRefs.current[1] = el;
            }}
            className="deome-inline-slot"
            aria-hidden="true"
          />{' '}
          lengkap
          <br className="hidden min-[821px]:inline" /> dari analisa SEO{' '}
          <span
            ref={(el) => {
              sentenceSlotRefs.current[2] = el;
            }}
            className="deome-inline-slot"
            aria-hidden="true"
          />{' '}
          &amp; tren terbaru{' '}
          <span
            ref={(el) => {
              sentenceSlotRefs.current[3] = el;
            }}
            className="deome-inline-slot"
            aria-hidden="true"
          />{' '}
          sebelum
          <br className="hidden min-[821px]:inline" /> video kamu{' '}
          <span
            ref={(el) => {
              sentenceSlotRefs.current[4] = el;
            }}
            className="deome-inline-slot"
            aria-hidden="true"
          />{' '}
          diedit AI siap FYP.
        </h2>
      </div>
    </section>
  );
}
