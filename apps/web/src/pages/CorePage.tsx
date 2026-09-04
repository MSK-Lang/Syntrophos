import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SyntrophosOrb from '@/components/SyntrophosOrb.js';
import { SyntrophosLoading } from '@/components/ui/SyntrophosLoading.js';
import { useAuth } from '@/lib/auth.js';
import { useSyntrophosDemoStore } from '@/lib/useSyntrophosDemoStore.js';
import { autonomousEngine } from '@/lib/autonomousEngine.js';
import { SyntrophosCommandInterface } from '@/components/core/SyntrophosCommandInterface.js';
import { SyntrophosHUDPanels } from '@/components/core/SyntrophosHUDPanels.js';
import {
  getOnboardingState,
  dismissWelcomePrompt,
} from '@/lib/services/onboarding.js';
import { Button } from '@/components/ui/primitives.js';

export type CoreStatus = 'initializing' | 'ready' | 'error';

export default function CorePage() {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const demoState = useSyntrophosDemoStore();

  const [coreStatus, setCoreStatus] = useState<CoreStatus>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loaderRevealed, setLoaderRevealed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const onboarding = getOnboardingState();
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(
    onboarding.isFirstTimeUser && !onboarding.dismissedPrompt
  );

  // Start autonomous engine scheduler
  useEffect(() => {
    autonomousEngine.start();
    return () => {
      autonomousEngine.stop();
    };
  }, []);

  // Global shortcut 'd' to jump to dashboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'd' || e.key === 'D') && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
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

      {/* SURROUNDING HUD PANELS (Status Bar, Tasks, Activity Feed, Notifications) */}
      {isReady && (
        <SyntrophosHUDPanels
          orbState={demoState.orbState}
          tasks={demoState.tasks}
          activity={demoState.activity}
          notifications={demoState.notifications}
          monitors={demoState.monitors}
          isGuest={isGuest}
          onSaveSyntrophos={() => setShowSaveModal(true)}
        />
      )}

      {/* COMMAND INTERFACE (Clean text input docked below the Orb) */}
      {isReady && (
        <SyntrophosCommandInterface orbState={demoState.orbState} />
      )}

      {/* SAVE MY SYNTHROPHOS UPGRADE MODAL */}
      {showSaveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              background: '#0a0502',
              border: '1px solid rgba(255, 170, 48, 0.45)',
              borderRadius: 12,
              padding: '36px',
              maxWidth: 480,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em' }}>
              SAVE MY SYNTHROPHOS
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff5e6', margin: 0 }}>
              Persist your autonomous environment
            </h3>

            <p style={{ fontSize: 14, color: '#d99a4e', lineHeight: 1.6, margin: 0 }}>
              Your current guest tasks ({demoState.tasks.length}), active monitors ({demoState.monitors.length}), and scheduled reminders ({demoState.reminders.length}) are saved in local browser storage. Create an account to sync seamlessly across mobile, laptop, and multi-device channels.
            </p>

            <div style={{ display: 'flex', gap: 12, paddingTop: 10 }}>
              <Button
                variant="primary"
                className="public-btn-tactile"
                onClick={() => navigate('/sign-up')}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 'bold', flex: 1 }}
              >
                [ Create Account / Sign In ]
              </Button>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
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
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}

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
              Syntrophos Autonomous Core
            </h2>

            <p style={{ fontSize: 15, color: '#d99a4e', lineHeight: 1.6, margin: 0 }}>
              Syntrophos understands natural language requests, schedules proactive reminders, watches projects for changes, and monitors your tasks autonomously.
            </p>

            <p style={{ fontSize: 13, color: '#885522', lineHeight: 1.5, margin: 0 }}>
              Try typing: <span style={{ color: '#ffcc66', fontFamily: 'var(--font-mono)' }}>"Remind me to study at 8 PM"</span> or <span style={{ color: '#ffcc66', fontFamily: 'var(--font-mono)' }}>"Watch my project for changes"</span> below the Orb.
            </p>

            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <Button
                variant="primary"
                className="public-btn-tactile"
                onClick={handleDismissWelcome}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 'bold', flex: 1 }}
              >
                [ Enter Syntrophos ]
              </Button>
              <button
                type="button"
                className="public-btn-tactile"
                onClick={handleOpenGuide}
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
                Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Syntrophos Core Orb Container — COMPLETELY PROTECTED & UNCHANGED */}
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
