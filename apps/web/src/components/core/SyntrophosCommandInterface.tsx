import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { demoStore, type OrbState } from '@/lib/syntrophosDemoStore.js';
import { agentEngine, type AgentResponse } from '@/lib/agentEngine.js';
import { IconVoice } from '@/lib/icons.js';

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

export function SyntrophosCommandInterface({ orbState }: SyntrophosCommandInterfaceProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestResponse, setLatestResponse] = useState<AgentResponse | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
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
            transcript += event.results[i]?.[0]?.transcript ?? '';
          }
          if (transcript) {
            setInput(transcript);
          }
        };

        recognition.onerror = () => {
          setIsListeningVoice(false);
          demoStore.setOrbState('IDLE');
        };

        recognition.onend = () => {
          setIsListeningVoice(false);
          if (input.trim()) {
            void executeDirective(input.trim());
          } else {
            demoStore.setOrbState('IDLE');
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('[Syntrophos Voice] Init error:', err);
      }
    }
  }, [input]);

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

  const toggleVoice = () => {
    if (!voiceSupported || !recognitionRef.current) {
      setInput('Remind me to study at 8 PM.');
      inputRef.current?.focus();
      return;
    }

    if (isListeningVoice) {
      recognitionRef.current.stop();
      setIsListeningVoice(false);
      demoStore.setOrbState('IDLE');
    } else {
      try {
        setInput('');
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
    setInput(val);
    if (val.trim().length > 0 && orbState === 'IDLE') {
      demoStore.setOrbState('LISTENING');
    } else if (val.trim().length === 0 && orbState === 'LISTENING') {
      demoStore.setOrbState('IDLE');
    }
  };

  const executeDirective = async (promptText: string) => {
    if (!promptText || isProcessing) return;

    setIsProcessing(true);
    setLatestResponse(null);
    setShowSuggestions(false);

    try {
      const response = await agentEngine.processCommand(promptText);
      setLatestResponse(response);
      setInput('');
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
    void executeDirective(input.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    setShowSuggestions(false);
    inputRef.current?.focus();
    void executeDirective(prompt);
  };

  const stateInfo = STATE_CONFIG[orbState];

  return (
    <div
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
        gap: 10,
        pointerEvents: 'auto',
      }}
    >
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
          style={{
            width: '100%',
            background: 'rgba(8, 4, 1, 0.94)',
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
            animation: 'fadeInUp 200ms ease',
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
       * 3. COMMAND INPUT BAR (MINIMAL, ELEGANT, QUIET)
       * ──────────────────────────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="syntrophos-command-dock"
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
        {/* Subtle Seamless Input Field (Zero inner border, blends into dock) */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="syntrophos-command-input"
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
        />

        {/* Subtle Voice Mic Button */}
        <button
          type="button"
          onClick={toggleVoice}
          style={{
            background: isListeningVoice ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
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
          <IconVoice className="w-3.5 h-3.5" />
        </button>

        {/* Subtle Transmit Button */}
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          style={{
            background: input.trim() ? '#ffaa30' : 'rgba(255, 170, 48, 0.1)',
            color: input.trim() ? '#000000' : '#664422',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 'bold',
            cursor: input.trim() && !isProcessing ? 'pointer' : 'default',
            transition: 'all 160ms ease',
          }}
          aria-label="Transmit directive"
          title="Transmit directive"
        >
          ↑
        </button>
      </form>

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
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            background: 'rgba(8, 4, 1, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 170, 48, 0.25)',
            borderRadius: 8,
            padding: '10px',
            width: '100%',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8)',
            animation: 'fadeIn 160ms ease',
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              color: '#885522',
              letterSpacing: '0.1em',
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
                  e.currentTarget.style.background = 'rgba(255, 170, 48, 0.14)';
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
