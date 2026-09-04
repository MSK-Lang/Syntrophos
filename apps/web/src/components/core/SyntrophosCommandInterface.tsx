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

export function SyntrophosCommandInterface({ orbState }: SyntrophosCommandInterfaceProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestResponse, setLatestResponse] = useState<AgentResponse | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

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
      // Graceful fallback simulation
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
    inputRef.current?.focus();
    void executeDirective(prompt);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(760px, 94vw)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        pointerEvents: 'auto',
      }}
    >
      {/* REAL-TIME AGENT RESPONSE POPUP */}
      {latestResponse && (
        <div
          style={{
            width: '100%',
            background: 'rgba(10, 6, 2, 0.94)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 170, 48, 0.4)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 170, 48, 0.15)',
            borderRadius: 12,
            padding: '16px 20px',
            color: '#fff5e6',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            animation: 'fadeInUp 240ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#ffaa30',
                  boxShadow: '0 0 10px #ffaa30',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 'bold',
                  letterSpacing: '0.12em',
                  color: '#ffcc66',
                }}
              >
                SYNTHROPHOS // DIRECTIVE EXECUTED
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLatestResponse(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#885522',
                cursor: 'pointer',
                fontSize: 14,
                padding: '2px 6px',
              }}
              title="Dismiss"
            >
              ✕
            </button>
          </div>

          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#f3e5d3' }}>
            {latestResponse.text}
          </p>

          {latestResponse.actionSummary && (
            <div
              style={{
                alignSelf: 'flex-start',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: '#ffaa30',
                background: 'rgba(255, 170, 48, 0.12)',
                border: '1px solid rgba(255, 170, 48, 0.25)',
                padding: '3px 8px',
                borderRadius: 4,
              }}
            >
              ✓ {latestResponse.actionSummary}
            </div>
          )}
        </div>
      )}

      {/* COMMAND INPUT BAR */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(8, 4, 1, 0.88)',
          backdropFilter: 'blur(24px)',
          border: isProcessing
            ? '1px solid #ffaa30'
            : isListeningVoice
            ? '1px solid #00f0ff'
            : '1px solid rgba(255, 170, 48, 0.35)',
          borderRadius: 36,
          boxShadow: isProcessing
            ? '0 0 35px rgba(255, 170, 48, 0.35)'
            : '0 20px 50px rgba(0, 0, 0, 0.75)',
          padding: '8px 12px 8px 20px',
          gap: 12,
          transition: 'all 240ms ease',
        }}
      >
        {/* State / Pulse Dot */}
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background:
              orbState === 'THINKING'
                ? '#a78bfa'
                : orbState === 'ACTING'
                ? '#10b981'
                : isListeningVoice
                ? '#00f0ff'
                : '#ffaa30',
            boxShadow: `0 0 12px ${
              orbState === 'THINKING'
                ? '#a78bfa'
                : orbState === 'ACTING'
                ? '#10b981'
                : isListeningVoice
                ? '#00f0ff'
                : '#ffaa30'
            }`,
            animation: isProcessing || isListeningVoice ? 'pulse 1s infinite' : 'none',
          }}
          title={`Status: ${orbState}`}
        />

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListeningVoice
              ? 'Listening to speech...'
              : isProcessing
              ? 'Syntrophos processing...'
              : 'Talk to Syntrophos... (e.g. "Remind me to study at 8 PM")'
          }
          disabled={isProcessing}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff5e6',
            fontSize: 15,
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.01em',
          }}
        />

        {/* Hotkey Indicator */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#774411',
            background: 'rgba(255, 170, 48, 0.08)',
            padding: '3px 7px',
            borderRadius: 4,
            border: '1px solid rgba(255, 170, 48, 0.15)',
            userSelect: 'none',
          }}
        >
          ⌘K
        </span>

        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={toggleVoice}
          style={{
            background: isListeningVoice ? '#00f0ff' : 'rgba(255, 170, 48, 0.1)',
            border: isListeningVoice
              ? '1px solid #00f0ff'
              : '1px solid rgba(255, 170, 48, 0.25)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isListeningVoice ? '#000000' : '#ffaa30',
            cursor: 'pointer',
            transition: 'all 180ms ease',
          }}
          title={isListeningVoice ? 'Stop listening' : 'Voice command'}
          aria-label="Toggle voice command"
        >
          <IconVoice className="w-4 h-4" />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          style={{
            background: input.trim() ? '#ffaa30' : 'rgba(255, 170, 48, 0.15)',
            color: input.trim() ? '#000000' : '#885522',
            border: 'none',
            borderRadius: 20,
            padding: '8px 18px',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            letterSpacing: '0.08em',
            cursor: input.trim() && !isProcessing ? 'pointer' : 'default',
            transition: 'all 180ms ease',
          }}
        >
          {isProcessing ? 'EXEC' : 'TRANSMIT'}
        </button>
      </form>

      {/* QUICK COMMAND SUGGESTION CHIPS */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '100%',
          overflowX: 'auto',
          padding: '2px 0',
        }}
      >
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleQuickPrompt(prompt)}
            disabled={isProcessing}
            style={{
              background: 'rgba(12, 6, 2, 0.72)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 170, 48, 0.22)',
              borderRadius: 16,
              color: '#d99a4e',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              padding: '5px 12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 160ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ffaa30';
              e.currentTarget.style.color = '#fff5e6';
              e.currentTarget.style.background = 'rgba(255, 170, 48, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 170, 48, 0.22)';
              e.currentTarget.style.color = '#d99a4e';
              e.currentTarget.style.background = 'rgba(12, 6, 2, 0.72)';
            }}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
