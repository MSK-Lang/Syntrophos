import type { ReactNode } from 'react';
import type { ButtonProps } from '@/components/ui/primitives.js';

export type PageHeaderAction = {
  readonly id: string;
  readonly label: string;
  readonly variant?: ButtonProps['variant'];
  readonly size?: ButtonProps['size'];
  readonly icon?: ReactNode;
  readonly onAction?: () => void;
  readonly to?: string;
  readonly primary?: boolean;
};

export type PageHeaderProps = {
  readonly title: string;
  readonly subtitle?: string;
  readonly icon?: ReactNode;
  readonly breadcrumbs?: readonly { readonly label: string; readonly to?: string }[];
  readonly actions?: readonly PageHeaderAction[];
  readonly tone?: 'default' | 'primary' | 'violet' | 'teal' | 'amber' | 'rose';
  readonly variant?: 'narrow' | 'wide' | 'flush';
};

export function PageHeader({ title, subtitle, icon, actions, variant = 'narrow' }: PageHeaderProps) {
  const variantClass = variant === 'flush' ? 'shell-page--flush' : variant === 'wide' ? 'shell-page--wide' : '';
  return (
    <div className={`shell-page ${variantClass}`}>
      <div className="shell-page__header">
        <div className="inline-stack" style={{ alignItems: 'flex-start' }}>
          {icon && (
            <div
              aria-hidden="true"
              style={{
                width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-violet))',
                color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: 'var(--shadow-sm)',
              }}
            >
              {icon}
            </div>
          )}
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <h1 className="shell-page__title">{title}</h1>
            {subtitle && <div className="shell-page__subtitle">{subtitle}</div>}
          </div>
        </div>
        {actions && actions.length > 0 && (
          <div className="inline-stack" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {actions.map((action) => (
              <ActionButton key={action.id} {...action} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ label, variant = 'secondary', size = 'md', icon, to, onAction, primary = false }: PageHeaderAction) {
  const v = primary ? 'primary' : variant;
  const cls = `ui-btn ui-btn--${v} ui-btn--${size}`;
  const content = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      {icon}
      <span>{label}</span>
    </span>
  );
  if (to) {
    return (
      <a href={to} className={cls} style={{ textDecoration: 'none' }}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={onAction}>
      {content}
    </button>
  );
}
