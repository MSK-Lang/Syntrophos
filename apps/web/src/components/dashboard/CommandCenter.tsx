import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';

export type CommandCenterProps = {
  readonly onExecute?: (prompt: string, directive?: string) => void;
  readonly placeholder?: string;
};

const DIRECTIVES = [
  { id: 'task', label: '/task', hint: 'Create prioritized task' },
  { id: 'research', label: '/research', hint: 'Synthesize knowledge vault' },
  { id: 'email', label: '/email', hint: 'Draft contextual outbound email' },
  { id: 'schedule', label: '/schedule', hint: 'Coordinate calendar & meetings' },
  { id: 'agent', label: '/agent', hint: 'Deploy autonomous worker' },
] as const;

const QUICK_SUGGESTIONS = [
  'Prepare today’s meeting briefs and schedule',
  'Research client landscape and synthesize notes',
  'Index new project deliverables into vault',
  'Draft outbound status report for team',
];

export function CommandCenter({
  onExecute,
  placeholder = 'Ask Syntrophos: "What should I take care of today?"',
}: CommandCenterProps) {
  const [input, setInput] = useState('');
  const [activeDirective, setActiveDirective] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="dashboard-command-box">
        {/* Header HUD bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'monospace', color: '#ffaa30' }}>
            <span>◉</span>
            <span>COMMAND SYNTHROPHOS</span>
            {activeDirective && (
              <span
                style={{
                  background: 'rgba(255, 170, 48, 0.25)',
                  padding: '1px 6px',
                  borderRadius: 3,
                  color: '#ffcc66',
                }}
              >
                {activeDirective.toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'monospace', color: '#885522' }}>
            <span style={{ border: '1px solid rgba(255, 170, 48, 0.3)', padding: '1px 5px', borderRadius: 3 }}>⌘K</span>
            <span style={{ border: '1px solid rgba(255, 170, 48, 0.3)', padding: '1px 5px', borderRadius: 3 }}>↵ EXECUTE</span>
          </div>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="dashboard-command-input"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              background: input.trim() ? '#ffaa30' : 'rgba(255, 170, 48, 0.1)',
              color: input.trim() ? '#000000' : '#885522',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: 4,
              padding: '6px 14px',
              fontFamily: 'monospace',
              fontSize: 11,
              cursor: input.trim() ? 'pointer' : 'default',
              boxShadow: input.trim() ? '0 0 12px rgba(255, 170, 48, 0.4)' : 'none',
              transition: 'all 150ms ease',
            }}
          >
            DISPATCH
          </button>
        </form>

        {/* Directive Pill Triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, overflowX: 'auto', paddingBottom: 2 }}>
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

      {/* Quick Suggestions on Focus */}
      {showSuggestions && !input.trim() && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '8px 12px',
            background: 'rgba(16, 9, 2, 0.75)',
            border: '1px solid rgba(255, 170, 48, 0.2)',
            borderRadius: 6,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace', marginBottom: 2 }}>
            OPERATIONAL SUGGESTIONS:
          </div>
          {QUICK_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setInput(s);
                inputRef.current?.focus();
              }}
              style={{
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: '#d99a4e',
                fontSize: 12,
                fontFamily: 'monospace',
                padding: '4px 6px',
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffcc66';
                e.currentTarget.style.background = 'rgba(255, 170, 48, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#d99a4e';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              › {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
