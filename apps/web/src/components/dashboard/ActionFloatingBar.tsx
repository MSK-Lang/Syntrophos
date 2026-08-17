import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconCore, IconTasks, IconBot, IconNotes, IconChat } from '@/lib/icons.js';

export type ActionFloatingBarProps = {
  readonly onQuickTask?: () => void;
  readonly onQuickNote?: () => void;
  readonly onQuickAgent?: () => void;
};

export function ActionFloatingBar({
  onQuickTask,
  onQuickNote,
  onQuickAgent,
}: ActionFloatingBarProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '1') {
          e.preventDefault();
          navigate('/core');
        } else if (e.key === '2') {
          e.preventDefault();
          onQuickTask?.();
        } else if (e.key === '3') {
          e.preventDefault();
          onQuickAgent?.();
        } else if (e.key === '4') {
          e.preventDefault();
          onQuickNote?.();
        } else if (e.key === '5') {
          e.preventDefault();
          navigate('/chat');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onQuickTask, onQuickAgent, onQuickNote]);

  return (
    <div className="floating-action-bar" role="toolbar" aria-label="AI Operating Command Dock">
      <Link to="/core" className="action-bar-btn" title="Enter Core (⌘1)">
        <span style={{ color: '#ffaa30', display: 'inline-flex', alignItems: 'center' }}>
          <IconCore width={13} height={13} />
        </span>
        <span>CORE</span>
        <span style={{ fontSize: 9, color: '#885522', marginLeft: 2 }}>⌘1</span>
      </Link>

      <div style={{ width: 1, height: 16, background: 'rgba(255, 170, 48, 0.2)' }} />

      <button type="button" onClick={onQuickTask} className="action-bar-btn" title="Create Deliverable Task (⌘2)">
        <span style={{ color: '#ffaa30', display: 'inline-flex', alignItems: 'center' }}>
          <IconTasks width={13} height={13} />
        </span>
        <span>NEW TASK</span>
        <span style={{ fontSize: 9, color: '#885522', marginLeft: 2 }}>⌘2</span>
      </button>

      <button type="button" onClick={onQuickAgent} className="action-bar-btn" title="Deploy Autonomous Agent (⌘3)">
        <span style={{ color: '#ffaa30', display: 'inline-flex', alignItems: 'center' }}>
          <IconBot width={13} height={13} />
        </span>
        <span>RUN AGENT</span>
        <span style={{ fontSize: 9, color: '#885522', marginLeft: 2 }}>⌘3</span>
      </button>

      <button type="button" onClick={onQuickNote} className="action-bar-btn" title="Capture Knowledge Note (⌘4)">
        <span style={{ color: '#ffaa30', display: 'inline-flex', alignItems: 'center' }}>
          <IconNotes width={13} height={13} />
        </span>
        <span>NEW NOTE</span>
        <span style={{ fontSize: 9, color: '#885522', marginLeft: 2 }}>⌘4</span>
      </button>

      <Link to="/chat" className="action-bar-btn" title="Open Neural Chat (⌘5)">
        <span style={{ color: '#ffaa30', display: 'inline-flex', alignItems: 'center' }}>
          <IconChat width={13} height={13} />
        </span>
        <span>NEURAL CHAT</span>
        <span style={{ fontSize: 9, color: '#885522', marginLeft: 2 }}>⌘5</span>
      </Link>
    </div>
  );
}
