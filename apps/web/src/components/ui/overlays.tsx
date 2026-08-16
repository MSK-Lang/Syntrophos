import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type AriaAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { IconX } from '@/lib/icons.jsx';
import { Button } from './primitives.js';

/* ─────────────────────────────────────────────────────────────────────────────
 *  DIALOG (MODAL)
 * ──────────────────────────────────────────────────────────────────────────── */

type DialogContextValue = {
  readonly open: boolean;
  readonly titleId: string;
  readonly descriptionId: string;
  readonly setOpen: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export type DialogProps = {
  readonly open: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly children: ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const setOpen = useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  const value = useMemo<DialogContextValue>(
    () => ({ open, titleId, descriptionId, setOpen }),
    [open, titleId, descriptionId, setOpen],
  );
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('Dialog components must be used within <Dialog>.');
  return ctx;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(el: HTMLElement, event: globalThis.KeyboardEvent) {
  if (event.key !== 'Tab') return;
  const focusable = [...el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (n) => n.offsetParent !== null,
  );
  if (focusable.length === 0) return;
  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function DialogContent({
  className = '',
  role = 'dialog',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen, titleId, descriptionId } = useDialogContext();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    lastFocus.current = prev;
    const panel = panelRef.current;
    if (panel) {
      requestAnimationFrame(() => {
        const toFocus = panel.querySelector<HTMLElement>(
          '[data-autofocus], button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
        );
        (toFocus ?? panel).focus();
      });
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
      if (panel) trapFocus(panel, e);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (lastFocus.current && 'focus' in lastFocus.current) lastFocus.current.focus();
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      className="ui-dialog__backdrop"
      onMouseDown={(e: MouseEvent) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      aria-hidden="true"
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={`ui-dialog ${className}`.trim()}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`ui-dialog__header ${className}`.trim()} {...rest}>
      {children}
      <DialogClose className="ui-dialog__close" />
    </div>
  );
}

export function DialogTitle({ className = '', ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDialogContext();
  return <h2 id={titleId} className={`ui-dialog__title ${className}`.trim()} {...rest} />;
}

export function DialogDescription({ className = '', ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useDialogContext();
  return <p id={descriptionId} className={`ui-dialog__desc ${className}`.trim()} {...rest} />;
}

export function DialogBody({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ui-dialog__body ${className}`.trim()} {...rest} />;
}

export function DialogFooter({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ui-dialog__footer ${className}`.trim()} {...rest} />;
}

export function DialogClose({
  className = '',
  children,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDialogContext();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Close dialog"
      className={`ui-dialog__closebtn ${className}`.trim()}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...rest}
    >
      {children ?? <IconX width={16} height={16} />}
    </Button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  DROPDOWN MENU
 * ──────────────────────────────────────────────────────────────────────────── */

type DropdownContextValue = {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly triggerId: string;
  readonly menuId: string;
  readonly activeIndex: number;
  readonly setActiveIndex: (i: number) => void;
  readonly itemsRef: React.MutableRefObject<Array<HTMLButtonElement | null>>;
  readonly onSelect?: (() => void) | undefined;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

export type DropdownProps = {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onSelect?: () => void;
  readonly align?: 'start' | 'end';
  readonly children: ReactNode;
};

export function Dropdown({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  align = 'start',
  children,
}: DropdownProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen! : uncontrolled;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );
  const triggerId = useId();
  const menuId = useId();
  const [activeIndex, setActiveIndex] = useState(-1);
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const value = useMemo<DropdownContextValue>(
    () => ({ open, setOpen, triggerId, menuId, activeIndex, setActiveIndex, itemsRef, onSelect }),
    [open, setOpen, triggerId, menuId, activeIndex, onSelect],
  );
  return (
    <DropdownContext.Provider value={value}>
      <div className={`ui-dropdown ui-dropdown--${align}`}>{children}</div>
    </DropdownContext.Provider>
  );
}

function useDropdown(): DropdownContextValue {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('Dropdown components must be used within <Dropdown>.');
  return ctx;
}

export function DropdownTrigger({
  asChild,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { readonly asChild?: boolean }) {
  const { open, setOpen, triggerId, menuId } = useDropdown();
  if (asChild && !Array.isArray(children) && typeof children === 'object' && children !== null && 'type' in children) {
    return children as ReactNode;
  }
  return (
    <button
      type="button"
      id={triggerId}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      onClick={() => setOpen(!open)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function DropdownContent({ className = '', children }: { readonly className?: string; readonly children: ReactNode }) {
  const { open, setOpen, menuId, triggerId, setActiveIndex, itemsRef } = useDropdown();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    itemsRef.current = [];
    const onDocClick = (e: globalThis.MouseEvent) => {
      const t = e.target as Node;
      if (!ref.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        document.getElementById(triggerId)?.focus();
      }
      if (e.key === 'ArrowDown' && itemsRef.current.length) {
        e.preventDefault();
        const next = (itemsRef.current.findIndex((n) => n === document.activeElement) + 1) % itemsRef.current.length;
        itemsRef.current[next]?.focus();
        setActiveIndex(next);
      }
      if (e.key === 'ArrowUp' && itemsRef.current.length) {
        e.preventDefault();
        const cur = itemsRef.current.findIndex((n) => n === document.activeElement);
        const next = cur <= 0 ? itemsRef.current.length - 1 : cur - 1;
        itemsRef.current[next]?.focus();
        setActiveIndex(next);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen, triggerId, setActiveIndex, itemsRef]);

  if (!open) return null;

  return (
    <div
      id={menuId}
      ref={ref}
      role="menu"
      tabIndex={-1}
      className={`ui-dropdown__content ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function DropdownLabel({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ui-dropdown__label ${className}`.trim()} role="presentation" {...rest} />;
}

export function DropdownSeparator({ className = '' }: { readonly className?: string }) {
  return <div role="separator" className={`ui-dropdown__sep ${className}`.trim()} />;
}

export type DropdownItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly icon?: ReactNode;
  readonly shortcut?: string;
  readonly danger?: boolean;
};

export function DropdownItem({
  icon,
  shortcut,
  danger = false,
  className = '',
  children,
  onClick,
  ...rest
}: DropdownItemProps) {
  const { setOpen, onSelect, itemsRef } = useDropdown();
  return (
    <button
      type="button"
      role="menuitem"
      ref={(el) => {
        itemsRef.current[itemsRef.current.length] = el;
      }}
      className={[
        'ui-dropdown__item',
        danger ? 'ui-dropdown__item--danger' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          setOpen(false);
          onSelect?.();
        }
      }}
      onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.currentTarget.click();
        }
      }}
      {...rest}
    >
      {icon && <span className="ui-dropdown__icon">{icon}</span>}
      <span className="ui-dropdown__text">{children}</span>
      {shortcut && <kbd className="ui-dropdown__kbd">{shortcut}</kbd>}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  TABS
 * ──────────────────────────────────────────────────────────────────────────── */

type TabsContextValue = {
  readonly value: string;
  readonly setValue: (value: string) => void;
  readonly baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export type TabsProps = {
  readonly value?: string;
  readonly defaultValue: string;
  readonly onValueChange?: (value: string) => void;
  readonly children: ReactNode;
  readonly className?: string;
};

export function Tabs({ value, defaultValue, onValueChange, children, className = '' }: TabsProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value! : uncontrolled;
  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ value: current, setValue, baseId }}>
      <div className={`ui-tabs ${className}`.trim()}>{children}</div>
    </TabsContext.Provider>
  );
}

function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>.');
  return ctx;
}

export function TabsList({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div role="tablist" className={`ui-tabs__list ${className}`.trim()} {...rest} />;
}

export function TabsTrigger({
  value,
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLButtonElement> & { readonly value: string }) {
  const { value: current, setValue, baseId } = useTabs();
  const selected = current === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-trigger-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-content-${value}`}
      tabIndex={selected ? 0 : -1}
      data-state={selected ? 'active' : 'inactive'}
      className={[
        'ui-tabs__trigger',
        selected ? 'ui-tabs__trigger--active' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => setValue(value)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { readonly value: string }) {
  const { value: current, baseId } = useTabs();
  if (current !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-content-${value}`}
      aria-labelledby={`${baseId}-trigger-${value}`}
      className={`ui-tabs__content ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  ACCORDION
 * ──────────────────────────────────────────────────────────────────────────── */

type AccordionContextValue = {
  readonly open: ReadonlySet<string>;
  readonly toggle: (value: string) => void;
  readonly baseId: string;
  readonly type: 'single' | 'multiple';
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

export type AccordionProps = {
  readonly type?: 'single' | 'multiple';
  readonly defaultValue?: string | readonly string[];
  readonly value?: string | readonly string[];
  readonly onValueChange?: (value: string | readonly string[]) => void;
  readonly className?: string;
  readonly children: ReactNode;
};

export function Accordion({
  type = 'single',
  defaultValue,
  value,
  onValueChange,
  className = '',
  children,
}: AccordionProps) {
  const toSet = (v: string | readonly string[] | undefined): ReadonlySet<string> => {
    if (v === undefined) return new Set();
    return new Set(Array.isArray(v) ? v : [v]);
  };
  const [uncontrolled, setUncontrolled] = useState<ReadonlySet<string>>(toSet(defaultValue));
  const isControlled = value !== undefined;
  const open = isControlled ? toSet(value) : uncontrolled;
  const baseId = useId();
  const toggle = useCallback(
    (item: string) => {
      let next: ReadonlySet<string>;
      if (type === 'single') {
        next = open.has(item) ? new Set() : new Set([item]);
      } else {
        const s = new Set(open);
        if (s.has(item)) s.delete(item);
        else s.add(item);
        next = s;
      }
      if (!isControlled) setUncontrolled(next);
      const arr = [...next];
      onValueChange?.(type === 'single' ? arr[0] ?? '' : arr);
    },
    [type, open, isControlled, onValueChange],
  );
  return (
    <AccordionContext.Provider value={{ open, toggle, baseId, type }}>
      <div className={`ui-accordion ${className}`.trim()}>{children}</div>
    </AccordionContext.Provider>
  );
}

function useAccordion(): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('Accordion components must be used within <Accordion>.');
  return ctx;
}

export function AccordionItem({
  value,
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { readonly value: string }) {
  const { baseId } = useAccordion();
  return (
    <div
      data-value={value}
      aria-labelledby={`${baseId}-trigger-${value}`}
      className={`ui-accordion__item ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

export function AccordionTrigger({
  value,
  className = '',
  children,
  icon,
  ...rest
}: HTMLAttributes<HTMLButtonElement> & { readonly value: string; readonly icon?: ReactNode }) {
  const { open, toggle, baseId } = useAccordion();
  const expanded = open.has(value);
  return (
    <button
      type="button"
      id={`${baseId}-trigger-${value}`}
      aria-expanded={expanded}
      aria-controls={`${baseId}-content-${value}`}
      data-state={expanded ? 'open' : 'closed'}
      className={`ui-accordion__trigger ${className}`.trim()}
      onClick={() => toggle(value)}
      {...rest}
    >
      <span className="ui-accordion__label">{children}</span>
      <span className="ui-accordion__chev" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}

export function AccordionContent({
  value,
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { readonly value: string }) {
  const { open, baseId } = useAccordion();
  if (!open.has(value)) return null;
  return (
    <div
      id={`${baseId}-content-${value}`}
      role="region"
      className={`ui-accordion__content ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  TOOLTIP
 * ──────────────────────────────────────────────────────────────────────────── */

export type TooltipProps = {
  readonly content: ReactNode;
  readonly side?: 'top' | 'right' | 'bottom' | 'left';
  readonly delay?: number;
  readonly children: ReactNode;
  readonly className?: string;
};

export function Tooltip({
  content,
  side = 'top',
  delay = 180,
  children,
  className = '',
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const show = () => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    if (t.current) clearTimeout(t.current);
    setOpen(false);
  };
  return (
    <span
      className="ui-tooltip-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={[
            'ui-tooltip',
            `ui-tooltip--${side}`,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {content}
        </span>
      )}
    </span>
  );
}
