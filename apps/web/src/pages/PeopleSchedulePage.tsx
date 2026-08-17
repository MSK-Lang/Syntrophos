import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader.js';
import { Badge, Button, Input } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState } from '@/components/ui/states.js';
import CalendarPage from '@/pages/CalendarPage.js';
import {
  IconCalendar,
  IconUser,
  IconUsers,
  IconPlus,
  IconSearch,
  IconBot,
  IconCheckCircle,
  IconX,
  IconTasks,
  IconNotes,
  IconFolder,
  IconMail,
} from '@/lib/icons.js';

export type Person = {
  readonly id: string;
  readonly name: string;
  readonly companyOrRole: string;
  readonly lastInteraction: string;
  readonly nextMeeting?: string;
  readonly openTasksCount: number;
  readonly conversationsCount: number;
  readonly notesCount: number;
  readonly relatedProject?: string;
  readonly needingAttention?: string;
};

export type Meeting = {
  readonly id: string;
  readonly title: string;
  readonly timeText: string;
  readonly isUpcoming: boolean;
  readonly participants: readonly string[];
  readonly project?: string;
  readonly relatedTasks: readonly string[];
  readonly relatedNotes: readonly string[];
};

const MOCK_PEOPLE: Person[] = [
  {
    id: 'person-1',
    name: 'Sarah Chen',
    companyOrRole: 'Head of Product · Helio Labs',
    lastInteraction: '2h ago',
    nextMeeting: 'Product Strategy Review · Tomorrow 10:30 AM',
    openTasksCount: 2,
    conversationsCount: 4,
    notesCount: 5,
    relatedProject: 'Syntrophos V1 Release',
    needingAttention: 'Waiting for your response on launch timeline',
  },
  {
    id: 'person-2',
    name: 'Jordan Vance',
    companyOrRole: 'Lead Architect · Core Systems',
    lastInteraction: '4h ago',
    nextMeeting: 'Code Audit Review · Friday 02:00 PM',
    openTasksCount: 3,
    conversationsCount: 6,
    notesCount: 3,
    relatedProject: 'Dense Retrieval Evaluation',
    needingAttention: 'Follow-up due today for PR #184',
  },
  {
    id: 'person-3',
    name: 'Alex Rivera',
    companyOrRole: 'Design Systems Lead',
    lastInteraction: '1d ago',
    nextMeeting: 'UI Polish Sync · Next Monday',
    openTasksCount: 1,
    conversationsCount: 2,
    notesCount: 2,
    relatedProject: 'Syntrophos V1 Release',
  },
];

const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Product Strategy Review',
    timeText: 'Tomorrow · 10:30 AM - 11:30 AM',
    isUpcoming: true,
    participants: ['Sarah Chen', 'Jordan Vance', 'Operator'],
    project: 'Syntrophos V1 Release',
    relatedTasks: ['Refine topbar command surface', 'Verify theme tokens'],
    relatedNotes: ['Q3 Launch Architecture Specs'],
  },
  {
    id: 'meet-2',
    title: 'Code Audit & ColBERT Reranker Alignment',
    timeText: 'Friday · 02:00 PM - 03:00 PM',
    isUpcoming: true,
    participants: ['Jordan Vance', 'Operator'],
    project: 'Dense Retrieval Evaluation',
    relatedTasks: ['Run recall@10 benchmark'],
    relatedNotes: ['Retrieval Evaluation & Benchmark Report'],
  },
  {
    id: 'meet-3',
    title: 'Q3 Strategic Kickoff & Allocation',
    timeText: 'Yesterday · 03:00 PM',
    isUpcoming: false,
    participants: ['Sarah Chen', 'Jordan Vance', 'Alex Rivera', 'Operator'],
    project: 'Syntrophos V1 Release',
    relatedTasks: ['Allocate 40h dev time'],
    relatedNotes: ['Q3 Roadmap Notes'],
  },
];

export default function PeopleSchedulePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'people' | 'calendar' | 'meetings'>('overview');
  const [people, setPeople] = useState<Person[]>(MOCK_PEOPLE);
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);

  // New Meeting Form
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newParticipant, setNewParticipant] = useState('');

  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return people;
    const q = searchQuery.toLowerCase();
    return people.filter(
      (p) => p.name.toLowerCase().includes(q) || p.companyOrRole.toLowerCase().includes(q)
    );
  }, [people, searchQuery]);

  const filteredMeetings = useMemo(() => {
    if (!searchQuery.trim()) return meetings;
    const q = searchQuery.toLowerCase();
    return meetings.filter(
      (m) => m.title.toLowerCase().includes(q) || m.participants.some((pt) => pt.toLowerCase().includes(q))
    );
  }, [meetings, searchQuery]);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newM: Meeting = {
      id: `meet-${Date.now()}`,
      title: newTitle.trim(),
      timeText: newTime.trim() || 'Tomorrow · 10:00 AM',
      isUpcoming: true,
      participants: newParticipant.trim() ? [newParticipant.trim(), 'Operator'] : ['Operator'],
      relatedTasks: [],
      relatedNotes: [],
    };
    setMeetings((prev) => [newM, ...prev]);
    setIsNewMeetingOpen(false);
    setNewTitle('');
    setNewTime('');
    setNewParticipant('');
  };

  return (
    <div className="shell-page shell-page--wide" style={{ background: '#000000', color: '#ffcc66', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>
      {/* 1. COMPACT WORKSPACE HEADER */}
      <PageHeader
        variant="wide"
        icon={<IconCalendar width={22} height={22} />}
        title="PEOPLE & SCHEDULE // RELATIONSHIPS & TIME MATRIX"
        subtitle="People, meetings, and your calendar in one connected workspace."
        actions={[
          {
            id: 'new-meeting',
            label: '+ New meeting',
            variant: 'primary',
            icon: <IconPlus width={14} height={14} />,
            onAction: () => setIsNewMeetingOpen(true),
            primary: true,
          },
        ]}
      />

      <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20, flex: '1 1 auto' }}>
        {/* 2. SEGMENTED TAB NAVIGATION */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid rgba(255, 170, 48, 0.25)', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(['overview', 'people', 'calendar', 'meetings'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                  border: activeTab === tab ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                  color: activeTab === tab ? '#ffcc66' : '#d99a4e',
                  borderRadius: 4,
                  padding: '6px 16px',
                  fontSize: 12,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab !== 'calendar' && (
            <div style={{ width: 280 }}>
              <Input
                placeholder="Search people & meetings… (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leading={<IconSearch width={14} height={14} />}
                style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66', fontSize: 12 }}
              />
            </div>
          )}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Metric Summary Bar */}
            <div style={{ background: 'rgba(12, 6, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
                TODAY SUMMARY
              </div>
              <div style={{ display: 'flex', gap: 24, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#ffcc66' }}><strong style={{ color: '#ffaa30' }}>2</strong> meetings</span>
                <span style={{ color: '#885522' }}>·</span>
                <span style={{ color: '#ffcc66' }}><strong style={{ color: '#ffaa30' }}>3</strong> people</span>
                <span style={{ color: '#885522' }}>·</span>
                <span style={{ color: '#ffcc66' }}><strong style={{ color: '#ffaa30' }}>1</strong> follow-up</span>
              </div>
            </div>

            {/* Next Meeting Hero Card */}
            {meetings[0] && (
              <div style={{ background: 'rgba(20, 10, 2, 0.9)', border: '1px solid rgba(255, 170, 48, 0.4)', borderRadius: 8, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 0 20px rgba(255, 170, 48, 0.1)' }}>
                <div style={{ fontSize: 10, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
                  NEXT UPCOMING MEETING
                </div>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ffcc66' }}>
                  {meetings[0].title}
                </div>
                <div style={{ fontSize: 11, color: '#885522', fontFamily: 'var(--font-mono)' }}>
                  {meetings[0].timeText} · {meetings[0].participants.join(' · ')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255, 170, 48, 0.2)' }}>
                  <span style={{ fontSize: 10, color: '#ffaa30', fontFamily: 'var(--font-mono)' }}>
                    PROJECT: {meetings[0].project ?? 'Syntrophos Launch'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const first = meetings[0];
                      if (first) setSelectedMeeting(first);
                    }}
                    style={{ background: '#ffaa30', border: 'none', borderRadius: 4, color: '#000000', padding: '6px 14px', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    [ OPEN MEETING WORKSPACE → ]
                  </button>
                </div>
              </div>
            )}

            {/* People Needing Attention */}
            <div>
              <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                PEOPLE NEEDING ATTENTION
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
                {people.filter((p) => p.needingAttention).map((p) => (
                  <div key={p.id} onClick={() => setSelectedPerson(p)} style={{ background: 'rgba(12, 6, 1, 0.85)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 6, padding: '14px', display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer' }}>
                    <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ffcc66' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#885522', fontFamily: 'var(--font-mono)' }}>{p.companyOrRole}</div>
                    <div style={{ fontSize: 11, color: '#ffaa30', background: 'rgba(255, 170, 48, 0.1)', padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(255, 170, 48, 0.2)' }}>
                      • {p.needingAttention}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PEOPLE */}
        {activeTab === 'people' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {filteredPeople.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPerson(p)}
                style={{ background: 'rgba(12, 6, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '18px', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #ffaa30, #cc7800)', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14 }}>
                    {p.name.slice(0, 1)}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#885522', fontFamily: 'var(--font-mono)' }}>{p.companyOrRole}</div>
                  </div>
                </div>

                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#d99a4e', background: 'rgba(20, 10, 2, 0.7)', padding: '8px 10px', borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>Last interaction: {p.lastInteraction}</div>
                  {p.nextMeeting && <div>Next: {p.nextMeeting}</div>}
                  <div>{p.openTasksCount} open tasks · {p.conversationsCount} conversations</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" style={{ background: 'transparent', border: 'none', color: '#ffaa30', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}>
                    [ Open Person Workspace → ]
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: CALENDAR (REUSES EXISTING CALENDAR IMPLEMENTATION INTACT) */}
        {activeTab === 'calendar' && (
          <CalendarPage embedInWorkspace />
        )}

        {/* TAB 4: MEETINGS */}
        {activeTab === 'meetings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                UPCOMING MEETINGS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredMeetings.filter((m) => m.isUpcoming).map((m) => (
                  <div key={m.id} onClick={() => setSelectedMeeting(m)} style={{ background: 'rgba(12, 6, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 6, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 'bold', color: '#ffcc66' }}>{m.title}</div>
                      <div style={{ fontSize: 11, color: '#885522', fontFamily: 'var(--font-mono)' }}>
                        {m.timeText} · {m.participants.join(' · ')}
                      </div>
                    </div>
                    <button type="button" style={{ background: '#ffaa30', border: 'none', borderRadius: 4, color: '#000000', padding: '6px 12px', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}>
                      [ OPEN ]
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: '#885522', fontWeight: 'bold', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                PAST MEETINGS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredMeetings.filter((m) => !m.isUpcoming).map((m) => (
                  <div key={m.id} onClick={() => setSelectedMeeting(m)} style={{ background: 'rgba(8, 4, 1, 0.8)', border: '1px solid rgba(255, 170, 48, 0.15)', borderRadius: 6, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 'bold', color: '#d99a4e' }}>{m.title}</div>
                      <div style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)' }}>
                        {m.timeText} · {m.participants.length} participants
                      </div>
                    </div>
                    <button type="button" style={{ background: 'rgba(255, 170, 48, 0.15)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, color: '#ffcc66', padding: '4px 10px', fontSize: 10, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                      [ VIEW BRIEF ]
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PERSON DETAIL DRAWER */}
      {selectedPerson && (
        <PersonDetailDrawer
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      {/* MEETING DETAIL DRAWER */}
      {selectedMeeting && (
        <MeetingDetailDrawer
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        />
      )}

      {/* NEW MEETING MODAL */}
      {isNewMeetingOpen && (
        <NewMeetingModal
          title={newTitle}
          setTitle={setNewTitle}
          time={newTime}
          setTime={setNewTime}
          participant={newParticipant}
          setParticipant={setNewParticipant}
          onClose={() => setIsNewMeetingOpen(false)}
          onSubmit={handleCreateMeeting}
        />
      )}
    </div>
  );
}

function PersonDetailDrawer({
  person,
  onClose,
}: {
  readonly person: Person;
  readonly onClose: () => void;
}) {
  return (
    <div className="task-detail-drawer" style={{ color: '#ffcc66', fontFamily: 'var(--font-sans)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
          <IconUser width={14} height={14} />
          <span>PERSON WORKSPACE // {person.name.toUpperCase()}</span>
        </div>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
          <IconX width={16} height={16} />
        </button>
      </div>

      <div style={{ padding: '20px', flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ffcc66', marginBottom: 2 }}>{person.name}</div>
          <div style={{ fontSize: 12, color: '#885522', fontFamily: 'var(--font-mono)' }}>{person.companyOrRole}</div>
        </div>

        <div style={{ background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 6, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <div>Conversations: {person.conversationsCount} threads</div>
          <div>Meetings: 2 upcoming</div>
          <div>Tasks: {person.openTasksCount} open</div>
          <div>Project: {person.relatedProject ?? 'General'}</div>
          <div>Notes: {person.notesCount} linked</div>
        </div>

        <button
          type="button"
          onClick={() => window.alert(`Syntrophos background research initiated for ${person.name}.`)}
          style={{
            background: '#ffaa30',
            border: 'none',
            borderRadius: 4,
            color: '#000000',
            padding: '8px',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          [ ASK SYNTROPHOS ABOUT THIS PERSON ]
        </button>
      </div>
    </div>
  );
}

function MeetingDetailDrawer({
  meeting,
  onClose,
}: {
  readonly meeting: Meeting;
  readonly onClose: () => void;
}) {
  return (
    <div className="task-detail-drawer" style={{ color: '#ffcc66', fontFamily: 'var(--font-sans)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
          <IconCalendar width={14} height={14} />
          <span>MEETING WORKSPACE // {meeting.title.toUpperCase()}</span>
        </div>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
          <IconX width={16} height={16} />
        </button>
      </div>

      <div style={{ padding: '20px', flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ffcc66', marginBottom: 4 }}>{meeting.title}</div>
          <div style={{ fontSize: 11, color: '#885522', fontFamily: 'var(--font-mono)' }}>{meeting.timeText}</div>
        </div>

        <div style={{ background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 6, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <div>Participants: {meeting.participants.join(', ')}</div>
          <div>Project: {meeting.project ?? 'Syntrophos Launch'}</div>
          <div>Related Tasks: {meeting.relatedTasks.length} items</div>
          <div>Related Notes: {meeting.relatedNotes.length} notes</div>
        </div>

        <button
          type="button"
          onClick={() => window.alert(`Syntrophos meeting briefing prepared for ${meeting.title}.`)}
          style={{
            background: '#ffaa30',
            border: 'none',
            borderRadius: 4,
            color: '#000000',
            padding: '8px',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          [ PREPARE ME FOR THIS MEETING ]
        </button>
      </div>
    </div>
  );
}

function NewMeetingModal({
  title,
  setTitle,
  time,
  setTime,
  participant,
  setParticipant,
  onClose,
  onSubmit,
}: {
  readonly title: string;
  readonly setTitle: (v: string) => void;
  readonly time: string;
  readonly setTime: (v: string) => void;
  readonly participant: string;
  readonly setParticipant: (v: string) => void;
  readonly onClose: () => void;
  readonly onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        style={{
          width: 520,
          maxWidth: '90vw',
          background: '#080401',
          border: '1px solid rgba(255, 170, 48, 0.4)',
          borderRadius: 8,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-sans)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconCalendar width={14} height={14} />
            <span>SCHEDULE MEETING</span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
            <IconX width={16} height={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>MEETING TITLE *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product Architecture Sync"
              required
              autoFocus
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>TIME &amp; DATE</label>
            <Input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. Tomorrow · 10:30 AM"
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>PARTICIPANT / CONTACT</label>
            <Input
              value={participant}
              onChange={(e) => setParticipant(e.target.value)}
              placeholder="e.g. Sarah Chen"
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              [ SCHEDULE MEETING ]
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
