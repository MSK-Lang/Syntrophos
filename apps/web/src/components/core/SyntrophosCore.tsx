import { useEffect, useState, useMemo } from 'react';

export type SyntrophosState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'planning'
  | 'executing'
  | 'waiting_approval'
  | 'success'
  | 'error';

export type SyntrophosCoreProps = {
  readonly state?: SyntrophosState;
  readonly activeAgentName?: string;
  readonly activeTask?: string;
  readonly latencyMs?: number;
  readonly size?: number;
  readonly interactive?: boolean;
  readonly onStateChange?: (state: SyntrophosState) => void;
  readonly className?: string;
};

const STATE_CONFIG: Record<
  SyntrophosState,
  {
    readonly label: string;
    readonly primaryColor: string;
    readonly secondaryColor: string;
    readonly glowColor: string;
    readonly pulseSpeed: string;
    readonly ringSpeed: string;
    readonly statusText: string;
  }
> = {
  idle: {
    label: 'STANDBY // OBSERVING',
    primaryColor: '#00f0ff',
    secondaryColor: '#0284c7',
    glowColor: 'rgba(0, 240, 255, 0.35)',
    pulseSpeed: '4.5s',
    ringSpeed: '28s',
    statusText: 'ALL SUBSYSTEMS NOMINAL',
  },
  listening: {
    label: 'AUDIO INGEST // ACTIVE',
    primaryColor: '#38bdf8',
    secondaryColor: '#818cf8',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    pulseSpeed: '1.4s',
    ringSpeed: '12s',
    statusText: 'VOICE STREAM CAPTURE',
  },
  thinking: {
    label: 'NEURAL COGNITION // SYNTHESIS',
    primaryColor: '#a78bfa',
    secondaryColor: '#6366f1',
    glowColor: 'rgba(167, 139, 250, 0.55)',
    pulseSpeed: '1.8s',
    ringSpeed: '16s',
    statusText: 'CROSS-MEMORY REASONING',
  },
  planning: {
    label: 'TASK DECOMPOSITION',
    primaryColor: '#fbbf24',
    secondaryColor: '#f59e0b',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    pulseSpeed: '2.2s',
    ringSpeed: '18s',
    statusText: 'GRAPH PIPELINE GENERATION',
  },
  executing: {
    label: 'AUTONOMOUS EXECUTION',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    glowColor: 'rgba(16, 185, 129, 0.55)',
    pulseSpeed: '1.2s',
    ringSpeed: '8s',
    statusText: 'DISPATCHING AGENT WORKERS',
  },
  waiting_approval: {
    label: 'CONFIRMATION REQUIRED',
    primaryColor: '#f59e0b',
    secondaryColor: '#d97706',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    pulseSpeed: '1.6s',
    ringSpeed: '22s',
    statusText: 'AWAITING OPERATOR INPUT',
  },
  success: {
    label: 'DIRECTIVE COMPLETED',
    primaryColor: '#34d399',
    secondaryColor: '#10b981',
    glowColor: 'rgba(52, 211, 153, 0.6)',
    pulseSpeed: '2s',
    ringSpeed: '32s',
    statusText: 'ARTIFACT COMMITTED TO MEMORY',
  },
  error: {
    label: 'ANOMALY DETECTED',
    primaryColor: '#f43f5e',
    secondaryColor: '#e11d48',
    glowColor: 'rgba(244, 63, 94, 0.65)',
    pulseSpeed: '0.9s',
    ringSpeed: '6s',
    statusText: 'ERROR IN PROCESS THREAD',
  },
};

export function SyntrophosCore({
  state = 'idle',
  activeAgentName,
  activeTask,
  latencyMs = 18,
  size = 280,
  interactive = true,
  onStateChange,
  className = '',
}: SyntrophosCoreProps) {
  const [internalState, setInternalState] = useState<SyntrophosState>(state);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    setInternalState(state);
  }, [state]);

  // Subtle live FPS jitter simulation for high-tech HUD realism
  useEffect(() => {
    const timer = setInterval(() => {
      setFps(59 + Math.round(Math.random() * 2));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const cfg = useMemo(() => STATE_CONFIG[internalState], [internalState]);

  const handleNextState = () => {
    if (!interactive) return;
    const states: SyntrophosState[] = [
      'idle',
      'listening',
      'thinking',
      'planning',
      'executing',
      'waiting_approval',
      'success',
      'error',
    ];
    const currentIndex = states.indexOf(internalState);
    const next = states[(currentIndex + 1) % states.length] ?? 'idle';
    setInternalState(next);
    onStateChange?.(next);
  };

  const centerSize = Math.round(size * 0.38);
  const outerRingSize = size;
  const midRingSize = Math.round(size * 0.76);
  const innerRingSize = Math.round(size * 0.54);

  return (
    <div
      className={`syntrophos-core-wrapper ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Top HUD Telemetry Line */}
      <div
        className="hud-mono-meta"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 12,
          fontSize: 10,
          color: 'var(--color-text-subtle)',
          letterSpacing: '0.12em',
        }}
      >
        <span>CORE // V1.0-SPATIAL</span>
        <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>
        <span style={{ color: cfg.primaryColor }}>{fps} FPS</span>
        <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>
        <span>{latencyMs}ms LATENCY</span>
      </div>

      {/* Main 2.5D Layered Core Container */}
      <div
        role={interactive ? 'button' : 'region'}
        tabIndex={interactive ? 0 : undefined}
        aria-label={`Syntrophos Core: ${cfg.label}`}
        onClick={handleNextState}
        onKeyDown={(e) => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleNextState();
          }
        }}
        style={{
          position: 'relative',
          width: outerRingSize,
          height: outerRingSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: interactive ? 'pointer' : 'default',
        }}
      >
        {/* Layer 1: Ambient Background Radial Glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: outerRingSize * 1.1,
            height: outerRingSize * 1.1,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${cfg.glowColor} 0%, rgba(0,0,0,0) 70%)`,
            filter: 'blur(16px)',
            opacity: 0.85,
            pointerEvents: 'none',
            transition: 'background 400ms ease',
          }}
        />

        {/* Layer 2: Outer Rotating Calibrated HUD Ring */}
        <svg
          aria-hidden="true"
          width={outerRingSize}
          height={outerRingSize}
          viewBox={`0 0 ${outerRingSize} ${outerRingSize}`}
          style={{
            position: 'absolute',
            animation: `orbitRotateClockwise ${cfg.ringSpeed} linear infinite`,
            pointerEvents: 'none',
          }}
        >
          {/* Outer dashed perimeter track */}
          <circle
            cx={outerRingSize / 2}
            cy={outerRingSize / 2}
            r={outerRingSize / 2 - 4}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          {/* Segmented state highlights */}
          <circle
            cx={outerRingSize / 2}
            cy={outerRingSize / 2}
            r={outerRingSize / 2 - 4}
            fill="none"
            stroke={cfg.primaryColor}
            strokeWidth="2"
            strokeDasharray="30 120"
            strokeDashoffset="15"
          />
          <circle
            cx={outerRingSize / 2}
            cy={outerRingSize / 2}
            r={outerRingSize / 2 - 4}
            fill="none"
            stroke={cfg.secondaryColor}
            strokeWidth="2"
            strokeDasharray="20 180"
            strokeDashoffset="90"
          />
        </svg>

        {/* Layer 3: Middle Counter-Rotating Notched Gear & Arcs */}
        <svg
          aria-hidden="true"
          width={midRingSize}
          height={midRingSize}
          viewBox={`0 0 ${midRingSize} ${midRingSize}`}
          style={{
            position: 'absolute',
            animation: `orbitRotateCounterClockwise calc(${cfg.ringSpeed} * 0.7) linear infinite`,
            pointerEvents: 'none',
          }}
        >
          <circle
            cx={midRingSize / 2}
            cy={midRingSize / 2}
            r={midRingSize / 2 - 3}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
          />
          <circle
            cx={midRingSize / 2}
            cy={midRingSize / 2}
            r={midRingSize / 2 - 3}
            fill="none"
            stroke={cfg.primaryColor}
            strokeWidth="1.5"
            strokeDasharray="8 24"
            opacity="0.75"
          />
          {/* Precision tick crosses at 4 quadrants */}
          <line
            x1={midRingSize / 2}
            y1="0"
            x2={midRingSize / 2}
            y2="8"
            stroke={cfg.primaryColor}
            strokeWidth="2"
          />
          <line
            x1={midRingSize / 2}
            y1={midRingSize - 8}
            x2={midRingSize / 2}
            y2={midRingSize}
            stroke={cfg.primaryColor}
            strokeWidth="2"
          />
          <line
            x1="0"
            y1={midRingSize / 2}
            x2="8"
            y2={midRingSize / 2}
            stroke={cfg.primaryColor}
            strokeWidth="2"
          />
          <line
            x1={midRingSize - 8}
            y1={midRingSize / 2}
            x2={midRingSize}
            y2={midRingSize / 2}
            stroke={cfg.primaryColor}
            strokeWidth="2"
          />
        </svg>

        {/* Layer 4: Inner Precision Crosshair Ring */}
        <svg
          aria-hidden="true"
          width={innerRingSize}
          height={innerRingSize}
          viewBox={`0 0 ${innerRingSize} ${innerRingSize}`}
          style={{
            position: 'absolute',
            animation: `orbitRotateClockwise calc(${cfg.ringSpeed} * 1.5) linear infinite`,
            pointerEvents: 'none',
          }}
        >
          <circle
            cx={innerRingSize / 2}
            cy={innerRingSize / 2}
            r={innerRingSize / 2 - 2}
            fill="none"
            stroke={cfg.primaryColor}
            strokeWidth="1"
            strokeDasharray="4 8"
            opacity="0.4"
          />
        </svg>

        {/* Layer 5: Pulsing Harmonic Energy Emitter Core */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: centerSize,
            height: centerSize,
            borderRadius: '50%',
            background: `radial-gradient(circle at 40% 40%, #ffffff 0%, ${cfg.primaryColor} 45%, ${cfg.secondaryColor} 85%, transparent 100%)`,
            boxShadow: `0 0 25px ${cfg.primaryColor}, 0 0 50px ${cfg.glowColor}, inset 0 0 15px rgba(255, 255, 255, 0.8)`,
            animation: `corePulseEnergy ${cfg.pulseSpeed} ease-in-out infinite`,
            transition: 'all 350ms ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Micro Geometric Reticle Center */}
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 0 10px #ffffff',
            }}
          />
        </div>

        {/* Layer 6: Static Corner Targeting Brackets */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 6,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 10,
              height: 10,
              borderTop: `1.5px solid ${cfg.primaryColor}`,
              borderLeft: `1.5px solid ${cfg.primaryColor}`,
            }}
          />
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 10,
              height: 10,
              borderTop: `1.5px solid ${cfg.primaryColor}`,
              borderRight: `1.5px solid ${cfg.primaryColor}`,
            }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 10,
              height: 10,
              borderBottom: `1.5px solid ${cfg.primaryColor}`,
              borderLeft: `1.5px solid ${cfg.primaryColor}`,
            }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 10,
              height: 10,
              borderBottom: `1.5px solid ${cfg.primaryColor}`,
              borderRight: `1.5px solid ${cfg.primaryColor}`,
            }}
          />
        </div>
      </div>

      {/* Bottom Status Readout */}
      <div
        style={{
          marginTop: 14,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-base)',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            className="status-orb"
            style={{
              background: cfg.primaryColor,
              boxShadow: `0 0 8px ${cfg.primaryColor}`,
            }}
          />
          <span>{cfg.label}</span>
        </div>

        <div
          className="hud-mono-meta"
          style={{
            fontSize: 11,
            color: 'var(--color-text-subtle)',
          }}
        >
          {activeTask ? (
            <span style={{ color: 'var(--color-text-muted)' }}>{activeTask}</span>
          ) : activeAgentName ? (
            <span>AGENT RUNNING: {activeAgentName.toUpperCase()}</span>
          ) : (
            <span>{cfg.statusText}</span>
          )}
        </div>
      </div>
    </div>
  );
}
