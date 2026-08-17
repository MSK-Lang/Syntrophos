import type { CalendarEvent } from '@/lib/services/calendar.contract';
import type { Note } from '@/lib/services/notes.contract';
import { IconMail, IconCalendar, IconCode, IconNotes, IconCore, type IconComponent } from '@/lib/icons.js';

export type ContextSourceType = 'gmail' | 'calendar' | 'github' | 'vault' | 'projects' | null;

export type ContextDrawerModalProps = {
  readonly sourceType: ContextSourceType;
  readonly onClose: () => void;
  readonly events?: readonly CalendarEvent[];
  readonly notes?: readonly Note[];
  readonly onExecuteAction?: (prompt: string) => void;
};

export function ContextDrawerModal({
  sourceType,
  onClose,
  events = [],
  notes = [],
  onExecuteAction,
}: ContextDrawerModalProps) {
  if (!sourceType) return null;

  const titles: Record<Exclude<ContextSourceType, null>, { name: string; subtitle: string; Icon: IconComponent }> = {
    gmail: {
      name: 'GMAIL CONTEXT STREAM',
      subtitle: '12 UNREAD MESSAGES · 3 HIGHLY RELEVANT',
      Icon: IconMail,
    },
    calendar: {
      name: 'CALENDAR & TEMPORAL SCHEDULE',
      subtitle: `${events.length} UPCOMING EVENTS · 1 POTENTIAL CONFLICT`,
      Icon: IconCalendar,
    },
    github: {
      name: 'GITHUB CODE BASE ENGINE',
      subtitle: 'SYNTACTIC REPOSITORY TRACKING · MAIN BRANCH',
      Icon: IconCode,
    },
    vault: {
      name: 'OBSIDIAN KNOWLEDGE VAULT',
      subtitle: `${notes.length} INDEXED MARKDOWN NODES · SYNCED`,
      Icon: IconNotes,
    },
    projects: {
      name: 'ACTIVE PROJECT WORKSPACES',
      subtitle: '3 ACTIVE PIPELINES IN FLIGHT',
      Icon: IconCore,
    },
  };

  const meta = titles[sourceType];
  const Icon = meta.Icon;

  return (
    <div className="context-drawer-overlay" onClick={onClose}>
      <div className="context-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#ffaa30', display: 'inline-flex', alignItems: 'center' }}>
              <Icon width={18} height={18} />
            </span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                {meta.name}
              </div>
              <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace', marginTop: 2 }}>
                {meta.subtitle}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#885522',
              fontSize: 12,
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            [ ESC ✕ ]
          </button>
        </div>

        {/* Content per Source */}
        {sourceType === 'gmail' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 11, color: '#ffcc66', fontFamily: 'monospace' }}>
              RELEVANT INBOUND MESSAGES DETECTED BY SYNTROPHOS:
            </div>

            <div className="evidence-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 'bold', color: '#ffcc66' }}>
                <span>Follow-up on Q3 Roadmap Deliverables</span>
                <span style={{ color: '#885522', fontSize: 10 }}>2h ago</span>
              </div>
              <div style={{ fontSize: 11, color: '#d99a4e', marginTop: 4, lineHeight: 1.5 }}>
                From: Client Lead &lt;client@syntrophos.io&gt;
              </div>
              <div style={{ fontSize: 10, color: '#885522', marginTop: 6, fontStyle: 'italic' }}>
                "Looking forward to the milestone breakdown for next sprint..."
              </div>
              <button
                type="button"
                onClick={() => {
                  onExecuteAction?.('Draft follow-up email response for Q3 Roadmap Deliverables');
                  onClose();
                }}
                style={{
                  marginTop: 10,
                  background: '#ffaa30',
                  border: 'none',
                  borderRadius: 4,
                  color: '#000000',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  fontWeight: 'bold',
                  padding: '5px 12px',
                  cursor: 'pointer',
                }}
              >
                [ DRAFT RESPONSE WITH AI ]
              </button>
            </div>

            <div className="evidence-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 'bold', color: '#ffcc66' }}>
                <span>Security Notice: API Key Rotation</span>
                <span style={{ color: '#885522', fontSize: 10 }}>4h ago</span>
              </div>
              <div style={{ fontSize: 11, color: '#d99a4e', marginTop: 4 }}>
                System Automated Dispatch · High Priority
              </div>
            </div>
          </div>
        )}

        {sourceType === 'calendar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, color: '#ffcc66', fontFamily: 'monospace' }}>
              TEMPORAL EVENT STREAMS:
            </div>
            {events.length > 0 ? (
              events.map((ev) => (
                <div key={ev.id} className="evidence-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>
                    <span>{ev.title}</span>
                    <span style={{ color: '#ffaa30', fontSize: 10 }}>
                      {ev.startAt ? new Date(ev.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ALL DAY'}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: '#885522', marginTop: 4 }}>
                    {ev.description || 'Syntrophos auto-generated meeting brief available'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 11, color: '#885522', fontFamily: 'monospace' }}>No upcoming events logged.</div>
            )}
          </div>
        )}

        {sourceType === 'vault' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, color: '#ffcc66', fontFamily: 'monospace' }}>
              CANONICAL OBSIDIAN KNOWLEDGE NODES:
            </div>
            {notes.map((n) => (
              <div key={n.id} className="evidence-container">
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: 10, color: '#885522', marginTop: 2 }}>
                  PATH: {n.path} · LAST UPDATED: {n.audit?.updatedAt ? new Date(n.audit.updatedAt).toLocaleDateString() : 'RECENT'}
                </div>
              </div>
            ))}
          </div>
        )}

        {sourceType === 'github' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, color: '#ffcc66', fontFamily: 'monospace' }}>
              REPOSITORY BRANCH TELEMETRY:
            </div>
            <div className="evidence-container">
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>
                syntrophos/apps/web
              </div>
              <div style={{ fontSize: 10, color: '#34d399', marginTop: 4 }}>
                ● 14 commits ahead of main · 0 open vulnerabilities
              </div>
            </div>
          </div>
        )}

        {sourceType === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, color: '#ffcc66', fontFamily: 'monospace' }}>
              ACTIVE WORKSPACE PROJECTS:
            </div>
            <div className="evidence-container">
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>
                Q3 Syntrophos AI-Native Refinement
              </div>
              <div style={{ fontSize: 10, color: '#ffaa30', marginTop: 4 }}>
                Status: Active Execution · 60% Complete
              </div>
            </div>
            <div className="evidence-container">
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>
                Obsidian Vault Sync Connector
              </div>
              <div style={{ fontSize: 10, color: '#34d399', marginTop: 4 }}>
                Status: Operational
              </div>
            </div>
          </div>
        )}

        {/* Footer telemetry */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 170, 48, 0.2)', paddingTop: 14, fontSize: 10, color: '#885522', fontFamily: 'monospace' }}>
          SYNTHROPHOS CONTEXT ENGINE // REAL-TIME INDEX ACTIVE
        </div>
      </div>
    </div>
  );
}
