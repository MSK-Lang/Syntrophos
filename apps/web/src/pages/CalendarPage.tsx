import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader.js';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Input } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states.js';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconBot,
  IconCheckCircle,
  IconX,
  IconAlertCircle,
  IconSearch,
  IconTasks,
} from '@/lib/icons.js';
import { useCalendar } from '@/lib/services/index.js';
import type { CalendarEvent, Calendar } from '@/lib/services/calendar.contract.js';

export default function CalendarPage({ embedInWorkspace = false }: { readonly embedInWorkspace?: boolean }) {
  const { listCalendars, listEvents, createEvent, deleteEvent } = useCalendar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [enabledCalendarIds, setEnabledCalendarIds] = useState<string[]>([]);

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Event form fields
  const [newTitle, setNewTitle] = useState('');
  const [newCalendarId, setNewCalendarId] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newDescription, setNewDescription] = useState('');

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);

      const start = startOfMonth(cursor).toISOString();
      const end = addMonths(cursor, 1).toISOString();

      const [cRes, eRes] = await Promise.all([
        listCalendars(),
        listEvents({ startAt: start, endAt: end }),
      ]);

      const loadedCal = (Array.isArray(cRes) ? cRes : (cRes as unknown as { items?: Calendar[] }).items ?? []) as Calendar[];
      const loadedEvt = (Array.isArray(eRes) ? eRes : (eRes as unknown as { items?: CalendarEvent[] }).items ?? []) as CalendarEvent[];

      setCalendars(loadedCal);
      setEvents(loadedEvt);

      if (enabledCalendarIds.length === 0 && loadedCal.length > 0) {
        setEnabledCalendarIds(loadedCal.map((c) => c.id));
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCalendarData();
  }, [cursor]);

  const toggleCalendarSource = (id: string) => {
    setEnabledCalendarIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const visibleEvents = useMemo(() => {
    if (enabledCalendarIds.length === 0) return events;
    return events.filter((e) => enabledCalendarIds.includes(e.calendarId));
  }, [events, enabledCalendarIds]);

  const days = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const todayStr = new Date().toDateString();

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const targetCalId = newCalendarId || calendars[0]?.id || 'cal-1';
      const startIso = `${newDate}T${newStartTime}:00.000Z`;
      const endIso = `${newDate}T${newEndTime}:00.000Z`;

      const draft: Record<string, unknown> = {
        calendarId: targetCalId,
        title: newTitle.trim(),
        startAt: startIso,
        endAt: endIso,
        description: newDescription.trim() || undefined,
      };

      await createEvent(draft as unknown as Parameters<typeof createEvent>[0]);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      await loadCalendarData();
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      setSelectedEvent(null);
      await loadCalendarData();
    } catch (err) {
      setError(err as Error);
    }
  };

  return (
    <div className="shell-page shell-page--wide" style={{ background: '#000000', color: '#ffcc66', minHeight: embedInWorkspace ? 'auto' : '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      {!embedInWorkspace && (
        <PageHeader
          variant="wide"
          icon={<IconCalendar width={22} height={22} />}
          title="CALENDAR // TEMPORAL WORKSPACE"
          subtitle={`${cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toUpperCase()} · ${visibleEvents.length} EVENTS`}
          actions={[
            {
              id: 'today',
              label: 'TODAY',
              variant: 'ghost',
              onAction: () => setCursor(startOfMonth(new Date())),
            },
            {
              id: 'prev',
              label: '',
              variant: 'ghost',
              icon: <IconChevronLeft width={16} height={16} />,
              onAction: () => setCursor(addMonths(cursor, -1)),
            },
            {
              id: 'next',
              label: '',
              variant: 'ghost',
              icon: <IconChevronRight width={16} height={16} />,
              onAction: () => setCursor(addMonths(cursor, 1)),
            },
            {
              id: 'new-event',
              label: '+ NEW EVENT',
              variant: 'primary',
              icon: <IconPlus width={14} height={14} />,
              onAction: () => setIsCreateModalOpen(true),
              primary: true,
            },
          ]}
        />
      )}

      {/* Main Calendar Body Grid (Sidebar + Calendar Workspace) */}
      <div style={{ padding: '0 24px 24px 24px', display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr)', gap: 20, flex: '1 1 auto' }}>
        {/* Calendar Sources Sidebar */}
        <aside style={{ background: '#070401', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
            CALENDARS &amp; SOURCES
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {calendars.map((c) => {
              const isEnabled = enabledCalendarIds.includes(c.id);
              const color = calendarColor(c.id);
              return (
                <label
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isEnabled ? '#ffcc66' : '#885522',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleCalendarSource(c.id)}
                    style={{ accentColor: '#ffaa30' }}
                  />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </span>
                </label>
              );
            })}
          </div>

          <div style={{ height: 1, background: 'rgba(255, 170, 48, 0.15)', margin: '4px 0' }} />

          {/* Quick Agenda Widget */}
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.14em', color: '#885522', fontFamily: 'monospace', marginBottom: 8 }}>
              UPCOMING AGENDA
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {visibleEvents.slice(0, 4).map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelectedEvent(e)}
                  style={{
                    background: 'rgba(25, 13, 2, 0.5)',
                    border: '1px solid rgba(255, 170, 48, 0.15)',
                    borderRadius: 4,
                    padding: '6px 8px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffcc66', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {e.title}
                  </div>
                  <div style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace', marginTop: 2 }}>
                    {e.startAt ? new Date(e.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {loading ? (
            <PageLoader label="LOADING CALENDAR GRID…" />
          ) : error ? (
            <ErrorState title="FAILED TO LOAD CALENDAR" error={error.message} />
          ) : viewMode === 'month' ? (
            /* Month Calendar Grid */
            <div className="calendar-month-grid">
              {/* Day Headers Row */}
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
                <div
                  key={d}
                  style={{
                    padding: '10px 8px',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    fontWeight: 'bold',
                    color: '#885522',
                    fontFamily: 'monospace',
                    background: 'rgba(14, 7, 1, 0.95)',
                    borderBottom: '1px solid rgba(255, 170, 48, 0.25)',
                    textAlign: 'center',
                  }}
                >
                  {d}
                </div>
              ))}

              {/* 42 Day Cells */}
              {days.map((d, idx) => {
                const isToday = d.date.toDateString() === todayStr;
                const dateKey = d.date.toDateString();
                const dayEvents = visibleEvents.filter((e) => {
                  if (!e.startAt) return false;
                  return new Date(e.startAt).toDateString() === dateKey;
                });

                return (
                  <div
                    key={idx}
                    className={`calendar-month-day-cell ${isToday ? 'calendar-month-day-cell--today' : ''}`}
                    style={{ opacity: d.inMonth ? 1 : 0.4 }}
                  >
                    {/* Day Number & Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: isToday ? 'bold' : 500,
                          color: isToday ? '#ffcc66' : '#885522',
                          fontFamily: 'monospace',
                        }}
                      >
                        {d.date.getDate()}
                      </span>
                      {isToday && (
                        <span className="island-pulse-orb" style={{ width: 5, height: 5 }} />
                      )}
                      {dayEvents.length > 0 && !isToday && (
                        <span style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace' }}>
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Events inside Day Cell */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 auto', overflowY: 'auto' }}>
                      {dayEvents.slice(0, 3).map((e) => {
                        const color = calendarColor(e.calendarId);
                        return (
                          <div
                            key={e.id}
                            className="calendar-event-pill"
                            onClick={() => setSelectedEvent(e)}
                            style={{
                              background: 'rgba(25, 13, 2, 0.9)',
                              borderLeft: `3px solid ${color}`,
                              color: '#ffcc66',
                            }}
                          >
                            <span style={{ fontSize: 9, color: '#ffaa30' }}>
                              {!e.allDay && e.startAt
                                ? new Date(e.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </span>
                            <span style={{ flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {e.title}
                            </span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace', paddingLeft: 4 }}>
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Agenda List View */
            <div style={{ background: 'rgba(12, 6, 1, 0.85)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: 16 }}>
                CHRONOLOGICAL AGENDA
              </div>

              {visibleEvents.length === 0 ? (
                <EmptyState
                  icon={<IconCalendar width={32} height={32} />}
                  title="No events scheduled"
                  description="No events found for the active calendar filters."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {visibleEvents.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => setSelectedEvent(e)}
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(22, 11, 2, 0.8)',
                        border: '1px solid rgba(255, 170, 48, 0.2)',
                        borderLeft: `4px solid ${calendarColor(e.calendarId)}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffcc66' }}>{e.title}</div>
                        <div style={{ fontSize: 11, color: '#885522', fontFamily: 'monospace', marginTop: 2 }}>
                          {e.startAt ? new Date(e.startAt).toLocaleString() : 'All Day'}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">VIEW</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Drawer */}
      {selectedEvent && (
        <EventDetailDrawer
          event={selectedEvent}
          calendar={calendars.find((c) => c.id === selectedEvent.calendarId)}
          onClose={() => setSelectedEvent(null)}
          onDelete={() => void handleDelete(selectedEvent.id)}
        />
      )}

      {/* New Event Modal */}
      {isCreateModalOpen && (
        <CreateEventModal
          calendars={calendars}
          title={newTitle}
          setTitle={setNewTitle}
          calendarId={newCalendarId}
          setCalendarId={setNewCalendarId}
          date={newDate}
          setDate={setNewDate}
          startTime={newStartTime}
          setStartTime={setNewStartTime}
          endTime={newEndTime}
          setEndTime={setNewEndTime}
          description={newDescription}
          setDescription={setNewDescription}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}
    </div>
  );
}

function EventDetailDrawer({
  event,
  calendar,
  onClose,
  onDelete,
}: {
  readonly event: CalendarEvent;
  readonly calendar?: Calendar | undefined;
  readonly onClose: () => void;
  readonly onDelete: () => void;
}) {
  return (
    <div className="task-detail-drawer" style={{ color: '#ffcc66', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ffaa30', fontWeight: 'bold' }}>
          <IconCalendar width={14} height={14} />
          <span>EVENT DETAIL // {event.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
          <IconX width={16} height={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66' }}>{event.title}</div>
          {event.description && <div style={{ fontSize: 12, color: '#885522', marginTop: 6 }}>{event.description}</div>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(20, 10, 2, 0.6)', padding: '12px 14px', borderRadius: 6, border: '1px solid rgba(255, 170, 48, 0.2)', fontSize: 11 }}>
          <div>
            <div style={{ color: '#885522', fontSize: 10 }}>CALENDAR</div>
            <div style={{ color: '#ffcc66', fontWeight: 'bold', marginTop: 2 }}>{calendar ? calendar.name : 'Personal'}</div>
          </div>
          <div>
            <div style={{ color: '#885522', fontSize: 10 }}>START TIME</div>
            <div style={{ color: '#ffcc66', fontWeight: 'bold', marginTop: 2 }}>
              {event.startAt ? new Date(event.startAt).toLocaleString() : 'All Day'}
            </div>
          </div>
          {event.endAt && (
            <div>
              <div style={{ color: '#885522', fontSize: 10 }}>END TIME</div>
              <div style={{ color: '#ffcc66', fontWeight: 'bold', marginTop: 2 }}>
                {new Date(event.endAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', gap: 10, background: 'rgba(14, 7, 1, 0.95)' }}>
        <button
          type="button"
          onClick={onDelete}
          style={{
            flex: 1,
            background: 'rgba(255, 85, 51, 0.15)',
            border: '1px solid rgba(255, 85, 51, 0.3)',
            borderRadius: 4,
            color: '#ff5533',
            padding: '8px',
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          DELETE EVENT
        </button>
      </div>
    </div>
  );
}

function CreateEventModal({
  calendars,
  title,
  setTitle,
  calendarId,
  setCalendarId,
  date,
  setDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  description,
  setDescription,
  onClose,
  onSubmit,
}: {
  readonly calendars: Calendar[];
  readonly title: string;
  readonly setTitle: (v: string) => void;
  readonly calendarId: string;
  readonly setCalendarId: (v: string) => void;
  readonly date: string;
  readonly setDate: (v: string) => void;
  readonly startTime: string;
  readonly setStartTime: (v: string) => void;
  readonly endTime: string;
  readonly setEndTime: (v: string) => void;
  readonly description: string;
  readonly setDescription: (v: string) => void;
  readonly onClose: () => void;
  readonly onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        style={{
          width: 480,
          maxWidth: '90vw',
          background: '#080401',
          border: '1px solid rgba(255, 170, 48, 0.4)',
          borderRadius: 8,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconPlus width={14} height={14} />
            <span>NEW EVENT SCHEDULE</span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
            <IconX width={16} height={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'monospace' }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>EVENT TITLE *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 1:1 Strategic Alignment with Jordan"
              required
              autoFocus
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>CALENDAR SOURCE</label>
            <select
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(20, 10, 2, 0.8)',
                border: '1px solid rgba(255, 170, 48, 0.3)',
                borderRadius: 4,
                padding: '8px 10px',
                color: '#ffcc66',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            >
              {calendars.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>DATE</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>START TIME</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>END TIME</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              [ CREATE EVENT ]
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function buildMonthGrid(month: Date): readonly { readonly date: Date; readonly inMonth: boolean }[] {
  const first = startOfMonth(month);
  const startIdx = (first.getDay() + 6) % 7; // Monday-based
  const gridStart = addDays(first, -startIdx);
  const days: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    days.push({ date: d, inMonth: d.getMonth() === month.getMonth() });
  }
  return days;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
}

function calendarColor(id: string): string {
  const palette = ['#ffaa30', '#34d399', '#60a5fa', '#a78bfa', '#f43f5e', '#fbbf24'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length] ?? '#ffaa30';
}
