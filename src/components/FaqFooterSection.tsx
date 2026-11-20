import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '../data/deomeData';

interface FaqFooterSectionProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export function FaqFooterSection({ onOpenAuth }: FaqFooterSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      {/* Section 6: FAQ Accordion */}
      <section id="faq" className="px-4 py-16 md:px-[68px] md:py-24">
        <div className="mx-auto max-w-[920px]">
          <div className="text-center">
            <span className="text-xs font-semibold tracking-wider text-[#ff5512] uppercase">
              Pertanyaan Umum
            </span>
            <h2 className="mt-2 text-3xl font-medium tracking-[-0.025em] text-[#111418] md:text-5xl">
              Hal yang sering ditanyakan kreator &amp; tim.
            </h2>
          </div>

          <div className="mt-10 flex flex-col gap-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-2xl border border-[#111418]/10 bg-white"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-base font-medium text-[#111418] md:text-lg">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#111418]/60 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#ff5512]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#111418]/5 px-6 pt-3 pb-5 text-sm leading-relaxed text-[#111418]/75 md:text-base">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Banner & Minimalist Footer */}
      <footer className="px-4 pt-6 pb-14 md:px-[68px]">
        <div className="mx-auto max-w-[1360px]">
          <div className="rounded-[28px] bg-[#12151b] px-6 py-12 text-center text-white md:rounded-[38px] md:px-14 md:py-16">
            <p className="text-xs font-semibold tracking-wider text-[#ff8754] uppercase">
              Siap Naik ke FYP Berikutnya?
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-medium tracking-[-0.025em] md:text-5xl">
              Mulai dari strategi yang jelas, edit video lebih cepat dengan AI.
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="rounded-xl bg-[#ff5512] px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03] hover:bg-[#ff682b]"
              >
                Buat Workspace Gratis
              </button>
              <a
                href="#simulator"
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Coba Simulator Lagi
              </a>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#111418]/10 pt-8 text-sm text-[#111418]/60 md:flex-row">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-baseline text-2xl text-[#111418]"
                style={{ fontFamily: '"Kaushan Script", cursive', transform: 'skewX(-6deg)' }}
              >
                Deome
                <span className="ml-0.5 inline-block h-1 w-1 rounded-full bg-[#111418]" />
              </span>
              <span>© {new Date().getFullYear()} Deome.ai — AI Video Studio</span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <a href="#alur-kerja" className="hover:text-[#111418]">
                Alur Kerja
              </a>
              <a href="#simulator" className="hover:text-[#111418]">
                Simulator
              </a>
              <a href="#fitur" className="hover:text-[#111418]">
                Fitur
              </a>
              <a href="#harga" className="hover:text-[#111418]">
                Harga
              </a>
              <a href="#faq" className="hover:text-[#111418]">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
