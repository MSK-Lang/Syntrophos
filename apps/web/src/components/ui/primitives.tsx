import type { HTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export type ButtonProps = {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
  readonly leftIcon?: ReactNode;
  readonly rightIcon?: ReactNode;
  readonly children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = '',
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    fullWidth ? 'ui-btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="ui-btn__spinner" aria-hidden="true" />
      ) : (
        leftIcon && <span className="ui-btn__icon">{leftIcon}</span>
      )}
      {children !== undefined && <span className="ui-btn__label">{children}</span>}
      {!loading && rightIcon && <span className="ui-btn__icon">{rightIcon}</span>}
    </button>
  );
});

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  readonly tone?: 'default' | 'muted' | 'bordered' | 'primary';
  readonly padding?: 'none' | 'sm' | 'md' | 'lg';
  readonly clickable?: boolean;
};

export function Card({
  tone = 'default',
  padding = 'md',
  clickable = false,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={[
        'ui-card',
        `ui-card--${tone}`,
        `ui-card--p-${padding}`,
        clickable ? 'ui-card--clickable' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
}

export function CardHeader({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ui-card__header ${className}`.trim()} {...rest} />;
}
export function CardBody({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ui-card__body ${className}`.trim()} {...rest} />;
}
export function CardFooter({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ui-card__footer ${className}`.trim()} {...rest} />;
}
export function CardTitle({ className = '', ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`ui-card__title ${className}`.trim()} {...rest} />;
}
export function CardDescription({ className = '', ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`ui-card__desc ${className}`.trim()} {...rest} />;
}

export type BadgeTone =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'violet'
  | 'teal'
  | 'amber'
  | 'rose';
export type BadgeSize = 'sm' | 'md';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  readonly tone?: BadgeTone;
  readonly size?: BadgeSize;
  readonly dot?: boolean;
};

export function Badge({
  tone = 'default',
  size = 'sm',
  dot = false,
  className = '',
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={[
        'ui-badge',
        `ui-badge--${tone}`,
        `ui-badge--${size}`,
        dot ? 'ui-badge--dot' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {dot && <span className="ui-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export type SeparatorProps = HTMLAttributes<HTMLHRElement> & {
  readonly orientation?: 'horizontal' | 'vertical';
};

export function Separator({
  orientation = 'horizontal',
  className = '',
  role = 'separator',
  ...rest
}: SeparatorProps) {
  return (
    <hr
      role={role}
      aria-orientation={orientation}
      className={[
        'ui-sep',
        orientation === 'vertical' ? 'ui-sep--vertical' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
}

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  readonly name?: string;
  readonly src?: string;
  readonly fallback?: string;
  readonly tone?: BadgeTone;
  readonly icon?: ReactNode;
};

export function Avatar({
  size = 'md',
  name,
  src,
  fallback,
  tone = 'primary',
  icon,
  className = '',
  ...rest
}: AvatarProps) {
  const initials = (fallback ?? name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  return (
    <div
      data-tone={tone}
      className={[
        'ui-avatar',
        `ui-avatar--${size}`,
        src ? '' : 'ui-avatar--fallback',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="img"
      aria-label={name ?? fallback ?? 'Avatar'}
      {...rest}
    >
      {src ? (
        <img src={src} alt={name ?? 'avatar'} loading="lazy" />
      ) : icon ? (
        icon
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export type AvatarGroupProps = HTMLAttributes<HTMLDivElement> & {
  readonly max?: number;
  readonly size?: AvatarProps['size'];
};

export function AvatarGroup({
  max = 4,
  size = 'sm',
  className = '',
  children,
  ...rest
}: AvatarGroupProps) {
  const items = Array.isArray(children) ? children : [children].filter(Boolean);
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;
  return (
    <div className={`ui-avatar-group ${className}`.trim()} {...rest}>
      {visible.map((child, i) => (
        <div key={i} style={{ zIndex: 100 - i }}>
          {child}
        </div>
      ))}
      {overflow > 0 && (
        <Avatar size={size} tone="default" fallback={`+${overflow}`} data-tone="default" />
      )}
    </div>
  );
}

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  readonly required?: boolean | undefined;
  readonly htmlFor: string;
};

export function Label({ required, className = '', children, ...rest }: LabelProps) {
  return (
    <label className={`ui-label ${className}`.trim()} {...rest}>
      {children}
      {required && <span className="ui-label__req" aria-hidden="true"> *</span>}
    </label>
  );
}

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
  readonly invalid?: boolean;
  readonly inputSize?: 'sm' | 'md' | 'lg';
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leading, trailing, invalid, inputSize = 'md', className = '', id, ...rest },
  ref,
) {
  return (
    <div
      data-invalid={invalid || undefined}
      className={['ui-input-wrap', `ui-input-wrap--${inputSize}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {leading && <span className="ui-input-wrap__lead">{leading}</span>}
      <input ref={ref} id={id} aria-invalid={invalid || undefined} {...rest} />
      {trailing && <span className="ui-input-wrap__trail">{trailing}</span>}
    </div>
  );
});

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  readonly invalid?: boolean;
  readonly inputSize?: 'sm' | 'md' | 'lg';
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, inputSize = 'md', className = '', ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      className={['ui-textarea', `ui-textarea--${inputSize}`, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
});

export type FieldProps = HTMLAttributes<HTMLDivElement> & {
  readonly label?: string | undefined;
  readonly htmlFor?: string | undefined;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly required?: boolean | undefined;
};

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className = '',
  children,
  ...rest
}: FieldProps) {
  return (
    <div className={`ui-field ${className}`.trim()} {...rest}>
      {label && htmlFor && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error ? (
        <p role="alert" className="ui-field__error">
          {error}
        </p>
      ) : hint ? (
        <p className="ui-field__hint">{hint}</p>
      ) : null}
    </div>
  );
}

export type ToggleProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  readonly label: ReactNode;
  readonly description?: ReactNode;
};

export function Toggle({ label, description, className = '', id, checked, ...rest }: ToggleProps) {
  const autoId = id ?? `toggle-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={`ui-toggle ${className}`.trim()}>
      <label className="ui-toggle__switch" htmlFor={autoId}>
        <input id={autoId} type="checkbox" role="switch" checked={checked} {...rest} />
        <span className="ui-toggle__track" aria-hidden="true">
          <span className="ui-toggle__thumb" />
        </span>
      </label>
      <div className="ui-toggle__content">
        <label htmlFor={autoId} className="ui-toggle__label">
          {label}
        </label>
        {description && <p className="ui-toggle__desc">{description}</p>}
      </div>
    </div>
  );
}

export type ProgressProps = HTMLAttributes<HTMLDivElement> & {
  readonly value: number;
  readonly max?: number;
  readonly tone?: BadgeTone;
  readonly showLabel?: boolean;
};

export function Progress({
  value,
  max = 100,
  tone = 'primary',
  showLabel = false,
  className = '',
  ...rest
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={`ui-progress ${className}`.trim()}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      {...rest}
    >
      <div className={`ui-progress__track ui-progress--${tone}`}>
        <div className="ui-progress__fill" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="ui-progress__label">{Math.round(pct)}%</span>}
    </div>
  );
}
