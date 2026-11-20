import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Download,
  Film,
  Flame,
  Hash,
  Music2,
  Pause,
  Play,
  Scissors,
  Search,
  Sparkles,
  Target,
  Upload,
  Wand2,
} from 'lucide-react';
import {
  GOAL_OPTIONS,
  NICHE_PRESETS,
  PLATFORM_OPTIONS,
  SAMPLE_CLIPS,
  generateStrategy,
  type GoalId,
  type NicheId,
  type PlatformId,
} from '../data/deomeData';

interface SimulatorSectionProps {
  reducedMotion: boolean;
  onSaveWorkspace: () => void;
}

export function SimulatorSection({ reducedMotion, onSaveWorkspace }: SimulatorSectionProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [niche, setNiche] = useState<NicheId>('kuliner');
  const [customTopic, setCustomTopic] = useState<string>(NICHE_PRESETS[0].defaultTopic);
  const [platform, setPlatform] = useState<PlatformId>('TikTok');
  const [goal, setGoal] = useState<GoalId>('followers');
  const [selectedHookId, setSelectedHookId] = useState<string>('hook-contrarian');

  const strategy = useMemo(
    () => generateStrategy(niche, customTopic, platform, goal),
    [niche, customTopic, platform, goal]
  );

  const selectedHook = useMemo(
    () => strategy.hooks.find((h) => h.id === selectedHookId) ?? strategy.hooks[0],
    [strategy, selectedHookId]
  );

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([
    strategy.seoKeywords[0].term,
    strategy.seoKeywords[1].term,
  ]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(strategy.hashtags.slice(0, 4));

  // Sync default selected keywords & hashtags when niche changes
  useEffect(() => {
    setSelectedKeywords(strategy.seoKeywords.slice(0, 2).map((k) => k.term));
    setSelectedHashtags(strategy.hashtags.slice(0, 4));
  }, [niche]);

  // Step 3 states
  const [syncing, setSyncing] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [editTime, setEditTime] = useState(0);

  // Live AI Edit switches
  const [enableAutoHook, setEnableAutoHook] = useState(true);
  const [enableCaptions, setEnableCaptions] = useState(true);
  const [enableJumpCut, setEnableJumpCut] = useState(true);
  const [enableColorSound, setEnableColorSound] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Clean up Object URL on unmount or replace
  useEffect(() => {
    return () => {
      if (uploadedVideoUrl) {
        URL.revokeObjectURL(uploadedVideoUrl);
      }
    };
  }, [uploadedVideoUrl]);

  // Keep sampleIndex aligned gently with niche when user hasn't uploaded own file
  useEffect(() => {
    if (niche === 'kuliner') setSampleIndex(0);
    else if (niche === 'skincare') setSampleIndex(1);
    else setSampleIndex(2);
  }, [niche]);

  const activeSample = SAMPLE_CLIPS[sampleIndex] ?? SAMPLE_CLIPS[0];

  const handleNicheChange = (nextNiche: NicheId) => {
    const preset = NICHE_PRESETS.find((n) => n.id === nextNiche)!;
    setNiche(nextNiche);
    setCustomTopic(preset.defaultTopic);
  };

  const toggleKeyword = (term: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(term) ? prev.filter((item) => item !== term) : [...prev, term]
    );
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleVideoFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) return;
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }
    const url = URL.createObjectURL(file);
    setUploadedVideoUrl(url);
    setUploadedFileName(file.name);
    setIsPlaying(true);
    setEditTime(0);
  };

  const clearUploadedVideo = () => {
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }
    setUploadedVideoUrl(null);
    setUploadedFileName(null);
    setIsPlaying(true);
  };

  const goToStep = (next: 1 | 2 | 3) => {
    if (next === 3 && step !== 3 && !reducedMotion) {
      setStep(3);
      setSyncing(true);
      window.setTimeout(() => setSyncing(false), 650);
    } else {
      setStep(next);
    }
  };

  // Toggle play/pause on real <video> if uploaded
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !uploadedVideoUrl) return;
    if (isPlaying) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isPlaying, uploadedVideoUrl]);

  // Procedural 9:16 Sample Clip renderer + caption timer
  useEffect(() => {
    if (step !== 3) return;
    let rafId = 0;
    let last = performance.now();
    let localT = 0;

    const drawSampleFrame = (t: number) => {
      const canvas = sampleCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const [bgCol, midCol, hiCol] = activeSample.palette;

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, bgCol);
      grad.addColorStop(0.55, midCol);
      grad.addColorStop(1, '#090b12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Moving kinetic studio lights & bokeh
      const speedMul = enableJumpCut ? 1.35 : 0.85;
      for (let i = 0; i < 6; i++) {
        const px = w * (0.5 + 0.36 * Math.sin(t * speedMul * (0.7 + i * 0.15) + i * 1.3));
        const py = h * (0.2 + 0.55 * ((i * 0.18 + t * 0.08 * speedMul) % 1));
        const r = w * (0.14 + 0.06 * Math.cos(t * 1.4 + i));
        const orb = ctx.createRadialGradient(px, py, 0, px, py, r);
        orb.addColorStop(0, i % 2 === 0 ? `${hiCol}99` : 'rgba(255,255,255,0.42)');
        orb.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = orb;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central kinetic product/subject card simulation
      const beatJump = enableJumpCut ? Math.floor((t * 1.5) % 3) : 0;
      const scale = 1 + 0.04 * Math.sin(t * 3) + beatJump * 0.03;
      ctx.save();
      ctx.translate(w * 0.5, h * 0.48);
      ctx.scale(scale, scale);
      ctx.rotate(Math.sin(t * 0.9) * 0.04);

      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 2;
      const cw = w * 0.58;
      const ch = h * 0.32;
      ctx.beginPath();
      ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = `700 ${Math.round(w * 0.065)}px "Inter Tight", sans-serif`;
      ctx.fillText(activeSample.nicheTag.toUpperCase(), 0, -ch * 0.12);

      ctx.fillStyle = hiCol;
      ctx.font = `600 ${Math.round(w * 0.05)}px "Inter Tight", sans-serif`;
      ctx.fillText(
        enableJumpCut ? `SMART CUT #${beatJump + 1}` : 'RAW FOOTAGE',
        0,
        ch * 0.12
      );
      ctx.restore();
    };

    drawSampleFrame(localT);

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!isPlaying || reducedMotion) return;
      localT = (localT + dt) % activeSample.durationSec;
      setEditTime(localT);
      if (!uploadedVideoUrl) {
        drawSampleFrame(localT);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [step, activeSample, isPlaying, enableJumpCut, uploadedVideoUrl, reducedMotion]);

  // Live FYP Score Calculation
  const fypScore = useMemo(() => {
    let score = 52; // raw baseline video
    if (customTopic.trim().length > 4) score += 8;
    score += selectedHook.scoreBoost; // +7..9
    score += Math.min(8, selectedKeywords.length * 3);
    score += Math.min(4, selectedHashtags.length);
    if (enableAutoHook) score += 6;
    if (enableCaptions) score += 6;
    if (enableJumpCut) score += 5;
    if (enableColorSound) score += 4;
    return Math.min(98, score);
  }, [
    customTopic,
    selectedHook,
    selectedKeywords,
    selectedHashtags,
    enableAutoHook,
    enableCaptions,
    enableJumpCut,
    enableColorSound,
  ]);

  // Dynamic Karaoke Caption line & highlighted keyword
  const captionWords = useMemo(() => {
    const baseLine =
      activeSample.captionLines[Math.floor((editTime / 4) % activeSample.captionLines.length)] ??
      activeSample.captionLines[0];
    const kw = selectedKeywords[0] ? `(${selectedKeywords[0]})` : '';
    return `${baseLine} ${kw}`.trim().split(' ');
  }, [activeSample, editTime, selectedKeywords]);

  const activeWordIdx = Math.floor((editTime * 3.2) % Math.max(1, captionWords.length));

  const handleExportBrief = () => {
    const content = [
      `# DEOME.AI — STRATEGY & VIDEO EDIT BRIEF`,
      `Topik / Produk: ${customTopic}`,
      `Niche: ${NICHE_PRESETS.find((n) => n.id === niche)?.label}`,
      `Platform: ${platform} | Target: ${goal.toUpperCase()}`,
      `Prediksi Skor FYP: ${fypScore}/100`,
      ``,
      `## 1. STRATEGY PLAN`,
      `- Content Pillar: ${strategy.pillar}`,
      `- Angle: ${strategy.angle}`,
      `- Durasi Ideal: ${strategy.idealDuration}`,
      `- Waktu Posting Terbaik: ${strategy.bestTime}`,
      `- Hook Terpilih: "${selectedHook.text}"`,
      ``,
      `## 2. STRUKTUR SCRIPT`,
      ...strategy.scriptBeats.map((b) => `- [${b.time}] ${b.stage}: ${b.direction}`),
      ``,
      `## 3. SEO & TREND RADAR`,
      `- Kata Kunci Terpilih: ${selectedKeywords.join(', ') || '-'}`,
      `- Hashtags: ${selectedHashtags.join(' ') || '-'}`,
      `- Rekomendasi Sound: ${strategy.trendingSound.title} (${strategy.trendingSound.bpm})`,
      ``,
      `## 4. KONFIGURASI AI VIDEO EDIT (9:16)`,
      `- Sumber Video: ${uploadedFileName ?? activeSample.label}`,
      `- Auto-Hook Banner: ${enableAutoHook ? 'AKTIF' : 'NONAKTIF'}`,
      `- Dynamic SEO Karaoke Caption: ${enableCaptions ? 'AKTIF' : 'NONAKTIF'}`,
      `- Smart Jump-Cut Pacing: ${enableJumpCut ? 'AKTIF' : 'NONAKTIF'}`,
      `- Color & Sound Trend Boost: ${enableColorSound ? 'AKTIF' : 'NONAKTIF'}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deome-brief-${niche}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="simulator" className="px-4 py-16 md:px-[68px] md:py-24">
      <div className="mx-auto max-w-[1360px]">
        {/* Section Heading */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#111418]/12 bg-white px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#111418]/80 uppercase">
              <Sparkles className="h-3.5 w-3.5 text-[#ff5512]" />
              Interactive 3-Step AI Studio
            </span>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.025em] text-[#111418] md:text-5xl">
              Coba alur Deome sebelum kamu rekam &amp; edit.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-[#111418]/70">
            Susun strategi plan terlebih dahulu, kunci kata kunci SEO &amp; tren terbaru, baru
            unggah videomu ke editor AI 9:16.
          </p>
        </div>

        {/* Dark Studio Container matching Glaze #12151b */}
        <div className="overflow-hidden rounded-[24px] bg-[#12151b] text-white shadow-[0_36px_70px_rgba(32,48,96,0.22)] md:rounded-[38px]">
          {/* Top Stepper Bar */}
          <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { num: 1 as const, label: '01 · Strategy Plan', icon: Target },
                { num: 2 as const, label: '02 · Analisa SEO & Trend', icon: Search },
                { num: 3 as const, label: '03 · Upload & AI Edit 9:16', icon: Wand2 },
              ].map((item) => {
                const Icon = item.icon;
                const active = step === item.num;
                const done = step > item.num;
                return (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => goToStep(item.num)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#ff5512] text-white'
                        : done
                          ? 'bg-white/12 text-white hover:bg-white/18'
                          : 'bg-white/5 text-white/65 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4 text-[#ff5512]" /> : <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs md:self-auto">
              <span className="text-white/60">{platform} · 9:16</span>
              <span className="h-3 w-px bg-white/15" />
              <span className="flex items-center gap-1.5 font-semibold text-[#ff8754]">
                <Flame className="h-3.5 w-3.5 text-[#ff5512]" />
                Skor FYP: {fypScore}/100
              </span>
            </div>
          </div>

          {/* Step Body */}
          <div className="p-5 md:p-8">
            {/* ---------------- STEP 1: STRATEGY PLAN ---------------- */}
            {step === 1 && (
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Input Controls */}
                <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-5">
                  <div>
                    <span className="mb-2 block text-xs font-semibold tracking-wider text-white/60 uppercase">
                      1. Pilih Preset Niche
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {NICHE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleNicheChange(preset.id)}
                          className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                            niche === preset.id
                              ? 'border-[#ff5512] bg-[#ff5512]/15 text-white'
                              : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="deome-topic-input"
                      className="mb-2 block text-xs font-semibold tracking-wider text-white/60 uppercase"
                    >
                      2. Topik / Produk Video Kamu
                    </label>
                    <input
                      id="deome-topic-input"
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Contoh: Kopi susu aren 15 ribuan..."
                      className="w-full rounded-xl border border-white/15 bg-[#0c0e13] px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-[#ff5512]"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="mb-2 block text-xs font-semibold tracking-wider text-white/60 uppercase">
                        3. Platform Fokus
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {PLATFORM_OPTIONS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPlatform(p)}
                            className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                              platform === p
                                ? 'border-white bg-white text-[#111418]'
                                : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="mb-2 block text-xs font-semibold tracking-wider text-white/60 uppercase">
                        4. Tujuan Konten
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {GOAL_OPTIONS.map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setGoal(g.id)}
                            className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                              goal === g.id
                                ? 'border-[#ff5512] bg-[#ff5512]/15 text-white'
                                : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10'
                            }`}
                          >
                            <div className="font-medium">{g.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5512] px-5 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] hover:bg-[#ff682b]"
                  >
                    <span>Lanjut ke Analisa SEO &amp; Trend</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Live Strategy Output */}
                <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#0d1016] p-5 lg:col-span-7">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-[#ff8754] uppercase">
                        AI Strategy Plan Generated
                      </p>
                      <h3 className="mt-1 text-lg font-medium text-white">{strategy.pillar}</h3>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="rounded-lg bg-white/10 px-2.5 py-1 text-white/85">
                        Durasi: {strategy.idealDuration}
                      </span>
                      <span className="rounded-lg bg-[#1430e0]/40 px-2.5 py-1 text-blue-200">
                        {strategy.bestTime}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-white/80">{strategy.angle}</p>

                  {/* 3 Interactive Hook Choices */}
                  <div>
                    <p className="mb-2.5 text-xs font-semibold tracking-wider text-white/60 uppercase">
                      Pilih Hook 3 Detik Pertama (Otomatis masuk ke Edit Video Tahap 3)
                    </p>
                    <div className="grid gap-2.5">
                      {strategy.hooks.map((hook) => {
                        const chosen = selectedHook.id === hook.id;
                        return (
                          <button
                            key={hook.id}
                            type="button"
                            onClick={() => setSelectedHookId(hook.id)}
                            className={`rounded-xl border p-3.5 text-left transition-colors ${
                              chosen
                                ? 'border-[#ff5512] bg-[#ff5512]/12'
                                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="font-semibold text-[#ff8754]">{hook.label}</span>
                              <span className="rounded bg-white/10 px-2 py-0.5 text-white/80">
                                +{hook.scoreBoost} poin retensi
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm font-medium text-white">“{hook.text}”</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Script Beats */}
                  <div>
                    <p className="mb-2.5 text-xs font-semibold tracking-wider text-white/60 uppercase">
                      Struktur Script Detik-per-Detik
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {strategy.scriptBeats.map((beat) => (
                        <div
                          key={beat.time}
                          className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                        >
                          <div className="font-mono text-xs font-semibold text-[#ff8754]">
                            {beat.time}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-white">{beat.stage}</div>
                          <p className="mt-1 text-xs leading-relaxed text-white/65">
                            {beat.direction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- STEP 2: SEO & TREND RADAR ---------------- */}
            {step === 2 && (
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Left Radar Summary */}
                <div className="flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-5">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-[#ff8754] uppercase">
                      Radar Algoritma {platform}
                    </span>
                    <div className="mt-3 flex items-baseline gap-3">
                      <span className="text-5xl font-semibold tracking-tight text-white">
                        {strategy.baseFypScore + selectedHook.scoreBoost}%
                      </span>
                      <span className="text-sm text-emerald-400 font-medium">
                        Peluang Tembus FYP Tinggi
                      </span>
                    </div>
                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#ff5512] transition-all duration-500"
                        style={{
                          width: `${Math.min(98, strategy.baseFypScore + selectedHook.scoreBoost)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Viral Audio Card */}
                  <div className="rounded-xl border border-white/10 bg-[#0d1016] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase">
                      <Music2 className="h-4 w-4 text-[#1430e0]" />
                      Rekomendasi Sound Viral Minggu Ini
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {strategy.trendingSound.title}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/70">
                      <span className="rounded bg-white/10 px-2 py-0.5">
                        {strategy.trendingSound.bpm}
                      </span>
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-emerald-300">
                        {strategy.trendingSound.momentum}
                      </span>
                    </div>
                  </div>

                  {/* Retention Insight */}
                  <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-100">
                    <strong className="block font-semibold text-amber-300">
                      Pola Retensi Kompetitor:
                    </strong>
                    {strategy.retentionTip}
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="rounded-xl border border-white/15 px-4 py-3 text-xs font-medium text-white/80 hover:bg-white/10"
                    >
                      ← Ubah Plan
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff5512] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ff682b]"
                    >
                      <span>Upload &amp; Edit Video AI</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Right SEO Keywords & Hashtag Matrix */}
                <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#0d1016] p-5 lg:col-span-7">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-medium text-white">
                        Kata Kunci Pencarian TikTok &amp; Reels (Klik untuk sisipkan ke Caption)
                      </h3>
                      <span className="text-xs text-white/50">
                        {selectedKeywords.length} dipilih
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      {strategy.seoKeywords.map((kw) => {
                        const checked = selectedKeywords.includes(kw.term);
                        return (
                          <button
                            key={kw.term}
                            type="button"
                            onClick={() => toggleKeyword(kw.term)}
                            className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-colors ${
                              checked
                                ? 'border-[#ff5512] bg-[#ff5512]/12'
                                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium text-white">“{kw.term}”</span>
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                  checked
                                    ? 'border-[#ff5512] bg-[#ff5512] text-white'
                                    : 'border-white/25'
                                }`}
                              >
                                {checked && <Check className="h-3.5 w-3.5" />}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-xs">
                              <span className="rounded bg-white/10 px-2 py-0.5 text-white/80">
                                {kw.volume}
                              </span>
                              <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-emerald-300">
                                {kw.growth}
                              </span>
                              <span className="text-white/55">Komp: {kw.competition}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white/60 uppercase">
                      <Hash className="h-3.5 w-3.5 text-[#ff5512]" />
                      Hashtag Momentum Terbaru
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {strategy.hashtags.map((tag) => {
                        const active = selectedHashtags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleHashtag(tag)}
                            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                              active
                                ? 'border-white bg-white text-[#111418]'
                                : 'border-white/15 bg-white/5 text-white/75 hover:bg-white/10'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- STEP 3: UPLOAD VIDEO & AI EDIT 9:16 ---------------- */}
            {step === 3 && (
              <div className="grid items-start gap-8 lg:grid-cols-12">
                {/* Left Studio Controls */}
                <div className="flex flex-col gap-5 lg:col-span-7">
                  {/* Sync Notification Banner */}
                  {syncing ? (
                    <div className="flex items-center gap-3 rounded-xl border border-[#ff5512]/40 bg-[#ff5512]/15 px-4 py-3 text-sm text-white">
                      <Sparkles className="h-4 w-4 animate-spin text-[#ff5512]" />
                      <span>
                        Menyinkronkan Strategy Plan &amp; {selectedKeywords.length} kata kunci SEO ke
                        AI Video Editor...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white/80">
                      <span>
                        Plan Aktif: <strong className="text-white">{strategy.pillar}</strong>
                      </span>
                      <span className="text-[#ff8754]">
                        SEO Terpasang: {selectedKeywords[0] ?? 'otomatis'}
                      </span>
                    </div>
                  )}

                  {/* Upload Local Video OR Sample Clip */}
                  <div className="rounded-2xl border border-white/10 bg-[#0d1016] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold tracking-wider text-white/65 uppercase">
                        1. Sumber Video (Upload Video Lokal atau Pilih Sample)
                      </span>
                      {uploadedFileName && (
                        <button
                          type="button"
                          onClick={clearUploadedVideo}
                          className="text-xs font-medium text-[#ff8754] hover:underline"
                        >
                          Pakai Sample Clip Lagi
                        </button>
                      )}
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        handleVideoFile(e.dataTransfer.files?.[0]);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                      }}
                      className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
                        dragOver
                          ? 'border-[#ff5512] bg-[#ff5512]/10'
                          : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        aria-label="Upload file video lokal"
                        accept="video/mp4,video/quicktime,video/webm"
                        className="hidden"
                        onChange={(e) => handleVideoFile(e.target.files?.[0])}
                      />
                      <Upload className="h-6 w-6 text-[#ff5512]" />
                      <p className="mt-2 text-sm font-medium text-white">
                        {uploadedFileName
                          ? `Terpasang: ${uploadedFileName}`
                          : 'Tarik & lepas video mentah (.mp4 / .mov / .webm) ke sini'}
                      </p>
                      <p className="mt-1 text-xs text-white/50">
                        Diproses langsung di browser untuk preview real-time (100% privat)
                      </p>
                    </div>

                    {/* 3 Sample Clip Presets */}
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {SAMPLE_CLIPS.map((clip, idx) => {
                        const selected = !uploadedVideoUrl && sampleIndex === idx;
                        return (
                          <button
                            key={clip.id}
                            type="button"
                            onClick={() => {
                              clearUploadedVideo();
                              setSampleIndex(idx);
                            }}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                              selected
                                ? 'border-[#ff5512] bg-[#ff5512]/15 text-white'
                                : 'border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.07]'
                            }`}
                          >
                            <Film className="h-3.5 w-3.5 shrink-0 text-[#ff8754]" />
                            <span className="truncate font-medium">{clip.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live AI Edit Toggles */}
                  <div className="rounded-2xl border border-white/10 bg-[#0d1016] p-5">
                    <span className="mb-3 block text-xs font-semibold tracking-wider text-white/65 uppercase">
                      2. Terapkan Modul AI Edit Berbasis Strategy &amp; SEO
                    </span>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {[
                        {
                          label: 'Auto-Hook Banner (Tahap 1)',
                          desc: 'Pasang teks hook pilihan di zona aman atas',
                          active: enableAutoHook,
                          toggle: () => setEnableAutoHook((v) => !v),
                          icon: Target,
                        },
                        {
                          label: 'Dynamic SEO Caption (Tahap 2)',
                          desc: 'Karaoke teks + sorot kata kunci pencarian',
                          active: enableCaptions,
                          toggle: () => setEnableCaptions((v) => !v),
                          icon: Sparkles,
                        },
                        {
                          label: 'Smart Jump-Cut Pacing',
                          desc: 'Buang jeda hening agar watch-time padat',
                          active: enableJumpCut,
                          toggle: () => setEnableJumpCut((v) => !v),
                          icon: Scissors,
                        },
                        {
                          label: 'Color & Sound Trend Boost',
                          desc: 'Tone punchy + sync audio momentum',
                          active: enableColorSound,
                          toggle: () => setEnableColorSound((v) => !v),
                          icon: Music2,
                        },
                      ].map((mod) => {
                        const Icon = mod.icon;
                        return (
                          <button
                            key={mod.label}
                            type="button"
                            onClick={mod.toggle}
                            className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                              mod.active
                                ? 'border-[#ff5512] bg-[#ff5512]/12'
                                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                                <Icon className="h-3.5 w-3.5 text-[#ff8754]" />
                                {mod.label}
                              </div>
                              <p className="mt-1 text-[11px] leading-snug text-white/60">
                                {mod.desc}
                              </p>
                            </div>
                            <div
                              className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                                mod.active ? 'bg-[#ff5512]' : 'bg-white/20'
                              }`}
                            >
                              <span
                                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                                  mod.active ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* FYP Readiness Live Meter */}
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white/75">
                          Live FYP Readiness Meter
                        </span>
                        <span className="font-semibold text-[#ff8754]">
                          {fypScore >= 88
                            ? `${fypScore}% — Sangat Siap FYP`
                            : `${fypScore}% — Aktifkan modul AI`}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#1430e0] via-[#ff5512] to-[#ff8e53] transition-all duration-300"
                          style={{ width: `${fypScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Export & Workspace Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="rounded-xl border border-white/15 px-4 py-3 text-xs font-medium text-white/80 hover:bg-white/10"
                    >
                      ← Kembali ke SEO
                    </button>
                    <button
                      type="button"
                      onClick={handleExportBrief}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-semibold text-white hover:bg-white/15"
                    >
                      <Download className="h-4 w-4" />
                      Export Brief &amp; Script (.md)
                    </button>
                    <button
                      type="button"
                      onClick={onSaveWorkspace}
                      className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[#ff5512] px-5 py-3 text-xs font-semibold text-white hover:bg-[#ff682b]"
                    >
                      Simpan &amp; Render di Workspace
                    </button>
                  </div>
                </div>

                {/* Right Column: Live 9:16 Phone Studio Preview */}
                <div className="flex flex-col items-center lg:col-span-5">
                  <div className="relative w-full max-w-[300px] overflow-hidden rounded-[28px] border-[4px] border-white/15 bg-[#07080d] shadow-2xl aspect-[9/16]">
                    {/* Video or Canvas Layer */}
                    {uploadedVideoUrl ? (
                      <video
                        ref={videoRef}
                        src={uploadedVideoUrl}
                        loop
                        muted
                        playsInline
                        autoPlay
                        className="h-full w-full object-cover transition-[filter] duration-300"
                        style={{
                          filter: enableColorSound
                            ? 'contrast(1.12) saturate(1.18) brightness(1.03)'
                            : 'none',
                        }}
                      />
                    ) : (
                      <canvas
                        ref={sampleCanvasRef}
                        width={360}
                        height={640}
                        className="h-full w-full object-cover transition-[filter] duration-300"
                        style={{
                          filter: enableColorSound ? 'contrast(1.1) saturate(1.16)' : 'none',
                        }}
                      />
                    )}

                    {/* Top Platform Safe Zone */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3 text-[10px] font-semibold text-white/80">
                      <span className="rounded-full bg-black/45 px-2.5 py-1 backdrop-blur-sm">
                        {platform} 9:16
                      </span>
                      <span className="rounded-full bg-[#ff5512] px-2.5 py-1 text-white">
                        FYP {fypScore}%
                      </span>
                    </div>

                    {/* Auto-Hook Banner Overlay (from Step 1) */}
                    {enableAutoHook && (
                      <div className="pointer-events-none absolute inset-x-4 top-14 rounded-xl bg-white/95 px-3 py-2 text-center shadow-lg">
                        <span className="block text-[9px] font-bold tracking-wider text-[#ff5512] uppercase">
                          HOOK 3 DETIK
                        </span>
                        <p className="mt-0.5 text-xs font-bold leading-snug text-[#111418]">
                          {selectedHook.text}
                        </p>
                      </div>
                    )}

                    {/* TikTok/Reels Right Rail Safe Zone Hint */}
                    <div
                      className="pointer-events-none absolute right-2.5 bottom-24 flex flex-col items-center gap-3 text-[9px] text-white/55"
                      aria-hidden="true"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/35">
                        ♥
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/35">
                        💬
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/35">
                        ↗
                      </div>
                    </div>

                    {/* Dynamic SEO Karaoke Captions (from Step 2) */}
                    {enableCaptions && (
                      <div className="pointer-events-none absolute inset-x-4 bottom-16 text-center">
                        <div className="inline-block rounded-xl bg-black/70 px-3 py-2 backdrop-blur-sm">
                          <p className="flex flex-wrap justify-center gap-x-1 text-sm font-extrabold leading-tight tracking-tight">
                            {captionWords.map((word, idx) => (
                              <span
                                key={`${word}-${idx}`}
                                className={
                                  idx === activeWordIdx ? 'text-[#ff5512]' : 'text-white'
                                }
                              >
                                {word}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bottom Sound Pill & Play Toggle */}
                    <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] text-white/90 backdrop-blur-sm">
                        <Music2 className="h-3 w-3 shrink-0 text-[#ff5512]" />
                        <span className="truncate">
                          {enableColorSound
                            ? strategy.trendingSound.title
                            : 'Audio Asli Video'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPlaying((p) => !p)}
                        aria-label={isPlaying ? 'Jeda preview video' : 'Putar preview video'}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#111418] shadow"
                      >
                        {isPlaying ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Mini Jump-Cut Timeline Strip under 9:16 Preview */}
                  <div className="mt-3 w-full max-w-[300px] rounded-xl border border-white/10 bg-[#0d1016] p-3">
                    <div className="flex items-center justify-between text-[11px] text-white/65">
                      <span>Mini Cut Timeline</span>
                      <span className="font-mono text-[#ff8754]">
                        {enableJumpCut ? '3 dead-air dipangkas' : 'Mode Raw'}
                      </span>
                    </div>
                    <div className="mt-2 flex h-3 w-full items-center gap-1 overflow-hidden rounded bg-white/10 p-0.5">
                      <span className="h-full flex-[3] rounded-sm bg-[#1430e0]" />
                      {enableJumpCut && <span className="h-full w-1 bg-[#ff5512]" />}
                      <span className="h-full flex-[4] rounded-sm bg-[#1430e0]" />
                      {enableJumpCut && <span className="h-full w-1 bg-[#ff5512]" />}
                      <span className="h-full flex-[3] rounded-sm bg-[#1430e0]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
