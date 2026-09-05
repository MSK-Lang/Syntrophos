import type { AgentResponse } from '@/lib/agentEngine.js';
import { SyntrophosPromptBar } from '@/components/ui/SyntrophosPromptBar.js';

export type CommandCenterProps = {
  readonly onExecute?: (
    (
      prompt: string,
      directive?: string | undefined,
      attachments?: File[] | undefined
    ) => Promise<AgentResponse | void> | void
  ) | undefined;
  readonly placeholder?: string | undefined;
  readonly mode?: ('personal' | 'business') | undefined;
};

export function CommandCenter({
  onExecute,
  placeholder = 'Tell Syntrophos your intent... (e.g. "What should I take care of today?")',
  mode = 'personal',
}: CommandCenterProps) {
  return (
    <div style={{ width: '100%', maxWidth: '820px', margin: '0 auto' }}>
      <SyntrophosPromptBar
        variant="dashboard"
        placeholder={placeholder}
        mode={mode}
        onExecute={onExecute}
      />
    </div>
  );
}
