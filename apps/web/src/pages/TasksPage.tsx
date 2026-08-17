import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader.js';
import { Badge, Button, Input } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states.js';
import {
  IconPlus,
  IconTasks,
  IconSearch,
  IconBot,
  IconCalendar,
  IconCheckCircle,
  IconAlertCircle,
  IconX,
  IconSettings,
  IconCore,
  IconChevronDown,
} from '@/lib/icons.js';
import { useTasks } from '@/lib/services/index.js';
import type { Project, Task, TaskPriority, TaskStatus } from '@/lib/services/tasks.contract.js';

type BadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'teal' | 'rose' | 'amber';

export default function TasksPage() {
  const { listTasks, listProjects, createTask, updateTask, deleteTask } = useTasks();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<'board' | 'list'>('board');

  // Interactive filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'agent' | 'today' | 'overdue' | 'completed'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Selection & Modal states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [agentActiveTaskIds, setAgentActiveTaskIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAskSyntrophos, setNewAskSyntrophos] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tRes, pRes] = await Promise.all([
        listTasks({ pageSize: 100 }),
        listProjects({ pageSize: 20 }),
      ]);
      setTasks(tRes.items as Task[]);
      setProjects(pRes.items as Project[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Filter & Search computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (t.title ?? '').toLowerCase().includes(q);
        const matchesDesc = (t.description ?? '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Filter mode
      if (filterMode === 'agent') {
        return agentActiveTaskIds.includes(t.id);
      }
      if (filterMode === 'completed') {
        return t.status === 'done';
      }
      if (filterMode === 'today') {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      }
      if (filterMode === 'overdue') {
        if (!t.dueDate) return false;
        return new Date(t.dueDate).getTime() < Date.now() && t.status !== 'done';
      }

      return true;
    });
  }, [tasks, searchQuery, filterMode, agentActiveTaskIds]);

  const activeCount = tasks.filter((t) => t.status !== 'done').length;
  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const agentCount = agentActiveTaskIds.length;

  const statuses: readonly { readonly id: TaskStatus; readonly label: string; readonly tone: BadgeTone }[] = [
    { id: 'todo', label: 'TODO', tone: 'default' },
    { id: 'in-progress', label: 'IN PROGRESS', tone: 'primary' },
    { id: 'blocked', label: 'BLOCKED', tone: 'danger' },
    { id: 'done', label: 'DONE', tone: 'success' },
  ];

  const columns = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      blocked: [],
      done: [],
      cancelled: [],
    };
    for (const t of filteredTasks) {
      if (!map[t.status]) map[t.status] = [];
      map[t.status].push(t);
    }
    return map;
  }, [filteredTasks]);

  const handleToggleComplete = async (task: Task, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      setTasks((cur) => cur.map((x) => (x.id === task.id ? { ...x, status: nextStatus } : x)));
      if (selectedTask?.id === task.id) {
        setSelectedTask((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
      await updateTask?.(task.id, { status: nextStatus });
    } catch {
      void loadData();
    }
  };

  const handleAskSyntrophos = (taskId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!agentActiveTaskIds.includes(taskId)) {
      setAgentActiveTaskIds((prev) => [...prev, taskId]);
    }
    setTasks((cur) =>
      cur.map((x) => (x.id === taskId ? { ...x, status: 'in-progress' } : x))
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: 'in-progress' } : null));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const draft: Record<string, unknown> = {
        title: newTitle.trim(),
        priority: newPriority,
        status: 'todo',
      };
      if (newProjectId) draft.projectId = newProjectId;
      if (newDueDate) draft.dueDate = newDueDate;

      const created = await createTask?.(draft as never);
      if (created) {
        setTasks((prev) => [created, ...prev]);
        if (newAskSyntrophos) {
          handleAskSyntrophos(created.id);
        }
      }
      setNewTitle('');
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setTasks((cur) => cur.filter((x) => x.id !== taskId));
      if (selectedTask?.id === taskId) setSelectedTask(null);
      await deleteTask?.(taskId);
    } catch {
      void loadData();
    }
  };

  return (
    <div className="shell-page shell-page--wide" style={{ background: '#000000', color: '#ffcc66', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <PageHeader
        variant="wide"
        icon={<IconTasks width={22} height={22} />}
        title="TASKS // EXECUTION WORKSPACE"
        subtitle={`${activeCount} ACTIVE · ${completedCount} COMPLETED · ${agentCount} AGENT MANAGED`}
        actions={[
          {
            id: 'toggle-view',
            label: view === 'board' ? '☰ LIST VIEW' : '▦ BOARD VIEW',
            variant: 'ghost',
            onAction: () => setView((v) => (v === 'board' ? 'list' : 'board')),
          },
          {
            id: 'new-task',
            label: '+ NEW TASK',
            variant: 'primary',
            icon: <IconPlus width={14} height={14} />,
            onAction: () => setIsCreateModalOpen(true),
            primary: true,
          },
        ]}
      />

      {/* Operational Toolbar: Search & Preset Filters */}
      <div style={{ padding: '0 24px 20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottom: '1px solid rgba(255, 170, 48, 0.15)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 auto', maxWidth: 460 }}>
          <Input
            placeholder="Search tasks or projects… (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leading={<IconSearch width={14} height={14} />}
            style={{ background: 'rgba(20, 10, 2, 0.7)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66', fontSize: 13, fontFamily: 'monospace' }}
          />
        </div>

        {/* Preset Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {(['all', 'agent', 'today', 'overdue', 'completed'] as const).map((mode) => {
            const isActive = filterMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
                style={{
                  background: isActive ? '#ffaa30' : 'rgba(255, 170, 48, 0.1)',
                  color: isActive ? '#000000' : '#d99a4e',
                  border: '1px solid rgba(255, 170, 48, 0.3)',
                  borderRadius: 4,
                  padding: '4px 10px',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 120ms ease',
                }}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div style={{ padding: '24px', flex: '1 1 auto' }}>
        {loading ? (
          <PageLoader label="LOADING TASK WORKSPACE…" />
        ) : error ? (
          <ErrorState title="FAILED TO LOAD TASKS" error={error.message} />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            size="lg"
            tone="default"
            icon={<IconTasks width={36} height={36} />}
            title="No tasks match criteria"
            description="Clear your filter parameters or create a new task to populate the execution pipeline."
            action={{ label: 'Create new task', onClick: () => setIsCreateModalOpen(true) }}
          />
        ) : view === 'board' ? (
          /* Kanban Board View */
          <div className="tasks-workspace-grid">
            {statuses.map((s) => {
              const colTasks = columns[s.id] ?? [];
              return (
                <div key={s.id} className="tasks-column-container">
                  {/* Column Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid rgba(255, 170, 48, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                      <Badge size="sm" tone={s.tone} dot>{s.label}</Badge>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#885522', background: 'rgba(255, 170, 48, 0.1)', padding: '2px 6px', borderRadius: 4 }}>
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Column Body / Cards List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: '1 1 auto' }}>
                    {colTasks.length === 0 ? (
                      <div style={{ border: '1px dashed rgba(255, 170, 48, 0.2)', borderRadius: 6, padding: '20px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#885522', fontFamily: 'monospace', marginBottom: 8 }}>
                          No tasks here
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsCreateModalOpen(true)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ffaa30',
                            fontSize: 10,
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                          }}
                        >
                          [ + Add task ]
                        </button>
                      </div>
                    ) : (
                      colTasks.map((t) => (
                        <TaskCardRow
                          key={t.id}
                          task={t}
                          projects={projects}
                          isAgentActive={agentActiveTaskIds.includes(t.id)}
                          onSelect={() => setSelectedTask(t)}
                          onToggleComplete={(e) => void handleToggleComplete(t, e)}
                          onAskSyntrophos={(e) => handleAskSyntrophos(t.id, e)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table List View */
          <div style={{ background: 'rgba(12, 6, 1, 0.85)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, overflow: 'hidden' }}>
            <table className="ui-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12, fontFamily: 'monospace' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 170, 48, 0.1)', color: '#ffaa30', borderBottom: '1px solid rgba(255, 170, 48, 0.25)' }}>
                  <th style={{ padding: '10px 14px', width: 32 }} />
                  <th style={{ padding: '10px 14px' }}>TASK TITLE</th>
                  <th style={{ padding: '10px 14px' }}>PROJECT</th>
                  <th style={{ padding: '10px 14px' }}>PRIORITY</th>
                  <th style={{ padding: '10px 14px' }}>DUE DATE</th>
                  <th style={{ padding: '10px 14px' }}>AGENT STATE</th>
                  <th style={{ padding: '10px 14px' }}>STATUS</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => {
                  const project = projects.find((p) => p.id === t.projectId);
                  const isAgentActive = agentActiveTaskIds.includes(t.id);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      style={{ borderBottom: '1px solid rgba(255, 170, 48, 0.1)', cursor: 'pointer' }}
                    >
                      <td style={{ padding: '12px 14px' }}><PriorityDot priority={t.priority} /></td>
                      <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#ffcc66' }}>{t.title}</td>
                      <td style={{ padding: '12px 14px', color: '#885522' }}>{project ? project.name.toUpperCase() : 'GENERAL'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <Badge size="sm" tone={t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : 'default'}>
                          {t.priority}
                        </Badge>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#885522' }}>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {isAgentActive ? (
                          <span style={{ color: '#ffaa30', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span className="island-pulse-orb" style={{ width: 5, height: 5 }} />
                            <span>RUNNING</span>
                          </span>
                        ) : (
                          <span style={{ color: '#885522' }}>MANUAL</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <Badge size="sm" tone={t.status === 'done' ? 'success' : 'default'}>{t.status}</Badge>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => void handleToggleComplete(t, e)}
                          style={{
                            background: 'rgba(255, 170, 48, 0.1)',
                            border: '1px solid rgba(255, 170, 48, 0.3)',
                            borderRadius: 4,
                            color: '#d99a4e',
                            fontSize: 10,
                            padding: '3px 8px',
                            cursor: 'pointer',
                          }}
                        >
                          {t.status === 'done' ? 'REOPEN' : 'COMPLETE'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contextual Task Detail Drawer */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          project={projects.find((p) => p.id === selectedTask.projectId)}
          isAgentActive={agentActiveTaskIds.includes(selectedTask.id)}
          onClose={() => setSelectedTask(null)}
          onToggleComplete={() => void handleToggleComplete(selectedTask)}
          onAskSyntrophos={() => handleAskSyntrophos(selectedTask.id)}
          onDelete={() => void handleDeleteTask(selectedTask.id)}
        />
      )}

      {/* New Task Modal */}
      {isCreateModalOpen && (
        <CreateTaskModal
          projects={projects}
          title={newTitle}
          setTitle={setNewTitle}
          projectId={newProjectId}
          setProjectId={setNewProjectId}
          priority={newPriority}
          setPriority={setNewPriority}
          dueDate={newDueDate}
          setDueDate={setNewDueDate}
          askSyntrophos={newAskSyntrophos}
          setAskSyntrophos={setNewAskSyntrophos}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}
    </div>
  );
}

function PriorityDot({ priority }: { readonly priority: TaskPriority }) {
  const map: Record<TaskPriority, string> = {
    urgent: '#ff5533',
    high: '#ffaa30',
    medium: '#34d399',
    low: '#885522',
    'no-priority': '#885522',
  };
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: map[priority] ?? '#885522',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}

function TaskCardRow({
  task,
  projects,
  isAgentActive,
  onSelect,
  onToggleComplete,
  onAskSyntrophos,
}: {
  readonly task: Task;
  readonly projects: Project[];
  readonly isAgentActive: boolean;
  readonly onSelect: () => void;
  readonly onToggleComplete: (e: React.MouseEvent) => void;
  readonly onAskSyntrophos: (e: React.MouseEvent) => void;
}) {
  const project = projects.find((p) => p.id === task.projectId);

  return (
    <div className="tasks-card-item" onClick={onSelect}>
      {/* Title & Priority Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '1 1 auto' }}>
          <PriorityDot priority={task.priority} />
          <div style={{ fontSize: 13, fontWeight: 'bold', color: task.status === 'done' ? '#885522' : '#ffcc66', textDecoration: task.status === 'done' ? 'line-through' : 'none', lineHeight: 1.3 }}>
            {task.title}
          </div>
        </div>
      </div>

      {/* Description Preview */}
      {task.description && (
        <div style={{ fontSize: 11, color: '#885522', fontFamily: 'monospace', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {task.description}
        </div>
      )}

      {/* Agent Activity Badge */}
      {isAgentActive && (
        <div style={{ background: 'rgba(255, 170, 48, 0.12)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'monospace', color: '#ffaa30' }}>
          <span className="island-pulse-orb" style={{ width: 5, height: 5 }} />
          <span>● AGENT RUNNING · Planner Agent</span>
        </div>
      )}

      {/* Footer Tags & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid rgba(255, 170, 48, 0.1)', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {project ? (
            <Badge size="sm" tone="violet">{project.name}</Badge>
          ) : (
            <Badge size="sm" tone="default">GENERAL</Badge>
          )}
          {task.dueDate && (
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#885522' }}>
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {!isAgentActive && task.status !== 'done' && (
            <button
              type="button"
              onClick={onAskSyntrophos}
              title="Ask Syntrophos to handle this task"
              style={{
                background: 'rgba(255, 170, 48, 0.15)',
                border: '1px solid rgba(255, 170, 48, 0.35)',
                borderRadius: 4,
                color: '#ffcc66',
                fontFamily: 'monospace',
                fontSize: 9,
                padding: '2px 6px',
                cursor: 'pointer',
              }}
            >
              [ ASK SYNTROPHOS ]
            </button>
          )}
          <button
            type="button"
            onClick={onToggleComplete}
            style={{
              background: task.status === 'done' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 170, 48, 0.1)',
              border: '1px solid rgba(255, 170, 48, 0.25)',
              borderRadius: 4,
              color: task.status === 'done' ? '#34d399' : '#d99a4e',
              fontFamily: 'monospace',
              fontSize: 9,
              padding: '2px 6px',
              cursor: 'pointer',
            }}
          >
            {task.status === 'done' ? '✓ DONE' : 'COMPLETE'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskDetailDrawer({
  task,
  project,
  isAgentActive,
  onClose,
  onToggleComplete,
  onAskSyntrophos,
  onDelete,
}: {
  readonly task: Task;
  readonly project?: Project | undefined;
  readonly isAgentActive: boolean;
  readonly onClose: () => void;
  readonly onToggleComplete: () => void;
  readonly onAskSyntrophos: () => void;
  readonly onDelete: () => void;
}) {
  return (
    <div className="task-detail-drawer" style={{ color: '#ffcc66', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ffaa30', fontWeight: 'bold' }}>
          <IconTasks width={14} height={14} />
          <span>TASK DETAIL // {task.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}
        >
          <IconX width={16} height={16} />
        </button>
      </div>

      {/* Body Content */}
      <div style={{ padding: '20px', flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Title */}
        <div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66', lineHeight: 1.4 }}>
            {task.title}
          </div>
          {task.description && (
            <div style={{ fontSize: 12, color: '#885522', marginTop: 8, lineHeight: 1.5 }}>
              {task.description}
            </div>
          )}
        </div>

        {/* Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'rgba(20, 10, 2, 0.6)', padding: '12px 14px', borderRadius: 6, border: '1px solid rgba(255, 170, 48, 0.2)', fontSize: 11 }}>
          <div>
            <div style={{ color: '#885522', fontSize: 10 }}>PROJECT</div>
            <div style={{ color: '#ffcc66', fontWeight: 'bold', marginTop: 2 }}>{project ? project.name : 'General'}</div>
          </div>
          <div>
            <div style={{ color: '#885522', fontSize: 10 }}>PRIORITY</div>
            <div style={{ color: '#ffcc66', fontWeight: 'bold', marginTop: 2, textTransform: 'uppercase' }}>{task.priority}</div>
          </div>
          <div>
            <div style={{ color: '#885522', fontSize: 10 }}>DUE DATE</div>
            <div style={{ color: '#ffcc66', fontWeight: 'bold', marginTop: 2 }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</div>
          </div>
          <div>
            <div style={{ color: '#885522', fontSize: 10 }}>STATUS</div>
            <div style={{ color: task.status === 'done' ? '#34d399' : '#ffaa30', fontWeight: 'bold', marginTop: 2, textTransform: 'uppercase' }}>{task.status}</div>
          </div>
        </div>

        {/* AI Activity Log Trace */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', color: '#ffaa30', fontWeight: 'bold', marginBottom: 10 }}>
            ACTIVITY &amp; EXECUTION TRACE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, background: 'rgba(14, 7, 1, 0.8)', padding: '12px 14px', borderRadius: 6, border: '1px solid rgba(255, 170, 48, 0.2)' }}>
            <div style={{ color: '#34d399' }}>✓ Task initialized in pipeline</div>
            {isAgentActive && (
              <>
                <div style={{ color: '#34d399' }}>✓ Syntrophos assigned to handle task</div>
                <div style={{ color: '#ffaa30', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="island-pulse-orb" style={{ width: 5, height: 5 }} />
                  <span>● Planning milestones &amp; dependency tree</span>
                </div>
              </>
            )}
            {task.status === 'done' && (
              <div style={{ color: '#34d399' }}>✓ Marked as completed</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(14, 7, 1, 0.95)' }}>
        {!isAgentActive && task.status !== 'done' && (
          <button
            type="button"
            onClick={onAskSyntrophos}
            style={{
              background: '#ffaa30',
              color: '#000000',
              border: 'none',
              borderRadius: 4,
              padding: '8px 14px',
              fontSize: 11,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <IconBot width={14} height={14} /> [ ASK SYNTROPHOS TO HANDLE ]
          </button>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onToggleComplete}
            style={{
              flex: 1,
              background: 'rgba(255, 170, 48, 0.12)',
              border: '1px solid rgba(255, 170, 48, 0.3)',
              borderRadius: 4,
              color: '#ffcc66',
              padding: '6px 12px',
              fontSize: 11,
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            {task.status === 'done' ? 'REOPEN TASK' : 'MARK COMPLETE'}
          </button>
          <button
            type="button"
            onClick={onDelete}
            style={{
              background: 'rgba(255, 85, 51, 0.15)',
              border: '1px solid rgba(255, 85, 51, 0.3)',
              borderRadius: 4,
              color: '#ff5533',
              padding: '6px 12px',
              fontSize: 11,
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateTaskModal({
  projects,
  title,
  setTitle,
  projectId,
  setProjectId,
  priority,
  setPriority,
  dueDate,
  setDueDate,
  askSyntrophos,
  setAskSyntrophos,
  onClose,
  onSubmit,
}: {
  readonly projects: Project[];
  readonly title: string;
  readonly setTitle: (v: string) => void;
  readonly projectId: string;
  readonly setProjectId: (v: string) => void;
  readonly priority: TaskPriority;
  readonly setPriority: (v: TaskPriority) => void;
  readonly dueDate: string;
  readonly setDueDate: (v: string) => void;
  readonly askSyntrophos: boolean;
  readonly setAskSyntrophos: (v: boolean) => void;
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
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconPlus width={14} height={14} />
            <span>NEW TASK DIRECTIVE</span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
            <IconX width={16} height={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'monospace' }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>TASK TITLE *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Break down Q3 goals into milestones"
              required
              autoFocus
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>PROJECT</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
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
                <option value="">General</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>PRIORITY</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
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
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>DUE DATE</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          {/* Ask Syntrophos Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ffaa30', cursor: 'pointer', background: 'rgba(255, 170, 48, 0.1)', padding: '8px 12px', borderRadius: 4, border: '1px solid rgba(255, 170, 48, 0.25)' }}>
            <input
              type="checkbox"
              checked={askSyntrophos}
              onChange={(e) => setAskSyntrophos(e.target.checked)}
              style={{ accentColor: '#ffaa30' }}
            />
            <span>Ask Syntrophos to handle this task autonomously</span>
          </label>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              [ CREATE TASK ]
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
