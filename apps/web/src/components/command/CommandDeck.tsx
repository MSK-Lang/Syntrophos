import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import type { SyntrophosState } from '../core/SyntrophosCore';
import { IconCommand, IconVoice } from '@/lib/icons';

export type CommandDeckProps = {
  readonly onExecute?: (prompt: string, directive?: string) => Promise<void> | void;
  readonly onStateChange?: (state: SyntrophosState) => void;
  readonly placeholder?: string;
  readonly className?: string;
};

const DIRECTIVES = [
  { id: 'plan', label: '/plan', hint: 'Decompose goal into autonomous steps' },
  { id: 'research', label: '/research', hint: 'Index and synthesize knowledge vault' },
  { id: 'schedule', label: '/schedule', hint: 'Coordinate calendar and deadlines' },
  { id: 'code', label: '/code', hint: 'Generate, debug or analyze workspace code' },
  { id: 'task', label: '/task', hint: 'Create prioritized task with assignee' },
  { id: 'email', label: '/email', hint: 'Draft context-aware outbound message' },
] as const;

export function CommandDeck({
  onExecute,
  onStateChange,
  placeholder = 'Syntrophos, what should I take care of today?',
  className = '',
}: CommandDeckProps) {
  const [input, setInput] = useState('');
  const [activeDirective, setActiveDirective] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: Cmd+K / Ctrl+K focus
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDirectiveClick = (directive: string) => {
    if (activeDirective === directive) {
      setActiveDirective(null);
    } else {
      setActiveDirective(directive);
      onStateChange?.('planning');
    }
    inputRef.current?.focus();
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (val.trim().length > 0) {
      onStateChange?.('listening');
    } else {
      onStateChange?.('idle');
    }
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const prompt = input.trim();
    if (!prompt || isProcessing) return;

    setIsProcessing(true);
    onStateChange?.('thinking');

    try {
      if (onExecute) {
        await onExecute(prompt, activeDirective ?? undefined);
      }
      setTimeout(() => {
        onStateChange?.('executing');
        setTimeout(() => {
          onStateChange?.('success');
          setInput('');
          setActiveDirective(null);
          setIsProcessing(false);
          setTimeout(() => onStateChange?.('idle'), 2500);
        }, 1800);
      }, 1000);
    } catch {
      onStateChange?.('error');
      setIsProcessing(false);
      setTimeout(() => onStateChange?.('idle'), 3000);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div
      className={`command-deck-container ${className}`.trim()}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 16px',
        border: isFocused ? '1px solid rgba(0, 240, 255, 0.45)' : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(8, 12, 20, 0.92)',
        boxShadow: isFocused
          ? '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.15)'
          : '0 8px 30px rgba(0, 0, 0, 0.6)',
        transition: 'all 220ms ease',
      }}
    >
      {/* Corner HUD framing */}
      <span className="hud-corner-tl" />
      <span className="hud-corner-tr" />
      <span className="hud-corner-bl" />
      <span className="hud-corner-br" />

      {/* Header bar: Command Mode and Hotkey */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
        }}
      >
        <div
          className="hud-mono-meta"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10,
            color: 'var(--color-hud-cyan)',
          }}
        >
          <IconCommand width={12} height={12} />
          <span>COMMAND SYNTHROPHOS</span>
          {activeDirective && (
            <span
              style={{
                background: 'rgba(0, 240, 255, 0.15)',
                padding: '1px 6px',
                borderRadius: 2,
                color: '#ffffff',
              }}
            >
              {activeDirective.toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="command-hotkey-badge">⌘K</span>
          <span className="command-hotkey-badge">↵ RUN</span>
        </div>
      </div>

      {/* Main Input Row */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="command-deck-input"
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 15,
            color: 'var(--color-text)',
            padding: '6px 0',
          }}
        />

        <button
          type="button"
          aria-label="Voice input"
          onClick={() => {
            onStateChange?.('listening');
            setInput('Syntrophos, summarize today’s highest priority deliverables.');
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--color-text-muted)',
            borderRadius: 'var(--radius-sm)',
            width: 32,
            height: 32,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 150ms ease',
          }}
        >
          <IconVoice width={16} height={16} />
        </button>

        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          style={{
            background: input.trim() ? 'var(--color-hud-cyan)' : 'rgba(255, 255, 255, 0.06)',
            color: input.trim() ? '#04060a' : 'var(--color-text-subtle)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 600,
            cursor: input.trim() ? 'pointer' : 'default',
            flexShrink: 0,
            boxShadow: input.trim() ? '0 0 12px rgba(0, 240, 255, 0.4)' : 'none',
            transition: 'all 180ms ease',
          }}
        >
          {isProcessing ? 'PROCESSING…' : 'EXECUTE'}
        </button>
      </form>

      {/* Directives Pills Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          overflowX: 'auto',
          paddingTop: 4,
          scrollbarWidth: 'none',
        }}
      >
        {DIRECTIVES.map((d) => {
          const isSelected = activeDirective === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => handleDirectiveClick(d.id)}
              className="command-directive-pill"
              title={d.hint}
              style={{
                background: isSelected ? 'rgba(0, 240, 255, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                borderColor: isSelected ? 'var(--color-hud-cyan)' : 'rgba(255, 255, 255, 0.08)',
                color: isSelected ? 'var(--color-hud-cyan)' : 'var(--color-text-muted)',
              }}
            >
              <span>{d.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
