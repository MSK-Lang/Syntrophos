import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SyntrophosOrb from '@/components/SyntrophosOrb';
import { SyntrophosLoading } from '@/components/ui/SyntrophosLoading';

export type CoreStatus = 'initializing' | 'ready' | 'error';

export default function CorePage() {
  const navigate = useNavigate();
  const [coreStatus, setCoreStatus] = useState<CoreStatus>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loaderRevealed, setLoaderRevealed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        navigate('/dashboard');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

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

      {/* Direct link to Dashboard HUD control */}
      <div
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 30,
          opacity: isReady ? 1 : 0,
          pointerEvents: isReady ? 'auto' : 'none',
          transition: 'opacity 300ms ease',
        }}
      >
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
