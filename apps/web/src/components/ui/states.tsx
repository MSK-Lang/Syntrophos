import type { HTMLAttributes, ReactNode } from 'react';
import {
  IconAlertCircle,
  IconCheckCircle,
  IconPlus,
  IconRefresh,
  IconSearch,
} from '@/lib/icons.jsx';
import { Button } from './primitives.js';

export function Spinner({ className = '', size = 20 }: { readonly className?: string; readonly size?: number }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`ui-spinner ${className}`.trim()}
      style={{ width: size, height: size }}
    />
  );
}

export type EmptyStateProps = {
  readonly title: string;
  readonly description?: string | undefined;
  readonly icon?: ReactNode | undefined;
  readonly action?: { readonly label: string; readonly onClick?: (() => void) | undefined; readonly href?: string | undefined } | undefined;
  readonly size?: ('sm' | 'md' | 'lg') | undefined;
  readonly tone?: ('default' | 'muted' | 'success') | undefined;
  readonly className?: string | undefined;
} & HTMLAttributes<HTMLDivElement>;

export function EmptyState({
  title,
  description,
  icon,
  action,
  size = 'md',
  tone = 'default',
  className = '',
  ...rest
}: EmptyStateProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={[
        'ui-empty',
        `ui-empty--${size}`,
        `ui-empty--${tone}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <div className="ui-empty__icon" aria-hidden="true">
        {icon ?? <IconSearch width={28} height={28} />}
      </div>
      <h3 className="ui-empty__title">{title}</h3>
      {description && <p className="ui-empty__desc">{description}</p>}
      {action && (
        <div className="ui-empty__action">
          {action.href ? (
            <a href={action.href} className="ui-btn ui-btn--primary ui-btn--md">
              {action.label}
            </a>
          ) : (
            <Button variant="primary" leftIcon={<IconPlus width={16} height={16} />} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function EmptySearch({ query = '', onClear }: { readonly query?: string; readonly onClear?: () => void }) {
  return (
    <EmptyState
      size="sm"
      tone="muted"
      icon={<IconSearch width={24} height={24} />}
      title={query ? `No results for "${query}"` : 'Nothing here yet'}
      description={
        query
          ? 'Try a different search term, fewer filters, or check your spelling.'
          : onClear
            ? 'Try searching your notes, tasks, and messages.'
            : 'Content you add will appear here.'
      }
      action={
        onClear
          ? { label: 'Clear search', onClick: onClear }
          : undefined
      }
    />
  );
}

export type ErrorStateProps = HTMLAttributes<HTMLDivElement> & {
  readonly title?: string;
  readonly error?: Error | string;
  readonly onRetry?: () => void;
  readonly size?: 'sm' | 'md' | 'lg';
};

export function ErrorState({
  title = 'Something went wrong',
  error,
  onRetry,
  size = 'md',
  className = '',
  ...rest
}: ErrorStateProps) {
  const message = typeof error === 'string' ? error : error?.message;
  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        'ui-empty',
        `ui-empty--${size}`,
        'ui-empty--error',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <div className="ui-empty__icon ui-empty__icon--error" aria-hidden="true">
        <IconAlertCircle width={28} height={28} />
      </div>
      <h3 className="ui-empty__title">{title}</h3>
      {message && <p className="ui-empty__desc">{message}</p>}
      {onRetry && (
        <div className="ui-empty__action">
          <Button
            variant="secondary"
            leftIcon={<IconRefresh width={16} height={16} />}
            onClick={onRetry}
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

export function SuccessState({
  title = 'Done',
  description,
  size = 'md',
  className = '',
}: {
  readonly title?: string;
  readonly description?: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}) {
  return (
    <div
      className={[
        'ui-empty',
        `ui-empty--${size}`,
        'ui-empty--success',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="ui-empty__icon ui-empty__icon--success" aria-hidden="true">
        <IconCheckCircle width={28} height={28} />
      </div>
      <h3 className="ui-empty__title">{title}</h3>
      {description && <p className="ui-empty__desc">{description}</p>}
    </div>
  );
}

export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
}: {
  readonly className?: string;
  readonly width?: number | string;
  readonly height?: number | string;
  readonly rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      className={[
        'ui-skeleton',
        `ui-skeleton--r-${rounded}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { readonly lines?: number; readonly className?: string }) {
  return (
    <div className={`ui-skeleton-text ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={
            i === lines - 1
              ? `${60 + Math.round(Math.random() * 20)}%`
              : i === 0
                ? '100%'
                : `${80 + Math.round(Math.random() * 20)}%`
          }
          rounded="sm"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { readonly className?: string }) {
  return (
    <div className={`ui-skeleton-card ${className}`.trim()} aria-hidden="true">
      <div className="inline-stack-sm mb-4">
        <Skeleton width={36} height={36} rounded="md" />
        <div className="flex-1 stack-sm">
          <Skeleton height={14} width="60%" rounded="sm" />
          <Skeleton height={12} width="30%" rounded="sm" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

import { SyntrophosLoading } from './SyntrophosLoading.js';

export function PageLoader({
  label = 'INITIALIZING SYSTEM',
  statusMessage = 'SYNCHRONIZING WORKSPACE NODES',
}: {
  readonly label?: string;
  readonly statusMessage?: string;
}) {
  return (
    <SyntrophosLoading
      variant="workspace"
      label={label}
      statusMessage={statusMessage}
    />
  );
}
