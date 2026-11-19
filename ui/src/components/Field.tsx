import { forwardRef, useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { ArrowRight, Eye, EyeOff, Plus, Search } from 'lucide-react';
import { cn } from '../lib/cn';
import { IconButton } from './Button';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label. Required for accessibility; hide it visually with `hideLabel`. */
  label: string;
  hideLabel?: boolean;
  /** Icon at the start edge (follows RTL). */
  icon?: ReactNode;
  hint?: string;
  error?: string;
  /** Labels for the password reveal button (localise these). */
  revealLabels?: { show: string; hide: string };
}

/**
 * Single-line input (sign in, profile, payment).
 * The placeholder follows the interface direction; typed text keeps its own (`dir="auto"`),
 * so an email typed in the Arabic interface still reads left to right.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hideLabel, icon, hint, error, revealLabels = { show: 'Show password', hide: 'Hide password' }, className, id, type = 'text', ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descId = hint || error ? `${inputId}-desc` : undefined;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className={cn('text-sm font-medium text-fg-muted', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div
        className={cn(
          'glass flex h-field items-center gap-2.5 rounded-full px-[18px] transition-shadow focus-within:shadow-[0_0_0_3px_rgb(235_193_122/0.35)]',
          error && 'shadow-[0_0_0_2px_var(--by-danger)]',
        )}
      >
        {icon && <span className="flex shrink-0 text-fg-subtle [&_svg]:size-[18px]">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && reveal ? 'text' : type}
          dir="auto"
          aria-invalid={error ? true : undefined}
          aria-describedby={descId}
          className="min-w-0 flex-1 bg-transparent text-md text-fg outline-none placeholder:text-fg-subtle rtl:placeholder-shown:text-right"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? revealLabels.hide : revealLabels.show}
            aria-pressed={reveal}
            className="focus-ring -me-1 grid size-9 place-items-center rounded-full text-fg-subtle hover:text-fg"
          >
            {reveal ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {(hint || error) && (
        <p id={descId} className={cn('px-3 text-sm', error ? 'text-danger' : 'text-fg-subtle')}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onSubmit'> {
  /** Accessible name for the field. */
  label: string;
  /** Accessible name for the submit button. */
  submitLabel?: string;
  onSubmitValue?: (value: string) => void;
  /** `hero`: 58px with gold glow (home). `inline`: 44px (Books, Library). */
  tone?: 'hero' | 'inline';
}

/** Search / ask field. Hero variant is the home "Ask Bayan" bar. */
export function SearchBar({ label, submitLabel = 'Send', onSubmitValue, tone = 'hero', className, defaultValue, ...rest }: SearchBarProps) {
  const [value, setValue] = useState(String(defaultValue ?? ''));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmitValue?.(value.trim());
  };
  const hero = tone === 'hero';
  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn(
        'glass flex items-center gap-3 rounded-full',
        hero ? 'h-[58px] ps-[30px] pe-[9px] shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_0_50px_rgb(235_193_122/0.2),0_14px_40px_rgb(0_0_0/0.4)]' : 'h-control ps-4 pe-1.5',
        className,
      )}
    >
      {!hero && <Search size={18} className="shrink-0 text-fg-subtle" aria-hidden="true" />}
      <input
        aria-label={label}
        dir="auto"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-md font-medium text-fg outline-none placeholder:text-fg-subtle rtl:placeholder-shown:text-right"
        {...rest}
      />
      {hero && (
        <IconButton type="submit" variant="primary" size="lg" aria-label={submitLabel} flipInRtl disabled={!value.trim()}>
          <ArrowRight size={20} />
        </IconButton>
      )}
    </form>
  );
}

export interface ComposerProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  label: string;
  sendLabel?: string;
  attachLabel?: string;
  onSend?: (value: string) => void;
  onAttach?: () => void;
}

/** Chat input pinned to the bottom of every chat. Enter sends, Shift+Enter adds a line. */
export function Composer({ label, sendLabel = 'Send', attachLabel = 'More options', onSend, onAttach, className, ...rest }: ComposerProps) {
  const [value, setValue] = useState('');
  const send = () => {
    if (!value.trim()) return;
    onSend?.(value.trim());
    setValue('');
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className={cn('glass flex min-h-composer items-center gap-2 rounded-full ps-2 pe-2', className)}
    >
      <IconButton variant="ghost" size="md" aria-label={attachLabel} onClick={onAttach}>
        <Plus size={20} />
      </IconButton>
      <textarea
        aria-label={label}
        dir="auto"
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send();
          }
        }}
        className="max-h-40 min-w-0 flex-1 resize-none bg-transparent py-4 text-base leading-normal text-fg outline-none placeholder:text-fg-subtle rtl:placeholder-shown:text-right"
        {...rest}
      />
      <IconButton type="submit" variant="primary" size="md" aria-label={sendLabel} flipInRtl disabled={!value.trim()} className={cn(!value.trim() && 'opacity-40')}>
        <ArrowRight size={18} />
      </IconButton>
    </form>
  );
}
