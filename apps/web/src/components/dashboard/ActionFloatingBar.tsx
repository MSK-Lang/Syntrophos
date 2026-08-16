import { Link } from 'react-router-dom';

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
  return (
    <div className="floating-action-bar">
      <Link to="/core" className="action-bar-btn" title="Enter Full-Screen Core">
        <span style={{ color: '#ffaa30' }}>◈</span>
        <span>CORE</span>
      </Link>

      <div style={{ width: 1, height: 16, background: 'rgba(255, 170, 48, 0.2)' }} />

      <button type="button" onClick={onQuickTask} className="action-bar-btn" title="Create Deliverable Task">
        <span>✓</span>
        <span>NEW TASK</span>
      </button>

      <button type="button" onClick={onQuickAgent} className="action-bar-btn" title="Deploy Autonomous Agent">
        <span>⚡</span>
        <span>RUN AGENT</span>
      </button>

      <button type="button" onClick={onQuickNote} className="action-bar-btn" title="Capture Knowledge Note">
        <span>□</span>
        <span>NEW NOTE</span>
      </button>

      <Link to="/chat" className="action-bar-btn" title="Open Neural Chat">
        <span>◇</span>
        <span>NEURAL CHAT</span>
      </Link>
    </div>
  );
}
