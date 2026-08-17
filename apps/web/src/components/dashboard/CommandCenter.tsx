import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { IconMic, IconCore } from '@/lib/icons.js';

export type CommandCenterProps = {
  readonly onExecute?: (prompt: string, directive?: string) => void;
  readonly placeholder?: string;
  readonly mode?: 'personal' | 'business';
};

const DIRECTIVES = [
  { id: 'task', label: '/task', hint: 'Create prioritized task' },
  { id: 'research', label: '/research', hint: 'Synthesize knowledge vault' },
  { id: 'email', label: '/email', hint: 'Draft contextual outbound email' },
  { id: 'schedule', label: '/schedule', hint: 'Coordinate calendar & meetings' },
  { id: 'agent', label: '/agent', hint: 'Deploy autonomous worker' },
] as const;

const PERSONAL_INTENTS = [
  'Prepare my day',
  'Review pending tasks',
  'Follow up with unanswered messages',
  'Summarize today’s meetings',
  'Research something',
];

const BUSINESS_INTENTS = [
  'Audit unanswered client leads',
  'Summarize Q3 operational goals',
  'Review team deliverables and status',
  'Draft client outbound update',
  'Inspect high-priority bottlenecks',
];

export function CommandCenter({
  onExecute,
  placeholder = 'Tell Syntrophos your intent... (e.g. "What should I take care of today?")',
  mode = 'personal',
}: CommandCenterProps) {
  const [input, setInput] = useState('');
  const [activeDirective, setActiveDirective] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;
    onExecute?.(prompt, activeDirective ?? undefined);
    setInput('');
    setActiveDirective(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceToggle = () => {
    setIsListening((prev) => !prev);
    if (!isListening) {
      setInput('Summarize today’s schedule and high-priority deliverables');
    }
  };

  const currentIntents = mode === 'business' ? BUSINESS_INTENTS : PERSONAL_INTENTS;

  return (
    <div style={{ width: '100%', maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Hero Command Deck Surface */}
      <div
        className={`dashboard-command-box ${isFocused ? 'dashboard-command-box--focused' : ''}`}
        style={{
          background: 'rgba(14, 7, 1, 0.92)',
          border: isFocused ? '1px solid rgba(255, 200, 100, 0.75)' : '1px solid rgba(255, 170, 48, 0.35)',
          borderRadius: 12,
          padding: '16px 20px',
          backdropFilter: 'blur(16px)',
          boxShadow: isFocused
            ? '0 12px 40px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 170, 48, 0.25), inset 0 1px 0 rgba(255, 200, 100, 0.2)'
            : '0 8px 32px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 170, 48, 0.12)',
          transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header Telemetry Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'monospace', color: '#ffaa30', letterSpacing: '0.12em' }}>
            <span style={{ color: isListening ? '#ff5533' : '#ffaa30', display: 'inline-flex', alignItems: 'center' }}>
              {isListening ? <IconMic width={12} height={12} /> : <IconCore width={12} height={12} />}
            </span>
            <span>SYNTHROPHOS // OPERATIONAL COMMAND SURFACE</span>
            {activeDirective && (
              <span
                style={{
                  background: 'rgba(255, 170, 48, 0.25)',
                  padding: '1px 6px',
                  borderRadius: 3,
                  color: '#ffcc66',
                  fontSize: 10,
                }}
              >
                {activeDirective.toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontFamily: 'monospace', color: '#885522' }}>
            <button
              type="button"
              onClick={handleVoiceToggle}
              style={{
                background: isListening ? 'rgba(255, 85, 51, 0.2)' : 'rgba(255, 170, 48, 0.1)',
                border: '1px solid rgba(255, 170, 48, 0.3)',
                borderRadius: 4,
                color: isListening ? '#ff5533' : '#d99a4e',
                fontFamily: 'monospace',
                fontSize: 10,
                padding: '2px 8px',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Voice Intent Input"
            >
              <IconMic width={11} height={11} />
              <span>{isListening ? 'RECORDING…' : 'VOICE'}</span>
            </button>
            <span style={{ border: '1px solid rgba(255, 170, 48, 0.3)', padding: '2px 6px', borderRadius: 4 }}>⌘K</span>
            <span style={{ border: '1px solid rgba(255, 170, 48, 0.3)', padding: '2px 6px', borderRadius: 4 }}>↵ DISPATCH</span>
          </div>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="dashboard-command-input"
            style={{
              fontSize: '16px',
              fontWeight: 500,
            }}
          />

          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              background: input.trim() ? '#ffaa30' : 'rgba(255, 170, 48, 0.1)',
              color: input.trim() ? '#000000' : '#885522',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontFamily: 'monospace',
              fontSize: 11,
              letterSpacing: '0.06em',
              cursor: input.trim() ? 'pointer' : 'default',
              boxShadow: input.trim() ? '0 0 16px rgba(255, 170, 48, 0.5)' : 'none',
              transition: 'all 150ms ease',
            }}
          >
            DISPATCH INTENT
          </button>
        </form>

        {/* Directive Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
          {DIRECTIVES.map((d) => {
            const isSelected = activeDirective === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setActiveDirective(isSelected ? null : d.id);
                  inputRef.current?.focus();
                }}
                className={`directive-chip ${isSelected ? 'directive-chip--active' : ''}`}
                title={d.hint}
              >
                <span>{d.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual AI Intent Suggestions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace', letterSpacing: '0.12em' }}>
          SUGGESTED INTENTS // {mode.toUpperCase()} CONTEXT:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {currentIntents.map((intent) => (
            <button
              key={intent}
              type="button"
              onClick={() => {
                setInput(intent);
                inputRef.current?.focus();
              }}
              style={{
                background: 'rgba(25, 13, 2, 0.6)',
                border: '1px solid rgba(255, 170, 48, 0.2)',
                borderRadius: 6,
                color: '#d99a4e',
                fontSize: 12,
                fontFamily: 'monospace',
                padding: '6px 12px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffcc66';
                e.currentTarget.style.borderColor = 'rgba(255, 170, 48, 0.5)';
                e.currentTarget.style.background = 'rgba(255, 170, 48, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#d99a4e';
                e.currentTarget.style.borderColor = 'rgba(255, 170, 48, 0.2)';
                e.currentTarget.style.background = 'rgba(25, 13, 2, 0.6)';
              }}
            >
              <span style={{ color: '#ffaa30', fontSize: 10 }}>›</span>
              <span>{intent}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
