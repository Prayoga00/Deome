import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  mode: 'login' | 'signup';
  selectedTier: string | null;
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

export function AuthModal({
  open,
  mode,
  selectedTier,
  onClose,
  onSwitchMode,
}: AuthModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSubmitted(false);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  const resetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111418]/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deome-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-[28px] bg-[#f4f7fb] p-7 text-[#111418] shadow-2xl">
        <button
          type="button"
          onClick={resetAndClose}
          aria-label="Tutup dialog"
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#111418]/6 text-[#111418]/70 hover:bg-[#111418]/12"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#ff5512]" />
            <h3 id="deome-modal-title" className="mt-4 text-2xl font-medium">
              Akses Deome Siap!
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#111418]/70">
              Undangan workspace {selectedTier ? `paket ${selectedTier}` : 'Deome Studio'} telah
              dicatat untuk <strong>{email}</strong>. Silakan jelajahi Simulator 3-Tahap di halaman
              utama sekarang.
            </p>
            <button
              type="button"
              onClick={resetAndClose}
              className="mt-6 w-full rounded-xl bg-[#16191f] py-3 text-sm font-semibold text-white hover:bg-[#2b3140]"
            >
              Lanjut ke Halaman
            </button>
          </div>
        ) : (
          <>
            <div className="inline-flex rounded-full bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => onSwitchMode('signup')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  mode === 'signup' ? 'bg-[#16191f] text-white' : 'text-[#111418]/65'
                }`}
              >
                Daftar Gratis
              </button>
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  mode === 'login' ? 'bg-[#16191f] text-white' : 'text-[#111418]/65'
                }`}
              >
                Masuk
              </button>
            </div>

            <h3 id="deome-modal-title" className="mt-4 text-2xl font-medium tracking-tight">
              {mode === 'signup'
                ? 'Mulai Buat Konten FYP dengan Deome'
                : 'Masuk ke Workspace Deome'}
            </h3>
            {selectedTier && (
              <p className="mt-1.5 inline-block rounded-lg bg-[#ff5512]/12 px-2.5 py-1 text-xs font-semibold text-[#ff5512]">
                Paket dipilih: {selectedTier}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3.5">
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="deome-auth-name"
                    className="mb-1.5 block text-xs font-medium text-[#111418]/75"
                  >
                    Nama / Nama Brand
                  </label>
                  <input
                    id="deome-auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Studio Kopi Nusantara"
                    className="w-full rounded-xl border border-[#111418]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff5512]"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="deome-auth-email"
                  className="mb-1.5 block text-xs font-medium text-[#111418]/75"
                >
                  Email Aktif
                </label>
                <input
                  id="deome-auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@brandkamu.example"
                  className="w-full rounded-xl border border-[#111418]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff5512]"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-[#16191f] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2b3140]"
              >
                {mode === 'signup' ? 'Aktifkan Akses Simulator & Studio' : 'Masuk Workspace'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
