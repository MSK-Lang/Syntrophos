import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader.jsx';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states.js';
import { IconCalendar, IconChevronLeft, IconChevronRight, IconPlus } from '@/lib/icons.jsx';
import { useCalendar } from '@/lib/services/index.js';
import type { CalendarEvent, Calendar } from '@/lib/services/calendar.contract.js';

export default function CalendarPage() {
  const { listCalendars, listEvents } = useCalendar();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const start = cursor.toISOString();
        const end = addMonths(cursor, 1).toISOString();
        const [c, e] = await Promise.all([listCalendars(), listEvents({ startAt: start, endAt: end })]);
        if (!mounted) return;
        setCalendars((Array.isArray(c) ? c : (c as { items?: Calendar[] }).items ?? []) as Calendar[]);
        setEvents((Array.isArray(e) ? e : e.items ?? []) as CalendarEvent[]);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [cursor, listCalendars, listEvents]);

  const days = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const today = new Date().toDateString();

  return (
    <div className="shell-page shell-page--wide">
      <PageHeader
        variant="wide"
        icon={<IconCalendar width={22} height={22} />}
        title="Calendar"
        subtitle={`${cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} · ${events.length} events`}
        actions={[
          { id: 'today', label: 'Today', variant: 'ghost', onAction: () => setCursor(startOfMonth(new Date())) },
          { id: 'prev', label: '', variant: 'ghost', icon: <IconChevronLeft width={16} height={16} />, onAction: () => setCursor(addMonths(cursor, -1)) },
          { id: 'next', label: '', variant: 'ghost', icon: <IconChevronRight width={16} height={16} />, onAction: () => setCursor(addMonths(cursor, 1)) },
          { id: 'new', label: 'New event', variant: 'secondary', icon: <IconPlus width={14} height={14} />, primary: true },
        ]}
      />
      <div style={{ padding: '0 var(--space-6) var(--space-8)', display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: 'var(--space-6)' }}>
        <Card tone="default">
          <CardHeader>
            <CardTitle>Calendars</CardTitle>
          </CardHeader>
          <CardBody>
            <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {calendars.map((c) => (
                <li key={c.id}>
                  <div className="inline-stack">
                    <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 'var(--radius-full)', background: calendarColor(c.id) }} />
                    <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{typeof c.source === 'string' ? c.source : c.source.integrationId}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <div>
          {loading ? (
            <PageLoader label="Loading calendar…" />
          ) : error ? (
            <ErrorState title="Failed to load calendar" error={error.message} />
          ) : (
            <Card tone="default" style={{ padding: 0 }}>
              <div className="calendar-grid">
                <div className="calendar-grid__weekdays">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <div key={d} style={{ padding: 'var(--space-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: 'var(--color-text-subtle)' }}>
                      {d}
                    </div>
                  ))}
                </div>
                <div className="calendar-grid__days">
                  {days.map((d, i) => {
                    const isToday = d.date.toDateString() === today;
                    const dayEvents = events.filter((e) => (e.startAt ? new Date(e.startAt).toDateString() : '') === d.date.toDateString());
                    return (
                      <div key={i} className={`calendar-grid__day ${isToday ? 'calendar-grid__day--today' : ''} ${d.inMonth ? '' : 'calendar-grid__day--muted'}`}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="calendar-grid__day-num">{d.date.getDate()}</span>
                          {dayEvents.length > 0 && <Badge tone="primary" size="sm">{dayEvents.length}</Badge>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'var(--space-2)' }}>
                          {dayEvents.slice(0, 3).map((e) => (
                            <div
                              key={e.id}
                              style={{
                                padding: '3px var(--space-2)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 11,
                                color: 'white',
                                background: calendarColor(e.calendarId),
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.25,
                              }}
                            >
                              {!e.allDay && e.startAt
                                ? `${new Date(e.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} `
                                : ''}
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', paddingLeft: 'var(--space-2)' }}>
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>
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
  const palette = [
    'var(--color-primary-500)',
    'var(--color-accent-violet)',
    'var(--color-accent-teal)',
    'var(--color-accent-amber)',
    'var(--color-accent-rose)',
    'var(--color-success-500)',
    'var(--color-warning-500)',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length] ?? 'var(--color-primary-500)';
}
