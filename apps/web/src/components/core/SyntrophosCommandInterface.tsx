import type { OrbState } from '@/lib/syntrophosDemoStore.js';
import { SyntrophosPromptBar } from '@/components/ui/SyntrophosPromptBar.js';

export interface SyntrophosCommandInterfaceProps {
  readonly orbState: OrbState;
}

export function SyntrophosCommandInterface({ orbState }: SyntrophosCommandInterfaceProps) {
  return <SyntrophosPromptBar variant="core" orbState={orbState} />;
}
