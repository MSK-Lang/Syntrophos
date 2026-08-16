import type { ID } from './types.js';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export type VoiceTranscript = {
  readonly id: ID;
  readonly text: string;
  readonly isFinal: boolean;
  readonly alternatives?: readonly string[];
  readonly confidence?: number;
  readonly locale: string;
  readonly timestamp: string;
};

export type Utterance = {
  readonly id: ID;
  readonly text: string;
  readonly voiceId?: string;
  readonly locale: string;
  readonly durationMs?: number;
  readonly audioFormat: 'wav' | 'mp3' | 'opus';
};

export type VoiceCapabilities = {
  readonly sttEnabled: boolean;
  readonly ttsEnabled: boolean;
  readonly availableInputLocales: readonly string[];
  readonly availableOutputVoices: readonly {
    readonly id: string;
    readonly name: string;
    readonly gender?: 'male' | 'female' | 'neutral';
    readonly locale: string;
  }[];
};

export interface VoiceService {
  readonly getCapabilities: () => Promise<VoiceCapabilities>;
  readonly getState: () => Promise<VoiceState>;
  readonly startListening: (options?: { readonly locale?: string; readonly continuous?: boolean }) => Promise<void>;
  readonly stopListening: () => Promise<VoiceTranscript | null>;
  readonly subscribeTranscript: (onTranscript: (transcript: VoiceTranscript) => void) => () => void;
  readonly subscribeState: (onState: (state: VoiceState) => void) => () => void;
  readonly speak: (text: string, options?: { readonly voiceId?: string; readonly locale?: string }) => Promise<Utterance>;
  readonly stopSpeaking: () => Promise<void>;
  readonly uploadAudio: (audio: ArrayBuffer, options?: { readonly locale?: string; readonly format?: string }) => Promise<VoiceTranscript>;
}
