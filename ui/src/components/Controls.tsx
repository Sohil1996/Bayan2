import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
}

/** Checkbox with a visible box in both themes (Remember me, Accept terms). */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, className, id, ...rest }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className={cn('inline-flex cursor-pointer items-center gap-2.5 text-sm text-fg-muted', className)}>
      <span className="relative grid size-5 shrink-0 place-items-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-md border-[1.5px] border-fg-subtle bg-transparent transition-colors checked:border-gold checked:bg-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-50 light:border-navy/55 light:bg-white light:checked:bg-gold"
          {...rest}
        />
        <Check size={14} strokeWidth={3} className="pointer-events-none relative text-[#0d0f17] opacity-0 peer-checked:opacity-100" aria-hidden="true" />
      </span>
      {label}
    </label>
  );
});

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  hideLabel?: boolean;
}

/** On/off switch (home "Suggest" toggle, preferences). Uses role="switch". */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({ label, hideLabel, className, id, ...rest }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className={cn('inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-fg', className)}>
      <span className="relative inline-flex h-6 w-11 shrink-0">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          {...rest}
        />
        <span className="absolute inset-0 rounded-full bg-fg-subtle/40 transition-colors peer-checked:bg-[linear-gradient(90deg,var(--by-blue),var(--by-gold))]" />
        <span className="absolute top-[3px] start-[3px] size-[18px] rounded-full bg-white shadow transition-transform duration-200 ease-out-soft peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
      </span>
      <span className={cn(hideLabel && 'sr-only')}>{label}</span>
    </label>
  );
});

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Optional language for screen readers, e.g. 'ar' for "عربي". */
  lang?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  className?: string;
}

/** Compact glass toggle group. The header language switch (EN | عربي) is one of these. */
export function SegmentedControl<T extends string>({ options, value, onChange, label, className }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('glass inline-flex h-chip items-center gap-0.5 rounded-full p-0.5', className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            lang={o.lang}
            onClick={() => onChange(o.value)}
            className={cn(
              'focus-ring h-full cursor-pointer rounded-full px-2.5 text-xs font-semibold transition-colors',
              on ? 'bg-fg text-bg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
