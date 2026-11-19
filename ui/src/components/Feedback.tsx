import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';
import { IconButton } from './Button';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons row, rendered at the end edge. */
  footer?: ReactNode;
  closeLabel?: string;
  className?: string;
}

/**
 * Modal built on the native <dialog>: focus trap, Escape to close and the backdrop come from the browser.
 * Light theme uses the cream surface (feedback form, confirmations).
 */
export function Dialog({ open, onClose, title, description, children, footer, closeLabel = 'Close', className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="by-dlg-t"
      className={cn(
        'm-auto w-[min(440px,calc(100vw-32px))] rounded-panel border border-line bg-[var(--by-dialog-bg)] p-6 text-fg shadow-[0_24px_60px_rgb(0_0_0/0.45)] light:shadow-[0_24px_60px_rgb(14_36_30/0.18)]',
        'backdrop:bg-scrim backdrop:backdrop-blur-[8px]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="by-dlg-t" className="text-lg font-semibold text-fg-strong">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
        </div>
        <IconButton aria-label={closeLabel} size="sm" variant="ghost" onClick={onClose}>
          <X size={16} />
        </IconButton>
      </div>
      {children && <div className="mt-5">{children}</div>}
      {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
    </dialog>
  );
}

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}

/** Short confirmation ("Conversation saved to your library"). Announced politely to screen readers. */
export function Toast({ children, icon, action, className, ...rest }: ToastProps) {
  return (
    <div role="status" aria-live="polite" className={cn('glass inline-flex min-h-control items-center gap-3 rounded-full ps-4 pe-2 text-sm font-medium text-fg', className)} {...rest}>
      {icon && <span className="text-gold [&_svg]:size-[18px]">{icon}</span>}
      <span dir="auto" className="py-2.5">
        {children}
      </span>
      {action}
    </div>
  );
}

export interface TimelineEvent {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional period label shown above the title. */
  meta?: ReactNode;
}

/** Numbered vertical timeline. The connector runs through the circles in both directions. */
export function Timeline({ events, label, className }: { events: TimelineEvent[]; label: string; className?: string }) {
  return (
    <ol aria-label={label} className={cn('relative flex flex-col gap-3', className)}>
      <span aria-hidden="true" className="absolute top-5 bottom-5 start-[19.5px] w-px bg-card-border" />
      {events.map((e, i) => (
        <li key={e.id} className="relative flex items-start gap-3.5">
          <span className="z-10 grid size-10 shrink-0 place-items-center rounded-full border border-gold/60 bg-bg font-display text-md font-semibold text-gold">{i + 1}</span>
          <div className="surface-card min-w-0 flex-1 rounded-card px-4 py-3">
            {e.meta && <p className="text-2xs font-medium tracking-wide text-gold-ink uppercase">{e.meta}</p>}
            <p dir="auto" className="text-left font-semibold text-fg-strong [unicode-bidi:plaintext] rtl:text-right">
              {e.title}
            </p>
            {e.description && (
              <p dir="auto" className="mt-0.5 text-left text-sm text-fg-muted [unicode-bidi:plaintext] rtl:text-right">
                {e.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export interface CreditMeterProps {
  balance: number;
  used: number;
  total: number;
  /** e.g. "credits" / "رصيد" */
  unit: string;
  /** e.g. "Used 30 of 150 this month" */
  caption: ReactNode;
  className?: string;
}

/** Credit balance with a gold usage bar (header menu and profile). */
export function CreditMeter({ balance, used, total, unit, caption, className }: CreditMeterProps) {
  const pct = Math.min(100, Math.round((used / Math.max(1, total)) * 100));
  return (
    <div className={cn('surface-card rounded-card p-5', className)}>
      <p className="font-display text-display-lg leading-none font-semibold text-fg-strong">
        {balance} <span className="text-display-md">{unit}</span>
      </p>
      <p className="mt-2 text-sm text-fg-muted">{caption}</p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={used}
        aria-label={typeof caption === 'string' ? caption : undefined}
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"
      >
        <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--by-gold-strong),var(--by-gold))]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
