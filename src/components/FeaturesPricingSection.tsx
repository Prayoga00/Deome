import { useState } from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import { FEATURE_PILLARS, PRICING_TIERS, type PricingTier } from '../data/deomeData';

interface FeaturesPricingSectionProps {
  onSelectTier: (tierName: string) => void;
}

export function FeaturesPricingSection({ onSelectTier }: FeaturesPricingSectionProps) {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      {/* Section 5A: 3-Pillar Architecture (#fitur) */}
      <section id="fitur" className="px-4 py-16 md:px-[68px] md:py-24">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-xs font-semibold tracking-wider text-[#ff5512] uppercase">
                Kenapa Deome Berbeda
              </span>
              <h2 className="mt-2 max-w-2xl text-3xl font-medium tracking-[-0.025em] text-[#111418] md:text-5xl">
                Bukan sekadar AI pemotong klip, tapi mesin strategi FYP.
              </h2>
            </div>
            <p className="max-w-md text-base leading-relaxed text-[#111418]/70">
              Editor biasa hanya memotong rekaman tanpa tahu kenapa sebuah video viral. Deome
              mengunci fondasi algoritma lebih dulu sebelum menyentuh timeline.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {FEATURE_PILLARS.map((pillar) => (
              <div
                key={pillar.step}
                className="group flex flex-col justify-between rounded-[24px] border border-[#111418]/8 bg-white p-7 shadow-[0_14px_40px_rgba(17,20,24,0.04)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-[#ff5512]">
                      TAHAP {pillar.step}
                    </span>
                    <span className="rounded-full bg-[#f4f7fb] px-3 py-1 text-xs font-medium text-[#111418]/75">
                      {pillar.metric}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-medium tracking-[-0.015em] text-[#111418]">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#111418]/70">{pillar.desc}</p>
                </div>

                <a
                  href="#simulator"
                  className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-[#111418] transition-opacity group-hover:opacity-70"
                >
                  <span>Uji di Simulator</span>
                  <ArrowUpRight className="h-4 w-4 text-[#ff5512]" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5B: Pricing IDR (#harga) */}
      <section id="harga" className="px-4 py-16 md:px-[68px] md:py-24">
        <div className="mx-auto max-w-[1360px]">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold tracking-wider text-[#ff5512] uppercase">
              Harga Transparan (IDR)
            </span>
            <h2 className="mt-2 text-3xl font-medium tracking-[-0.025em] text-[#111418] md:text-5xl">
              Mulai gratis, upgrade saat kontenmu meledak.
            </h2>
            <p className="mt-4 text-base text-[#111418]/70">
              Dirancang khusus agar terjangkau untuk kreator solo, UMKM lokal, hingga agensi.
            </p>

            {/* Billing Toggle */}
            <div className="mt-7 inline-flex items-center gap-1.5 rounded-full border border-[#111418]/10 bg-white p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !annual ? 'bg-[#16191f] text-white' : 'text-[#111418]/70 hover:text-[#111418]'
                }`}
              >
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  annual ? 'bg-[#16191f] text-white' : 'text-[#111418]/70 hover:text-[#111418]'
                }`}
              >
                <span>Tahunan</span>
                <span className="rounded-full bg-[#ff5512] px-2 py-0.5 text-[11px] font-semibold text-white">
                  Hemat 20%
                </span>
              </button>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PRICING_TIERS.map((tier: PricingTier) => {
              const displayPrice = annual ? tier.annualPrice : tier.monthlyPrice;
              const isPopular = Boolean(tier.popular);
              return (
                <div
                  key={tier.id}
                  className={`relative flex flex-col justify-between rounded-[28px] p-8 ${
                    isPopular
                      ? 'bg-[#12151b] text-white shadow-[0_32px_64px_rgba(30,45,90,0.22)]'
                      : 'border border-[#111418]/10 bg-white text-[#111418]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl font-medium">{tier.name}</h3>
                      {isPopular && (
                        <span className="rounded-full bg-[#ff5512] px-3 py-1 text-xs font-semibold text-white">
                          Paling Populer
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-2 text-sm ${
                        isPopular ? 'text-white/70' : 'text-[#111418]/65'
                      }`}
                    >
                      {tier.tagline}
                    </p>

                    <div className="mt-6 flex items-baseline gap-1.5">
                      <span className="text-4xl font-semibold tracking-tight">{displayPrice}</span>
                      <span
                        className={`text-sm ${
                          isPopular ? 'text-white/60' : 'text-[#111418]/60'
                        }`}
                      >
                        {tier.periodLabel}
                      </span>
                    </div>

                    <ul className="mt-7 flex flex-col gap-3">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-sm">
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              isPopular ? 'text-[#ff5512]' : 'text-[#1430e0]'
                            }`}
                          />
                          <span className={isPopular ? 'text-white/85' : 'text-[#111418]/80'}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTier(tier.name)}
                    className={`mt-8 w-full rounded-xl py-3.5 text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] ${
                      isPopular
                        ? 'bg-[#ff5512] text-white hover:bg-[#ff682b]'
                        : 'bg-[#16191f] text-white hover:bg-[#2b3140]'
                    }`}
                  >
                    {tier.ctaLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
