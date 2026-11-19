import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '../lib/cn';
import { BayanGlyph } from './Brand';

export interface MessageActionLabels {
  copy: string;
  copied: string;
  good: string;
  bad: string;
  regenerate: string;
}

const defaultActionLabels: MessageActionLabels = {
  copy: 'Copy reply',
  copied: 'Copied',
  good: 'Good response',
  bad: 'Bad response',
  regenerate: 'Regenerate',
};

export interface AssistantMessageProps extends HTMLAttributes<HTMLDivElement> {
  /** Text of the reply. Rendered with dir="auto" so Arabic and English both read correctly. */
  children: ReactNode;
  /** Avatar shown at the start edge. Defaults to the Bayan glyph; pass a portrait for characters. */
  avatar?: ReactNode;
  /** Rendered below the bubble as separate blocks (book cards, media). Never inside the bubble. */
  attachments?: ReactNode;
  /** Show copy / feedback / regenerate actions. */
  actions?: boolean;
  onCopy?: () => void;
  onFeedback?: (value: 'good' | 'bad') => void;
  onRegenerate?: () => void;
  actionLabels?: Partial<MessageActionLabels>;
}

/** Reply from Bayan or a character: glass bubble (dark) / gold bubble (light). */
export function AssistantMessage({ children, avatar, attachments, actions = true, onCopy, onFeedback, onRegenerate, actionLabels, className, ...rest }: AssistantMessageProps) {
  const L = { ...defaultActionLabels, ...actionLabels };
  return (
    <div className={cn('flex max-w-[640px] items-start gap-3', className)} {...rest}>
      <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-line bg-line-soft text-fg-strong">{avatar ?? <BayanGlyph size={18} />}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div dir="auto" className="surface-bubble w-fit max-w-full rounded-bubble px-[18px] py-3 text-base leading-[1.5] [unicode-bidi:plaintext]">
          {children}
        </div>
        {attachments}
        {actions && <MessageActions labels={L} onCopy={onCopy} onFeedback={onFeedback} onRegenerate={onRegenerate} />}
      </div>
    </div>
  );
}

export interface MessageActionsProps {
  labels?: Partial<MessageActionLabels>;
  onCopy?: () => void;
  onFeedback?: (value: 'good' | 'bad') => void;
  onRegenerate?: () => void;
}

/** Row of small actions under a reply. Each has an accessible name and a tooltip. */
export function MessageActions({ labels, onCopy, onFeedback, onRegenerate }: MessageActionsProps) {
  const L = { ...defaultActionLabels, ...labels };
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<'good' | 'bad' | null>(null);
  const btn = 'focus-ring grid size-[30px] cursor-pointer place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-line-soft hover:text-fg [&_svg]:size-[15px]';
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        className={btn}
        aria-label={copied ? L.copied : L.copy}
        title={copied ? L.copied : L.copy}
        onClick={() => {
          onCopy?.();
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? <Check /> : <Copy />}
      </button>
      <button type="button" className={cn(btn, vote === 'good' && 'text-gold')} aria-label={L.good} title={L.good} aria-pressed={vote === 'good'} onClick={() => { setVote('good'); onFeedback?.('good'); }}>
        <ThumbsUp fill={vote === 'good' ? 'currentColor' : 'none'} />
      </button>
      <button type="button" className={cn(btn, vote === 'bad' && 'text-gold')} aria-label={L.bad} title={L.bad} aria-pressed={vote === 'bad'} onClick={() => { setVote('bad'); onFeedback?.('bad'); }}>
        <ThumbsDown fill={vote === 'bad' ? 'currentColor' : 'none'} />
      </button>
      {onRegenerate && (
        <button type="button" className={btn} aria-label={L.regenerate} title={L.regenerate} onClick={onRegenerate}>
          <RotateCcw />
        </button>
      )}
    </div>
  );
}

export interface UserMessageProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** User initial or avatar. */
  avatar?: ReactNode;
}

/** The reader's message: plain text aligned to the end edge, no bubble. */
export function UserMessage({ children, avatar, className, ...rest }: UserMessageProps) {
  return (
    <div className={cn('flex items-start justify-end gap-3.5', className)} {...rest}>
      <p dir="auto" className="max-w-[560px] pt-2 text-base leading-[1.5] text-fg [unicode-bidi:plaintext]">
        {children}
      </p>
      {avatar && <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-white/8 text-sm font-semibold text-gold">{avatar}</span>}
    </div>
  );
}

/** Three-dot "thinking" indicator with a live-region label for screen readers. */
export function TypingIndicator({ label = 'Bayan is typing' }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="surface-bubble inline-flex h-11 w-fit items-center gap-1.5 rounded-bubble px-5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 animate-bounce rounded-full bg-current opacity-70" style={{ animationDelay: `${i * 140}ms` }} />
      ))}
    </div>
  );
}

/** Horizontal, wrapping row of follow-up suggestions. */
export function SuggestionRow({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {children}
    </div>
  );
}
