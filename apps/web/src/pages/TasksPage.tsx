import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Card, CardBody, CardHeader, CardTitle, Separator } from '@/components/ui/primitives';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states';
import { IconPlus, IconTasks } from '@/lib/icons';
import { useTasks } from '@/lib/services/index';
import type { Project, Section, Task, TaskPriority, TaskStatus } from '@/lib/services/tasks.contract';

export default function TasksPage() {
  const { listTasks, listProjects, getOverdue, getToday, getUpcoming } = useTasks();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [, setSections] = useState<Section[]>([]);
  const [view, setView] = useState<'board' | 'list'>('board');

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [t, p, ov, tod, upc] = await Promise.all([
          listTasks({ pageSize: 100 }),
          listProjects({ pageSize: 20 }),
          getOverdue?.() ?? Promise.resolve([] as unknown as { items: Task[] }),
          getToday?.() ?? Promise.resolve([] as unknown as { items: Task[] }),
          getUpcoming?.(7) ?? Promise.resolve([] as unknown as { items: Task[] }),
        ]);
        if (!mounted) return;
        const a = (Array.isArray(ov) ? ov : ov.items ?? []) as Task[];
        const b = (Array.isArray(tod) ? tod : tod.items ?? []) as Task[];
        const c = (Array.isArray(upc) ? upc : upc.items ?? []) as Task[];
        setTasks([...t.items, ...a, ...b, ...c].filter((item, idx, arr) => arr.findIndex(x => x.id === item.id) === idx) as Task[]);
        setProjects(p.items as Project[]);
        setSections([]);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [listTasks, listProjects, getOverdue, getToday, getUpcoming]);

  const statuses: readonly { readonly id: TaskStatus; readonly label: string; readonly tone: BadgeTone }[] = [
    { id: 'todo', label: 'To do', tone: 'default' },
    { id: 'in-progress', label: 'In progress', tone: 'primary' },
    { id: 'blocked', label: 'Blocked', tone: 'danger' },
    { id: 'done', label: 'Done', tone: 'success' },
  ];

  const columns = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      blocked: [],
      done: [],
      cancelled: [],
    };
    for (const t of tasks) {
      if (!map[t.status]) map[t.status] = [];
      map[t.status].push(t);
    }
    return map;
  }, [tasks]);

  return (
    <div className="shell-page shell-page--wide">
      <PageHeader
        variant="wide"
        icon={<IconTasks width={22} height={22} />}
        title="Tasks"
        subtitle={`${tasks.length} total tasks · ${tasks.filter((t) => t.status === 'done').length} completed`}
        actions={[
          {
            id: 'toggle-view',
            label: view === 'board' ? 'List view' : 'Board view',
            variant: 'ghost',
            onAction: () => setView((v) => (v === 'board' ? 'list' : 'board')),
          },
          {
            id: 'new-task',
            label: 'New task',
            variant: 'primary',
            icon: <IconPlus width={14} height={14} />,
            primary: true,
          },
        ]}
      />

      <div style={{ padding: '0 var(--space-6) var(--space-8)' }}>
        {loading ? (
          <PageLoader />
        ) : error ? (
          <ErrorState title="Failed to load tasks" error={error.message} />
        ) : tasks.length === 0 ? (
          <EmptyState
            size="lg"
            tone="default"
            icon={<IconTasks width={36} height={36} />}
            title="Capture what needs doing"
            description="Tasks are your shared, searchable action log. Create the first task and let Syntrophos help you plan and execute it."
            action={{ label: 'Create first task' }}
          />
        ) : view === 'board' ? (
          <div className="tasks-board">
            {statuses.map((s) => (
              <div key={s.id} className="tasks-board__col">
                <div className="tasks-board__col-head">
                  <Badge size="sm" tone={s.tone} dot>{s.label}</Badge>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>
                    {columns[s.id]?.length ?? 0}
                  </span>
                </div>
                <div className="tasks-board__col-body">
                  {(columns[s.id] ?? []).map((t) => (
                    <TaskCard key={t.id} task={t} projects={projects} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tasks-list">
            <table className="ui-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: 32 }} />
                  <th>Task</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Due</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => {
                  const p = projects.find((x) => x.id === t.projectId);
                  return (
                    <tr key={t.id}>
                      <td><PriorityDot priority={t.priority} /></td>
                      <td style={{ fontWeight: 600 }}>{t.title}</td>
                      <td>{p ? <Badge size="sm" tone="violet">{p.name}</Badge> : '—'}</td>
                      <td>
                        <Badge
                          size="sm"
                          tone={t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : 'default'}
                        >
                          {t.priority}
                        </Badge>
                      </td>
                      <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Badge size="sm" tone={t.status === 'done' ? 'success' : 'default'}>{t.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

type BadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'teal' | 'rose' | 'amber';

function PriorityDot({ priority }: { readonly priority: TaskPriority }) {
  const map: Record<TaskPriority, string> = {
    urgent: 'var(--color-danger-500)',
    high: 'var(--color-warning-500)',
    medium: 'var(--color-info-500)',
    low: 'var(--color-text-subtle)',
    'no-priority': 'var(--color-text-subtle)',
  };
  return (
    <span
      aria-label={`Priority: ${priority}`}
      style={{
        width: 8,
        height: 8,
        borderRadius: 'var(--radius-full)',
        background: map[priority] ?? 'var(--color-text-subtle)',
        flexShrink: 0,
        display: 'inline-block',
      }}
    />
  );
}

function TaskCard({ task, projects }: { readonly task: Task; readonly projects: Project[] }) {
  const project = projects.find((p) => p.id === task.projectId);
  const accentToneMap: BadgeTone[] = ['violet', 'primary', 'teal', 'amber', 'rose'];
  const tone = accentToneMap[(projects.indexOf(project ?? ({} as Project)) + 10) % accentToneMap.length] ?? 'default';
  return (
    <div
      style={{
        padding: 'var(--space-3) var(--space-4)',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
        <PriorityDot priority={task.priority} />
        <div style={{ minWidth: 0, flex: '1 1 auto', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.4 }}>
          {task.title}
        </div>
      </div>
      {task.description && (
        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {task.description}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {project ? (
          <Badge size="sm" tone={tone}>{project.name}</Badge>
        ) : <span />}
        {task.dueDate && (
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
