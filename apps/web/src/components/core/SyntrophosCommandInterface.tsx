import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  type FormEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import { demoStore, type OrbState } from '@/lib/syntrophosDemoStore.js';
import { agentEngine, type AgentResponse } from '@/lib/agentEngine.js';
import {
  IconVoice,
  IconPlus,
  IconPaperclip,
  IconX,
  IconTasks,
  IconWorkflow,
  IconZap,
  IconCalendar,
  IconWorkspace,
  IconNotes,
  type IconComponent,
} from '@/lib/icons.js';

interface WebSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

declare global {
  interface Window {
    SpeechRecognition?: new () => WebSpeechRecognition;
    webkitSpeechRecognition?: new () => WebSpeechRecognition;
  }
}

export interface SyntrophosCommandInterfaceProps {
  readonly orbState: OrbState;
}

type SourceItem = {
  readonly key: string;
  readonly name: string;
  readonly desc: string;
  readonly icon: IconComponent;
  readonly attach?: boolean;
};

const SOURCES: readonly SourceItem[] = [
  { key: 'attach', name: 'Add photos & files', desc: 'Attach documents from your computer', icon: IconPaperclip, attach: true },
  { key: 'tasks', name: 'tasks', desc: 'Active tasks, backlog & deliverables', icon: IconTasks },
  { key: 'activity', name: 'activity', desc: 'Telemetry events & execution logs', icon: IconWorkflow },
  { key: 'monitors', name: 'monitors', desc: 'Autonomous repository & delta watchers', icon: IconZap },
  { key: 'reminders', name: 'reminders', desc: 'Scheduled deadlines & alerts', icon: IconCalendar },
  { key: 'workspace', name: 'workspace', desc: 'Project files & workspace state', icon: IconWorkspace },
  { key: 'knowledge', name: 'knowledge', desc: 'Vault documents & indexed research', icon: IconNotes },
] as const;

type CommandItem = {
  readonly key: string;
  readonly name: string;
  readonly desc: string;
  readonly icon: IconComponent;
};

const COMMANDS: readonly CommandItem[] = [
  { key: 'task', name: '/task', desc: 'Create prioritized task with assignee', icon: IconTasks },
  { key: 'plan', name: '/plan', desc: 'Decompose goal into autonomous steps', icon: IconWorkflow },
  { key: 'remind', name: '/remind', desc: 'Schedule time-based reminder', icon: IconCalendar },
  { key: 'schedule', name: '/schedule', desc: 'Query agenda & pending deliverables', icon: IconCalendar },
  { key: 'activity', name: '/activity', desc: 'Digest recent telemetry & events', icon: IconWorkflow },
  { key: 'monitor', name: '/monitor', desc: 'Arm autonomous project watcher', icon: IconZap },
] as const;

const QUICK_PROMPTS = [
  'Remind me to study at 8 PM.',
  'What do I have planned today?',
  'Create a task to finish the project.',
  'Show me what changed today.',
  'Watch my project for changes.',
] as const;

const STATE_CONFIG: Record<OrbState, { label: string; color: string; glow: string }> = {
  IDLE: { label: 'READY', color: '#ffaa30', glow: 'rgba(255, 170, 48, 0.5)' },
  LISTENING: { label: 'LISTENING', color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.6)' },
  THINKING: { label: 'THINKING', color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.7)' },
  ACTING: { label: 'ACTING', color: '#10b981', glow: 'rgba(16, 185, 129, 0.7)' },
  ALERT: { label: 'ALERT', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.7)' },
};

function parseToken(draft: string): { kind: 'at' | 'slash'; query: string; start: number } | null {
  const match = /(^|\s)([@/])([\w-]*)$/.exec(draft);
  if (!match) return null;
  const prefix = match[1] ?? '';
  const trigger = match[2];
  const query = (match[3] ?? '').toLowerCase();
  if (trigger !== '@' && trigger !== '/') return null;
  return {
    kind: trigger === '@' ? 'at' : 'slash',
    query,
    start: match.index + prefix.length,
  };
}

export function SyntrophosCommandInterface({ orbState }: SyntrophosCommandInterfaceProps) {
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [plusOpen, setPlusOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [rowBox, setRowBox] = useState<{ top: number; height: number } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [latestResponse, setLatestResponse] = useState<AgentResponse | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);

  // Initialize Web Speech API if supported
  useEffect(() => {
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechClass) {
      setVoiceSupported(true);
      try {
        const recognition = new SpeechClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const rowItem = event.results[i];
            if (rowItem && rowItem[0]) {
              transcript += rowItem[0].transcript;
            }
          }
          if (transcript) {
            setDraft(transcript);
          }
        };

        recognition.onerror = () => {
          setIsListeningVoice(false);
          demoStore.setOrbState('IDLE');
        };

        recognition.onend = () => {
          setIsListeningVoice(false);
          if (draft.trim()) {
            void executeDirective(draft.trim());
          } else {
            demoStore.setOrbState('IDLE');
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('[Syntrophos Voice] Init error:', err);
      }
    }
  }, [draft]);

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

  // Outside click to dismiss open menus
  useEffect(() => {
    if (!plusOpen && !showSuggestions) return;
    const handlePointerDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el?.closest('[data-promptbar]')) {
        setPlusOpen(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [plusOpen, showSuggestions]);

  // Token parse: check for trailing @ or /
  const token = dismissed ? null : parseToken(draft);
  const menu: 'at' | 'slash' | null = plusOpen ? 'at' : token?.kind ?? null;
  const query = plusOpen ? '' : token?.query ?? '';

  const rows =
    menu === 'at'
      ? SOURCES.filter((s) => s.name.toLowerCase().includes(query))
      : menu === 'slash'
      ? COMMANDS.filter((c) => c.name.slice(1).startsWith(query))
      : [];

  useEffect(() => {
    setActive(0);
    setEngaged(false);
  }, [menu, query]);

  // Gliding highlight positioning
  useLayoutEffect(() => {
    const target = rowRefs.current[active];
    if (target) {
      setRowBox({ top: target.offsetTop, height: target.offsetHeight });
    }
  }, [menu, query, active, rows.length]);

  // Dynamic multiline expansion
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const hasNewlines = draft.includes('\n');
    const needsExpanded = hasNewlines || draft.length > 55 || attachments.length > 0;
    if (needsExpanded !== expanded) {
      setExpanded(needsExpanded);
    }

    const minHeight = 24;
    const maxHeight = 120;
    input.style.height = '0px';
    const contentHeight = input.scrollHeight;
    input.style.height = `${Math.min(Math.max(contentHeight, minHeight), maxHeight)}px`;
    input.style.overflowY = contentHeight > maxHeight ? 'auto' : 'hidden';
  }, [draft, expanded, attachments.length]);

  const toggleVoice = () => {
    if (!voiceSupported || !recognitionRef.current) {
      setDraft('Remind me to study at 8 PM.');
      inputRef.current?.focus();
      return;
    }

    if (isListeningVoice) {
      recognitionRef.current.stop();
      setIsListeningVoice(false);
      demoStore.setOrbState('IDLE');
    } else {
      try {
        setDraft('');
        setIsListeningVoice(true);
        demoStore.setOrbState('LISTENING');
        recognitionRef.current.start();
      } catch {
        setIsListeningVoice(false);
        demoStore.setOrbState('IDLE');
      }
    }
  };

  const handleInputChange = (val: string) => {
    setDraft(val);
    setDismissed(false);
    if (val.trim().length > 0 && orbState === 'IDLE') {
      demoStore.setOrbState('LISTENING');
    } else if (val.trim().length === 0 && orbState === 'LISTENING') {
      demoStore.setOrbState('IDLE');
    }
  };

  const pick = (row: (typeof SOURCES)[number] | (typeof COMMANDS)[number]) => {
    if ('attach' in row && row.attach) {
      fileInputRef.current?.click();
      if (token) setDraft(draft.slice(0, token.start));
    } else if (menu === 'at') {
      setDraft(`${token ? draft.slice(0, token.start) : draft}@${row.name} `);
    } else {
      setDraft(`${token ? draft.slice(0, token.start) : draft}${row.name} `);
    }
    setPlusOpen(false);
    setDismissed(false);
    inputRef.current?.focus();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    inputRef.current?.focus();
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    inputRef.current?.focus();
  };

  const executeDirective = async (customPrompt?: string) => {
    const promptText = (customPrompt ?? draft).trim();
    if ((!promptText && attachments.length === 0) || isProcessing) return;

    setIsProcessing(true);
    setLatestResponse(null);
    setShowSuggestions(false);
    setPlusOpen(false);

    let finalPrompt = promptText;
    if (attachments.length > 0) {
      const fileList = attachments.map((f) => f.name).join(', ');
      finalPrompt = promptText
        ? `${promptText} [Attachments: ${fileList}]`
        : `Analyze attached files: ${fileList}`;
    }

    try {
      const response = await agentEngine.processCommand(finalPrompt);
      setLatestResponse(response);
      setDraft('');
      setAttachments([]);
    } catch (err) {
      console.error('[Syntrophos Command] Failed to process:', err);
      setLatestResponse({
        text: 'An error occurred during neural directive processing.',
        state: 'IDLE',
      });
      demoStore.setOrbState('IDLE');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    void executeDirective();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (menu && rows.length > 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setEngaged(true);
        setActive((current) => (current + (e.key === 'ArrowDown' ? 1 : rows.length - 1)) % rows.length);
        return;
      }
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') {
        e.preventDefault();
        const selected = rows[active];
        if (selected) {
          pick(selected);
        }
        return;
      }
    }

    if (e.key === 'Escape') {
      setDismissed(true);
      setPlusOpen(false);
      setShowSuggestions(false);
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void executeDirective();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setDraft(prompt);
    setShowSuggestions(false);
    inputRef.current?.focus();
    void executeDirective(prompt);
  };

  const canSend = draft.trim().length > 0 || attachments.length > 0;
  const stateInfo = STATE_CONFIG[orbState];

  return (
    <div
      data-promptbar
      style={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(640px, 92vw)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'auto',
      }}
    >
      {/* Hidden real file input for actual attachments */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* ─────────────────────────────────────────────────────────────────────────────
       * 1. SUBTLE STATE INDICATOR (CENTERED BELOW ORB)
       * ──────────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: stateInfo.color,
          userSelect: 'none',
          marginBottom: 2,
          transition: 'all 200ms ease',
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: stateInfo.color,
            boxShadow: `0 0 8px ${stateInfo.glow}`,
          }}
        />
        <span>{stateInfo.label}</span>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
       * 2. REAL-TIME AGENT RESPONSE POPUP
       * ──────────────────────────────────────────────────────────────────────────── */}
      {latestResponse && (
        <div
          className="ui-popover"
          style={{
            width: '100%',
            background: 'rgba(10, 5, 2, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 170, 48, 0.35)',
            boxShadow: '0 16px 50px rgba(0, 0, 0, 0.85), 0 0 20px rgba(255, 170, 48, 0.1)',
            borderRadius: 10,
            padding: '14px 18px',
            color: '#fff5e6',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            animation: 'prompt-pop-in 180ms cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 'bold',
                letterSpacing: '0.12em',
                color: '#ffaa30',
              }}
            >
              SYNTHROPHOS
            </span>

            <button
              type="button"
              onClick={() => setLatestResponse(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#885522',
                cursor: 'pointer',
                fontSize: 13,
                padding: '0 4px',
              }}
              title="Dismiss"
            >
              ✕
            </button>
          </div>

          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: '#f5e8d8' }}>
            {latestResponse.text}
          </p>

          {latestResponse.actionSummary && (
            <div
              style={{
                alignSelf: 'flex-start',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: '#ffaa30',
                background: 'rgba(255, 170, 48, 0.1)',
                border: '1px solid rgba(255, 170, 48, 0.2)',
                padding: '2px 7px',
                borderRadius: 3,
                marginTop: 2,
              }}
            >
              ✓ {latestResponse.actionSummary}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
       * 3. COMMAND INPUT BAR ANCHOR + @ & / MENUS
       * ──────────────────────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Floating @ and / Source/Command Menu */}
        {menu && (
          <div
            onMouseLeave={() => setEngaged(false)}
            className="syntrophos-prompt-menu"
          >
            {/* Single gliding highlight behind hovered/active row */}
            <span
              aria-hidden
              className="syntrophos-gliding-highlight"
              style={{
                top: rowBox?.top ?? 0,
                height: rowBox?.height ?? 0,
                opacity: rowBox && engaged && rows.length > 0 ? 1 : 0,
              }}
            />
            {rows.map((row, i) => {
              const IconComp = row.icon;
              const isRowActive = active === i && engaged;
              return (
                <button
                  key={row.key}
                  type="button"
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => {
                    setActive(i);
                    setEngaged(true);
                  }}
                  onClick={() => pick(row)}
                  className="syntrophos-prompt-row"
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      background: 'rgba(255, 170, 48, 0.08)',
                      color: '#ffaa30',
                      flexShrink: 0,
                    }}
                  >
                    <IconComp width={13} height={13} />
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: isRowActive ? '#ffffff' : '#fff5e6',
                      flexShrink: 0,
                    }}
                  >
                    {row.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11.5,
                      color: '#aa7744',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {row.desc}
                  </span>
                </button>
              );
            })}
            {rows.length === 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 36,
                  padding: '0 10px',
                  fontSize: 12,
                  color: '#885522',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                No matches for “{query}”
              </div>
            )}
            <div
              style={{
                marginTop: 4,
                borderTop: '1px solid rgba(255, 170, 48, 0.12)',
                padding: '4px 10px 2px 10px',
                fontSize: 10.5,
                fontFamily: 'var(--font-mono)',
                color: '#885522',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{menu === 'at' ? 'Select context source or file' : 'Select command directive'}</span>
              <span style={{ opacity: 0.7 }}>↑↓ to navigate · ↵ select · esc dismiss</span>
            </div>
          </div>
        )}

        {/* Outer Command Dock (Zero inner rectangular border; seamless integration) */}
        <form
          onSubmit={handleSubmit}
          className={`syntrophos-command-dock ${expanded ? 'is-expanded' : ''}`}
          style={{
            border: isProcessing
              ? '1px solid #ffaa30'
              : isListeningVoice
              ? '1px solid #00f0ff'
              : '1px solid rgba(255, 170, 48, 0.28)',
            boxShadow: isProcessing
              ? '0 0 30px rgba(255, 170, 48, 0.25)'
              : undefined,
          }}
        >
          {/* Attachment Chips Row (if any files attached) */}
          {attachments.length > 0 && (
            <div className="syntrophos-attachments-row">
              {attachments.map((file, i) => (
                <span key={`${file.name}-${i}`} className="syntrophos-attachment-chip">
                  <IconPaperclip width={12} height={12} className="text-[#ffaa30]" />
                  <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="syntrophos-chip-remove"
                    title={`Remove ${file.name}`}
                    aria-label={`Remove ${file.name}`}
                  >
                    <IconX width={10} height={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input & Control Layout */}
          {!expanded ? (
            /* Compact Single Line Row: +  Talk to Syntrophos...  🎙  ↑ */
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 6 }}>
              {/* Attachment / Source Trigger Button */}
              <button
                type="button"
                aria-label="Add attachments and sources"
                aria-expanded={plusOpen}
                onClick={() => {
                  setPlusOpen((prev) => !prev);
                  setDismissed(false);
                  inputRef.current?.focus();
                }}
                style={{
                  background: plusOpen ? 'rgba(255, 170, 48, 0.16)' : 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: plusOpen ? '#ffaa30' : '#aa7744',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 150ms ease',
                }}
                title="Add attachments or sources (@)"
              >
                <IconPlus width={15} height={15} />
              </button>

              {/* Seamless, Transparent Textarea (No nested border) */}
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="syntrophos-command-textarea"
                placeholder={
                  isListeningVoice
                    ? 'Listening...'
                    : isProcessing
                    ? 'Syntrophos thinking...'
                    : 'Talk to Syntrophos...'
                }
                disabled={isProcessing}
                autoComplete="off"
                spellCheck={false}
                aria-label="Command prompt"
              />

              {/* Microphone / Dictation Button */}
              <button
                type="button"
                onClick={toggleVoice}
                style={{
                  background: isListeningVoice ? 'rgba(0, 240, 255, 0.18)' : 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isListeningVoice ? '#00f0ff' : '#aa7744',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 160ms ease',
                }}
                title={isListeningVoice ? 'Stop listening' : 'Voice command'}
                aria-label="Toggle voice command"
              >
                {isListeningVoice ? (
                  <span className="syntrophos-mic-eq">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="syntrophos-mic-eq-bar"
                        style={{
                          animation: `eq-bounce 850ms ease-in-out ${i * 160}ms infinite`,
                        }}
                      />
                    ))}
                  </span>
                ) : (
                  <IconVoice width={14} height={14} />
                )}
              </button>

              {/* Transmit Button */}
              <button
                type="submit"
                disabled={!canSend || isProcessing}
                style={{
                  background: canSend && !isProcessing ? '#ffaa30' : 'rgba(255, 170, 48, 0.1)',
                  color: canSend && !isProcessing ? '#050200' : '#664422',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: canSend && !isProcessing ? 'pointer' : 'default',
                  boxShadow: canSend && !isProcessing ? '0 0 14px rgba(255, 170, 48, 0.45)' : 'none',
                  flexShrink: 0,
                  transition: 'all 160ms ease',
                }}
                aria-label="Transmit directive"
                title="Transmit directive"
              >
                ↑
              </button>
            </div>
          ) : (
            /* Expanded Multiline Layout */
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 6 }}>
              <textarea
                ref={inputRef}
                rows={2}
                value={draft}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="syntrophos-command-textarea"
                placeholder={
                  isListeningVoice
                    ? 'Listening...'
                    : isProcessing
                    ? 'Syntrophos thinking...'
                    : 'Talk to Syntrophos...'
                }
                disabled={isProcessing}
                autoComplete="off"
                spellCheck={false}
                aria-label="Command prompt"
              />

              {/* Expanded Action Footer Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    aria-label="Add attachments and sources"
                    aria-expanded={plusOpen}
                    onClick={() => {
                      setPlusOpen((prev) => !prev);
                      setDismissed(false);
                      inputRef.current?.focus();
                    }}
                    style={{
                      background: plusOpen ? 'rgba(255, 170, 48, 0.16)' : 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      color: plusOpen ? '#ffaa30' : '#aa7744',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                    title="Add attachments or sources (@)"
                  >
                    <IconPlus width={13} height={13} />
                    <span>Add context</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Microphone Button */}
                  <button
                    type="button"
                    onClick={toggleVoice}
                    style={{
                      background: isListeningVoice ? 'rgba(0, 240, 255, 0.18)' : 'transparent',
                      border: 'none',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isListeningVoice ? '#00f0ff' : '#aa7744',
                      cursor: 'pointer',
                      transition: 'all 160ms ease',
                    }}
                    title={isListeningVoice ? 'Stop listening' : 'Voice command'}
                    aria-label="Toggle voice command"
                  >
                    {isListeningVoice ? (
                      <span className="syntrophos-mic-eq">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="syntrophos-mic-eq-bar"
                            style={{
                              animation: `eq-bounce 850ms ease-in-out ${i * 160}ms infinite`,
                            }}
                          />
                        ))}
                      </span>
                    ) : (
                      <IconVoice width={14} height={14} />
                    )}
                  </button>

                  {/* Transmit Button */}
                  <button
                    type="submit"
                    disabled={!canSend || isProcessing}
                    style={{
                      background: canSend && !isProcessing ? '#ffaa30' : 'rgba(255, 170, 48, 0.1)',
                      color: canSend && !isProcessing ? '#050200' : '#664422',
                      border: 'none',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 'bold',
                      cursor: canSend && !isProcessing ? 'pointer' : 'default',
                      boxShadow: canSend && !isProcessing ? '0 0 14px rgba(255, 170, 48, 0.45)' : 'none',
                      transition: 'all 160ms ease',
                    }}
                    aria-label="Transmit directive"
                    title="Transmit directive"
                  >
                    ↑
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
       * 4. SUBTLE SUGGESTIONS TOGGLE (HIDDEN BY DEFAULT)
       * ──────────────────────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setShowSuggestions(!showSuggestions)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#885522',
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.08em',
          cursor: 'pointer',
          padding: '2px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          transition: 'color 160ms ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ffaa30')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#885522')}
      >
        <span>Suggestions</span>
        <span>{showSuggestions ? '▴' : '▾'}</span>
      </button>

      {/* EXPANDED SUGGESTIONS FLOATING DRAWER */}
      {showSuggestions && (
        <div
          className="ui-popover"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            background: 'rgba(10, 5, 2, 0.94)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 170, 48, 0.28)',
            borderRadius: 10,
            padding: '10px 12px',
            width: '100%',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8)',
            animation: 'prompt-pop-in 180ms cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              fontFamily: 'var(--font-mono)',
              color: '#885522',
              letterSpacing: '0.12em',
              paddingLeft: 4,
            }}
          >
            NATURAL LANGUAGE DIRECTIVES
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleQuickPrompt(prompt)}
                style={{
                  background: 'rgba(255, 170, 48, 0.06)',
                  border: '1px solid rgba(255, 170, 48, 0.18)',
                  borderRadius: 12,
                  color: '#d99a4e',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 140ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ffaa30';
                  e.currentTarget.style.color = '#fff5e6';
                  e.currentTarget.style.background = 'rgba(255, 170, 48, 0.16)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 170, 48, 0.18)';
                  e.currentTarget.style.color = '#d99a4e';
                  e.currentTarget.style.background = 'rgba(255, 170, 48, 0.06)';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
