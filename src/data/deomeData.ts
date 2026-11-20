export type NicheId = 'kuliner' | 'skincare' | 'tech' | 'fashion';
export type PlatformId = 'TikTok' | 'Instagram Reels' | 'YouTube Shorts';
export type GoalId = 'followers' | 'affiliate' | 'awareness';

export interface StrategyOutput {
  pillar: string;
  angle: string;
  bestTime: string;
  idealDuration: string;
  hooks: { id: string; label: string; text: string; scoreBoost: number }[];
  scriptBeats: { time: string; stage: string; direction: string }[];
  seoKeywords: { term: string; volume: string; competition: 'Rendah' | 'Sedang' | 'Tinggi'; growth: string }[];
  hashtags: string[];
  trendingSound: { title: string; bpm: string; momentum: string };
  retentionTip: string;
  baseFypScore: number;
}

export interface SampleClipPreset {
  id: string;
  label: string;
  nicheTag: string;
  durationSec: number;
  palette: [string, string, string];
  captionLines: string[];
}

export interface TickerItem {
  text: string;
  variant:
    | 'archivo'
    | 'unbounded'
    | 'syncopate'
    | 'michroma'
    | 'inter-light'
    | 'inter-semi';
}

export const TICKER_ITEMS: TickerItem[] = [
  { text: 'KaryaKita', variant: 'archivo' },
  { text: 'NARASI.ID', variant: 'unbounded' },
  { text: 'BUMIKREATIF', variant: 'syncopate' },
  { text: 'SUARALOKA', variant: 'michroma' },
  { text: 'RUANGVISUAL', variant: 'inter-light' },
  { text: 'Kopi&Klip', variant: 'inter-semi' },
  { text: 'TITIKTEMU', variant: 'unbounded' },
  { text: 'SinarMedia', variant: 'archivo' },
];

export interface NichePreset {
  id: NicheId;
  label: string;
  defaultTopic: string;
  sampleCaptionTag: string;
}

export const NICHE_PRESETS: NichePreset[] = [
  {
    id: 'kuliner',
    label: 'Kuliner / UMKM FnB',
    defaultTopic: 'Es Kopi Susu Gula Aren Rp 15rb Bikin Antre',
    sampleCaptionTag: 'Hidden Gem & Recipe Hook',
  },
  {
    id: 'skincare',
    label: 'Skincare & Beauty',
    defaultTopic: 'Serum Niacinamide 5% vs Skin Barrier Sensitif',
    sampleCaptionTag: 'Problem-Solution Review',
  },
  {
    id: 'tech',
    label: 'Tech & Edukasi',
    defaultTopic: '3 Workflow AI yang Pangkas Jam Kerja Kreator',
    sampleCaptionTag: 'Listicle Tutorial Cepat',
  },
  {
    id: 'fashion',
    label: 'Fashion & Affiliate',
    defaultTopic: 'Mix & Match Jaket Boxy Lokal Under Rp 250rb',
    sampleCaptionTag: 'Styling 3 Look + Keranjang',
  },
];

export const GOAL_OPTIONS: { id: GoalId; label: string; desc: string }[] = [
  { id: 'followers', label: 'Naikin Followers', desc: 'Optimasi share, save, & follow hook' },
  { id: 'affiliate', label: 'Penjualan / Affiliate', desc: 'FYP tinggi + dorong klik keranjang' },
  { id: 'awareness', label: 'Brand Awareness', desc: 'Maksimalkan reach & recall 3 detik awal' },
];

export const PLATFORM_OPTIONS: PlatformId[] = ['TikTok', 'Instagram Reels', 'YouTube Shorts'];

export const SAMPLE_CLIPS: SampleClipPreset[] = [
  {
    id: 'clip-fnb',
    label: 'Klip 1 — B-Roll Tuang Kopi 60fps',
    nicheTag: 'Kuliner / UMKM',
    durationSec: 18,
    palette: ['#1e1b18', '#c86d2d', '#ff5512'],
    captionLines: [
      'Modal 15 ribuan tapi rasanya',
      'bikin orang balik lagi tiap sore',
      'Ini rahasia takaran gula arennya',
    ],
  },
  {
    id: 'clip-skin',
    label: 'Klip 2 — Talking Head + Tekstur Serum',
    nicheTag: 'Skincare & Review',
    durationSec: 21,
    palette: ['#0f1c36', '#2b5ce0', '#b8e1ff'],
    captionLines: [
      'Jangan asal layer serum ini',
      'kalau skin barrier lagi kemerahan',
      'Cek urutan pakai yang aman di sini',
    ],
  },
  {
    id: 'clip-tech',
    label: 'Klip 3 — Screen Demo Workflow AI',
    nicheTag: 'Tech & Edukasi',
    durationSec: 24,
    palette: ['#101521', '#1430e0', '#ff5512'],
    captionLines: [
      'Kebanyakan kreator edit dulu',
      'baru mikirin kenapa videonya sepi',
      'Balik urutannya biar tembus FYP',
    ],
  },
];

export function generateStrategy(
  niche: NicheId,
  customTopic: string,
  platform: PlatformId,
  goal: GoalId
): StrategyOutput {
  const cleanTopic = customTopic.trim() || NICHE_PRESETS.find((n) => n.id === niche)!.defaultTopic;

  const goalHooks: Record<GoalId, string> = {
    followers: 'Follow dulu biar gak ketinggalan seri lanjutannya',
    affiliate: 'Cek keranjang kuning / link bio sebelum stok batch ini habis',
    awareness: 'Simpan video ini buat referensi tim & konten berikutnya',
  };

  const platformWindow: Record<PlatformId, string> = {
    TikTok: '18.30 – 21.00 WIB (Peak FYP Malam)',
    'Instagram Reels': '12.00 – 13.30 & 19.00 WIB',
    'YouTube Shorts': '16.00 – 20.00 WIB',
  };

  const baseByNiche: Record<NicheId, Omit<StrategyOutput, 'bestTime' | 'hooks' | 'scriptBeats'>> = {
    kuliner: {
      pillar: 'Behind-the-Bar Proof & Sensory ASMR',
      angle: `Membongkar alasan "${cleanTopic}" ramai dicari dengan visual close-up 1.5 detik pertama.`,
      idealDuration: '16–22 detik',
      seoKeywords: [
        { term: 'rekomendasi kopi viral', volume: '148K/bln', competition: 'Sedang', growth: '+64%' },
        { term: 'ide jualan umkm laris', volume: '92K/bln', competition: 'Rendah', growth: '+112%' },
        { term: 'racikan es kopi gula aren', volume: '61K/bln', competition: 'Rendah', growth: '+48%' },
        { term: 'review jujur minuman hits', volume: '74K/bln', competition: 'Sedang', growth: '+39%' },
      ],
      hashtags: ['#fypkuliner', '#idejualanviral', '#kopisusuaren', '#umkmbangkit', '#rekomendasimakan'],
      trendingSound: {
        title: 'Lo-Fi Café Beat — Warm Guitar Cut',
        bpm: '104 BPM',
        momentum: 'Naik +140% minggu ini',
      },
      retentionTip: 'Potong jeda diam >0.3s sebelum suara tuang es agar 3s retention bertahan di atas 74%.',
      baseFypScore: 78,
    },
    skincare: {
      pillar: 'Myth-Busting + Tekstur Proof',
      angle: `Menguji "${cleanTopic}" lewat perbandingan sebelum-sesudah yang langsung terlihat di layar.`,
      idealDuration: '18–25 detik',
      seoKeywords: [
        { term: 'cara perbaiki skin barrier', volume: '215K/bln', competition: 'Sedang', growth: '+82%' },
        { term: 'review skincare aman lokal', volume: '134K/bln', competition: 'Rendah', growth: '+57%' },
        { term: 'urutan skincare malam pemula', volume: '189K/bln', competition: 'Tinggi', growth: '+33%' },
        { term: 'serum buat kulit sensitif', volume: '96K/bln', competition: 'Rendah', growth: '+71%' },
      ],
      hashtags: ['#skincareindonesia', '#skinbarrier', '#reviewskincare', '#fypskincare', '#tipsglowing'],
      trendingSound: {
        title: 'Clean Aesthetic Synth — Soft Pulse',
        bpm: '112 BPM',
        momentum: 'Stabil di Top 20 Beauty ID',
      },
      retentionTip: 'Tampilkan teks masalah kulit di 0.8 detik pertama tepat di zona aman atas frame 9:16.',
      baseFypScore: 81,
    },
    tech: {
      pillar: 'Contrarian Insight + Live Demo',
      angle: `Menunjukkan shortcut nyata dari "${cleanTopic}" dalam 3 langkah visual tanpa teori panjang.`,
      idealDuration: '20–28 detik',
      seoKeywords: [
        { term: 'ai untuk buat konten fyp', volume: '118K/bln', competition: 'Rendah', growth: '+165%' },
        { term: 'cara edit video biar fyp', volume: '172K/bln', competition: 'Sedang', growth: '+94%' },
        { term: 'strategi konten tiktok 2026', volume: '84K/bln', competition: 'Rendah', growth: '+128%' },
        { term: 'tools ai kreator gratis', volume: '142K/bln', competition: 'Sedang', growth: '+76%' },
      ],
      hashtags: ['#tipsai', '#belajaredit', '#kontenkreator', '#strategifyp', '#produktivitas'],
      trendingSound: {
        title: 'Glitch Tech Pluck — Clean Perc',
        bpm: '124 BPM',
        momentum: 'Naik +195% kategori Edukasi',
      },
      retentionTip: 'Ganti shot atau zoom UI setiap 2.2 detik untuk mencegah penonton swipe di pertengahan.',
      baseFypScore: 84,
    },
    fashion: {
      pillar: '3-Look Styling Transformation',
      angle: `Transformasi cepat dari "${cleanTopic}" dengan transisi beat-sync dan rincian harga transparan.`,
      idealDuration: '14–19 detik',
      seoKeywords: [
        { term: 'outfit brand lokal keren', volume: '164K/bln', competition: 'Sedang', growth: '+89%' },
        { term: 'mix and match jaket boxy', volume: '58K/bln', competition: 'Rendah', growth: '+144%' },
        { term: 'racun outfit under 250rb', volume: '129K/bln', competition: 'Sedang', growth: '+73%' },
        { term: 'ootd cowok cewek simpel', volume: '198K/bln', competition: 'Tinggi', growth: '+41%' },
      ],
      hashtags: ['#brandlokal', '#racunoutfit', '#outfitcheck', '#fypfashion', '#mixandmatch'],
      trendingSound: {
        title: 'Nu-Disco Bass Drop — 16s Cut',
        bpm: '118 BPM',
        momentum: 'Dipakai 48rb+ video 48 jam terakhir',
      },
      retentionTip: 'Kunci hook "Lihat Look #3" di awal agar penonton bertahan sampai detik terakhir.',
      baseFypScore: 80,
    },
  };

  const base = baseByNiche[niche];
  const shortTopic = cleanTopic.length > 42 ? `${cleanTopic.slice(0, 42)}...` : cleanTopic;

  const hooks = [
    {
      id: 'hook-contrarian',
      label: 'Hook Kontras (Tinggi Watch-Time)',
      text: `Stop bikin "${shortTopic}" dengan cara lama—ini yang bikin tembus FYP.`,
      scoreBoost: 9,
    },
    {
      id: 'hook-proof',
      label: 'Hook Bukti Cepat (Tinggi Save/Share)',
      text: `3 detail kecil di "${shortTopic}" yang langsung naikin retensi 2x lipat.`,
      scoreBoost: 8,
    },
    {
      id: 'hook-curiosity',
      label: 'Hook Rasa Penasaran (Tinggi Komentar)',
      text: `Kenapa "${shortTopic}" bisa meledak dalam 24 jam? Perhatikan detik ke-4.`,
      scoreBoost: 7,
    },
  ];

  const scriptBeats = [
    {
      time: '00:00 – 00:03',
      stage: 'Hook Visual + Teks Utama',
      direction: `Cut langsung ke aksi puncak "${shortTopic}" sambil tampilkan banner hook di atas frame.`,
    },
    {
      time: '00:03 – 00:13',
      stage: 'Pembuktian & Keyword SEO',
      direction: `Sampaikan poin inti bernada cepat (tanpa jeda hening) dan sebut kata kunci "${base.seoKeywords[0].term}".`,
    },
    {
      time: '00:13 – 00:20',
      stage: 'Climax & Call-to-Action',
      direction: `Tutup dengan summary visual jelas + CTA: "${goalHooks[goal]}".`,
    },
  ];

  return {
    ...base,
    bestTime: platformWindow[platform],
    hooks,
    scriptBeats,
  };
}

export interface FeaturePillar {
  step: string;
  title: string;
  desc: string;
  metric: string;
}

export const FEATURE_PILLARS: FeaturePillar[] = [
  {
    step: '01',
    title: 'Strategy Plan Sebelum Rekam',
    desc: 'Jangan tebak-tebakan konsep. Deome menyusun content pillar, 3 variasi hook 3 detik, dan struktur script detik-per-detik sesuai target audiens.',
    metric: '+68% Hook Hold Rate',
  },
  {
    step: '02',
    title: 'Radar SEO & Tren Real-Time',
    desc: 'Pantau kata kunci pencarian TikTok & Reels Indonesia yang lagi naik daun, kompetisi rendah, plus audio momentum sebelum kompetitor ramai memakai.',
    metric: 'Update Tren Harian',
  },
  {
    step: '03',
    title: 'AI Edit Otomatis Siap FYP',
    desc: 'Unggah footage mentahmu dan biarkan AI menerapkan hook banner, dynamic karaoke captions berisi keyword SEO, serta smart cut pembuang jeda diam.',
    metric: '10x Lebih Cepat Publish',
  },
];

export interface PricingTier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: string;
  annualPrice: string;
  periodLabel: string;
  popular?: boolean;
  ctaLabel: string;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'gratis',
    name: 'Gratis',
    tagline: 'Untuk uji coba alur strategi hingga edit AI pertama.',
    monthlyPrice: 'Rp 0',
    annualPrice: 'Rp 0',
    periodLabel: 'selamanya',
    ctaLabel: 'Mulai Gratis',
    features: [
      '3 AI Strategy Plan & Script / bulan',
      'Audit SEO & Trend Radar Mingguan',
      '3 Ekspor Video AI Edit 720p (watermark ringan)',
      'Auto-Hook & Subtitle Bahasa Indonesia',
    ],
  },
  {
    id: 'kreator-pro',
    name: 'Kreator Pro',
    tagline: 'Paket andalan kreator harian yang kejar konsistensi FYP.',
    monthlyPrice: 'Rp 149.000',
    annualPrice: 'Rp 119.000',
    periodLabel: '/ bulan',
    popular: true,
    ctaLabel: 'Pilih Kreator Pro',
    features: [
      'Unlimited AI Strategy Plan & Variasi Hook',
      'SEO Keyword & Viral Audio Radar Real-Time',
      '30 Ekspor Video 4K 60fps Bebas Watermark',
      'Dynamic Karaoke Captions + Smart Jump-Cut',
      'Prediksi Skor FYP Sebelum Publish',
    ],
  },
  {
    id: 'brand-agency',
    name: 'Brand & Agency',
    tagline: 'Skalakan produksi konten banyak brand, UMKM, & klien.',
    monthlyPrice: 'Rp 449.000',
    annualPrice: 'Rp 359.000',
    periodLabel: '/ bulan',
    ctaLabel: 'Pilih Brand & Agency',
    features: [
      'Semua fitur Kreator Pro tanpa batas riset',
      'Multi-Brand Workspace hingga 5 anggota tim',
      '120 Ekspor Video 4K / bulan prioritas render',
      'Preset Konversi TikTok Shop & Affiliate',
      'Export Laporan Strategi & Performa Klien',
    ],
  },
];

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Kenapa di Deome harus bikin Strategy Plan & Analisa SEO dulu sebelum edit video?',
    a: 'Karena 70% performa FYP ditentukan oleh topik, hook 3 detik pertama, dan kecocokan kata kunci pencarian—bukan sekadar efek transisi. Dengan mengunci strategi dan keyword SEO lebih dulu, AI kami tahu bagian video mana yang wajib ditonjolkan, di mana teks hook ditaruh, dan kata apa yang perlu disorot di caption.',
  },
  {
    q: 'Apakah video yang saya upload di simulator dikirim ke server luar?',
    a: 'Di simulator landing page ini, video lokal Anda diputar murni di browser menggunakan Object URL tanpa diunggah ke server mana pun. Pada aplikasi penuh Deome, seluruh aset workspace juga terenkripsi dan hanya digunakan untuk proyek Anda.',
  },
  {
    q: 'Platform video apa saja yang didukung oleh format Deome?',
    a: 'Deome dioptimalkan khusus untuk format short-form vertical 9:16 mencakup TikTok, Instagram Reels, dan YouTube Shorts—termasuk penempatan zona aman teks agar tidak tertutup tombol like, caption, atau keranjang kuning.',
  },
  {
    q: 'Apakah data SEO dan tren-nya relevan untuk pasar kreator & UMKM Indonesia?',
    a: 'Ya. Radar SEO & tren Deome dirancang untuk perilaku pencarian audiens Indonesia di TikTok Search dan Reels, lengkap dengan bahasa gaul yang natural, momentum audio lokal, serta sudut pandang jualan affiliate maupun organik.',
  },
  {
    q: 'Bisa upgrade atau berhenti berlangganan kapan saja?',
    a: 'Bisa. Anda bebas mulai dari paket Gratis tanpa kartu kredit, lalu upgrade ke Kreator Pro atau Brand & Agency kapan pun saat volume konten meningkat.',
  },
];
