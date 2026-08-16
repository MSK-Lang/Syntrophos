import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/primitives.js';
import { EmptyState } from '@/components/ui/states.js';
import { IconDashboard } from '@/lib/icons.jsx';

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 'var(--space-8)' }}>
      <EmptyState
        size="lg"
        tone="default"
        icon={<IconDashboard width={36} height={36} />}
        title="404 — Lost in memory"
        description="This page wasn't found in your workspace. It may have moved, been renamed, or perhaps never existed."
        action={{
          label: 'Return to Dashboard',
          onClick: () => { window.location.href = '/'; },
        }}
      />
      <Link to="/" style={{ marginTop: 'var(--space-4)', textDecoration: 'none' }}>
        <Button variant="primary" size="md"><IconDashboard width={16} height={16} /> Dashboard</Button>
      </Link>
    </div>
  );
}
