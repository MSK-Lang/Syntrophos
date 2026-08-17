import { useEffect, useState } from 'react';

export type SyntrophosLoadingVariant = 'global' | 'workspace' | 'inline';

export type SyntrophosLoadingProps = {
  readonly variant?: SyntrophosLoadingVariant;
  readonly label?: string;
  readonly statusMessage?: string;
  readonly progress?: number;
  readonly error?: string | null;
  readonly onRetry?: () => void;
  readonly isReady?: boolean;
  readonly onRevealed?: () => void;
};

export function SyntrophosLoading({
  variant = 'workspace',
  label = 'INITIALIZING SYSTEM',
  statusMessage = 'SYNCHRONIZING WORKSPACE NODES',
  progress,
  error,
  onRetry,
  isReady = false,
  onRevealed,
}: SyntrophosLoadingProps) {
  const [internalProgress, setInternalProgress] = useState(progress ?? 24);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (progress !== undefined) {
      setInternalProgress(progress);
      return;
    }
    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 94) return 94;
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [progress]);

  useEffect(() => {
    if (isReady) {
      setInternalProgress(100);
      const timer = setTimeout(() => {
        setRevealing(true);
        const revealTimer = setTimeout(() => {
          onRevealed?.();
        }, 300);
        return () => clearTimeout(revealTimer);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isReady, onRevealed]);

  if (variant === 'inline') {
    return (
      <div className="syntrophos-loader-inline" role="status" aria-live="polite">
        <svg className="drive-loader-svg" style={{ width: 16, height: 16 }} viewBox="0 0 100 100">
          <path className="drive-segment-1" d="M20,70 L50,15 L65,40 L35,95 Z" />
          <path className="drive-segment-2" d="M50,15 L95,70 L70,85 L35,40 Z" />
          <path className="drive-segment-3" d="M95,70 L20,70 L35,45 L80,45 Z" />
        </svg>
        <span>{statusMessage || label}</span>
      </div>
    );
  }

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: 380,
      }}
      role="status"
      aria-live="polite"
    >
      {/* Drive Isometric Folding Geometry */}
      <svg className="drive-loader-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="driveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffcc66" />
            <stop offset="100%" stopColor="#ffaa30" />
          </linearGradient>
          <linearGradient id="driveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffaa30" />
            <stop offset="100%" stopColor="#cc7800" />
          </linearGradient>
          <linearGradient id="driveGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cc7800" />
            <stop offset="100%" stopColor="#ffaa30" />
          </linearGradient>
        </defs>

        {/* Top-Right Quadrilateral Plate */}
        <path
          className="drive-segment-1"
          d="M 60,15 L 102,88 L 78,88 L 48,36 Z"
          fill="url(#driveGrad1)"
        />

        {/* Bottom Horizontal Quadrilateral Plate */}
        <path
          className="drive-segment-2"
          d="M 102,88 L 18,88 L 30,68 L 90,68 Z"
          fill="url(#driveGrad2)"
        />

        {/* Left Rising Quadrilateral Plate */}
        <path
          className="drive-segment-3"
          d="M 18,88 L 60,15 L 72,36 L 42,88 Z"
          fill="url(#driveGrad3)"
        />

        {/* Inner Luminous Core Point */}
        <circle cx="60" cy="64" r="5" fill="#ffaa30" opacity="0.9" />
      </svg>

      {/* Brand Title */}
      <div className="loader-brand-title">SYNTHROPHOS // {label}</div>

      {/* Status Message */}
      {error ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ color: '#ff5533', fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>
            ! INITIALIZATION FAILED
          </div>
          <div style={{ color: '#885522', fontSize: 11, marginTop: 4 }}>{error}</div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              style={{
                marginTop: 14,
                background: 'rgba(255, 85, 51, 0.15)',
                border: '1px solid rgba(255, 85, 51, 0.4)',
                borderRadius: 4,
                color: '#ff5533',
                fontFamily: 'monospace',
                fontSize: 11,
                padding: '6px 16px',
                cursor: 'pointer',
              }}
            >
              RETRY
            </button>
          )}
        </div>
      ) : isReady ? (
        <div style={{ color: '#34d399', fontSize: 13, fontWeight: 600, fontFamily: 'monospace', marginTop: 10 }}>
          SYSTEM READY
        </div>
      ) : (
        <>
          <div className="loader-status-msg">{statusMessage}</div>

          {/* Progress Bar & Readout */}
          <div className="loader-progress-track">
            <div className="loader-progress-bar" style={{ width: `${internalProgress}%` }} />
          </div>

          <div className="loader-sub-telemetry">
            LATENCY 14MS · {internalProgress}% LOADED
          </div>
        </>
      )}
    </div>
  );

  if (variant === 'global') {
    return (
      <div className={`syntrophos-loader-overlay ${revealing ? 'syntrophos-loader-overlay--revealing' : ''}`}>
        {content}
      </div>
    );
  }

  return (
    <div className="syntrophos-loader-workspace">
      {content}
    </div>
  );
}
