import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SyntrophosOrb from '@/components/SyntrophosOrb';
import { SyntrophosLoading } from '@/components/ui/SyntrophosLoading';

import {
  getOnboardingState,
  dismissWelcomePrompt,
} from '@/lib/services/onboarding';
import { Button } from '@/components/ui/primitives';

export type CoreStatus = 'initializing' | 'ready' | 'error';

export default function CorePage() {
  const navigate = useNavigate();
  const [coreStatus, setCoreStatus] = useState<CoreStatus>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loaderRevealed, setLoaderRevealed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const onboarding = getOnboardingState();
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(
    onboarding.isFirstTimeUser && !onboarding.dismissedPrompt
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        navigate('/dashboard');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const handleOpenGuide = () => {
    dismissWelcomePrompt();
    setShowWelcomeModal(false);
    navigate('/help');
  };

  const handleDismissWelcome = () => {
    dismissWelcomePrompt();
    setShowWelcomeModal(false);
  };

  const handleReady = useCallback(() => {
    setCoreStatus('ready');
  }, []);

  const handleError = useCallback((err: Error) => {
    setCoreStatus('error');
    setErrorMessage(err.message || 'The visual engine could not be initialized.');
  }, []);

  const handleRetry = useCallback(() => {
    setCoreStatus('initializing');
    setErrorMessage(null);
    setLoaderRevealed(false);
    setRetryKey((k) => k + 1);
  }, []);

  const handleRevealed = useCallback(() => {
    setLoaderRevealed(true);
  }, []);

  const isReady = coreStatus === 'ready';

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000000' }}>
      {/* Global Syntrophos Loading Screen */}
      {!loaderRevealed && (
        <SyntrophosLoading
          variant="global"
          label="INITIALIZING CORE"
          statusMessage="CALIBRATING VISUAL ENGINE · ESTABLISHING CORE LINK"
          isReady={isReady}
          onRevealed={handleRevealed}
          error={coreStatus === 'error' ? (errorMessage || 'The visual engine could not be initialized.') : null}
          onRetry={handleRetry}
        />
      )}

      {/* Direct HUD Control Links: Help & Dashboard */}
      <div
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 30,
          opacity: isReady ? 1 : 0,
          pointerEvents: isReady ? 'auto' : 'none',
          transition: 'opacity 300ms ease',
          display: 'flex',
          gap: 12,
        }}
      >
        <Link
          to="/help"
          className="hud-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            fontSize: '12px',
            padding: '0 14px',
            height: '38px',
          }}
        >
          <span>?</span>
          <span>HELP &amp; GUIDE</span>
        </Link>

        <Link
          to="/dashboard"
          className="hud-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            fontSize: '12px',
            padding: '0 14px',
            height: '38px',
          }}
        >
          <span>▦</span>
          <span>DASHBOARD</span>
        </Link>
      </div>

      {/* WELCOME ONBOARDING PROMPT MODAL */}
      {isReady && showWelcomeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              background: '#090502',
              border: '1px solid rgba(255, 170, 48, 0.4)',
              borderRadius: 12,
              padding: '36px',
              maxWidth: 520,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em' }}>
              WELCOME TO SYNTHROPHOS
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff5e6', margin: 0, lineHeight: 1.2 }}>
              You’re in.
            </h2>

            <p style={{ fontSize: 15, color: '#d99a4e', lineHeight: 1.6, margin: 0 }}>
              Syntrophos brings your work, context, agents, knowledge, tasks, and workflows into one operating environment.
            </p>

            <p style={{ fontSize: 13, color: '#885522', lineHeight: 1.5, margin: 0 }}>
              New to Syntrophos? Take a quick look at the guide to set up your workspace and understand how everything works.
            </p>

            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <Button
                variant="primary"
                className="public-btn-tactile"
                onClick={handleOpenGuide}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 'bold', flex: 1 }}
              >
                [ Open the guide ]
              </Button>
              <button
                type="button"
                className="public-btn-tactile"
                onClick={handleDismissWelcome}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 170, 48, 0.3)',
                  borderRadius: 4,
                  color: '#ffcc66',
                  padding: '10px 18px',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                I’ll explore on my own
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Syntrophos Core Orb Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity: isReady ? 1 : 0,
          transition: 'opacity 350ms ease',
          pointerEvents: isReady ? 'auto' : 'none',
        }}
      >
        <SyntrophosOrb key={retryKey} onReady={handleReady} onError={handleError} />
      </div>
    </div>
  );
}
