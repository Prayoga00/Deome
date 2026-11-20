import { useCallback, useEffect, useState } from 'react';
import { AuthModal } from './components/AuthModal';
import { FaqFooterSection } from './components/FaqFooterSection';
import { FeaturesPricingSection } from './components/FeaturesPricingSection';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Loader } from './components/Loader';
import { LogoTicker } from './components/LogoTicker';
import { SimulatorSection } from './components/SimulatorSection';
import { TimelineFlipSection } from './components/TimelineFlipSection';

export function App() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [sceneReady, setSceneReady] = useState(false);
  const [entranceStarted, setEntranceStarted] = useState(reducedMotion);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) setEntranceStarted(true);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const handleEntranceStart = useCallback(() => {
    setEntranceStarted(true);
  }, []);

  const openAuth = (mode: 'login' | 'signup', tier: string | null = null) => {
    setAuthMode(mode);
    setSelectedTier(tier);
    setAuthModalOpen(true);
  };

  return (
    <>
      <Loader
        sceneReady={sceneReady}
        reducedMotion={reducedMotion}
        onEntranceStart={handleEntranceStart}
      />

      <Header
        entranceStarted={entranceStarted}
        reducedMotion={reducedMotion}
        onOpenAuth={(mode) => openAuth(mode, null)}
      />

      <main>
        <HeroSection
          entranceStarted={entranceStarted}
          reducedMotion={reducedMotion}
          onSceneReady={handleSceneReady}
        />

        <LogoTicker reducedMotion={reducedMotion} />

        <TimelineFlipSection reducedMotion={reducedMotion} />

        <SimulatorSection
          reducedMotion={reducedMotion}
          onSaveWorkspace={() => openAuth('signup', 'Kreator Pro (Trial)')}
        />

        <FeaturesPricingSection
          onSelectTier={(tierName) => openAuth('signup', tierName)}
        />
      </main>

      <FaqFooterSection onOpenAuth={(mode) => openAuth(mode, null)} />

      <AuthModal
        open={authModalOpen}
        mode={authMode}
        selectedTier={selectedTier}
        onClose={() => setAuthModalOpen(false)}
        onSwitchMode={(next) => setAuthMode(next)}
      />
    </>
  );
}

export default App;
