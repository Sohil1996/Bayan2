import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface WordmarkProps extends HTMLAttributes<HTMLSpanElement> {
  /** `auto` follows the document language. */
  lang?: 'auto' | 'en' | 'ar';
  /** Icon only (phone headers, favicon-sized spots). */
  iconOnly?: boolean;
  size?: number;
}

/** The book glyph of the Bayan logo. Gold top stroke on the left page. */
export function BayanGlyph({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <path d="M3 5.5C6 4.5 9.5 4.8 12 6.8c2.5-2 6-2.3 9-1.3v13c-3-1-6.5-.7-9 1.3-2.5-2-6-2.3-9-1.3z" />
      <path d="M12 6.8v13" />
      <path d="M3 5.5C6 4.5 9.5 4.8 12 6.8" className="stroke-gold light:stroke-[#a8771e]" />
    </svg>
  );
}

/**
 * Bayan logo: glyph + "BAYAN" in English, glyph + "بيان" in Arabic.
 * The glyph never mirrors.
 */
export function Wordmark({ lang = 'auto', iconOnly, size = 21, className, ...rest }: WordmarkProps) {
  return (
    <span role="img" aria-label="Bayan" className={cn('inline-flex items-center gap-[0.42em] leading-none whitespace-nowrap text-fg-strong', className)} style={{ fontSize: size }} {...rest}>
      <BayanGlyph size={Math.round(size * 1.12)} />
      {!iconOnly && (
        <>
          <span
            aria-hidden="true"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            className={cn(
              'font-semibold tracking-[0.09em] uppercase',
              lang === 'auto' && 'rtl:hidden',
              lang === 'ar' && 'hidden',
            )}
          >
            Bayan
          </span>
          <span
            aria-hidden="true"
            style={{ fontFamily: "'Cairo Variable', Cairo, sans-serif" }}
            className={cn('font-bold', lang === 'auto' && 'hidden rtl:inline', lang === 'en' && 'hidden')}
          >
            بيان
          </span>
        </>
      )}
    </span>
  );
}

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
  /** Name, used for initials and the accessible label. */
  name: string;
  size?: number;
  /** Gold ring (signed-in user, active character). */
  ring?: boolean;
  /** Decorative: hide from assistive tech when the name is already on screen. */
  decorative?: boolean;
}

/** Round portrait or initials. */
export function Avatar({ src, name, size = 40, ring, decorative, className, ...rest }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const common = cn('inline-grid shrink-0 place-items-center overflow-hidden rounded-full', ring ? 'border-[1.5px] border-gold' : 'border border-line', className);
  if (src)
    return (
      <img
        src={src}
        alt={decorative ? '' : name}
        width={size}
        height={size}
        className={cn(common, 'object-cover')}
        style={{ width: size, height: size }}
        {...rest}
      />
    );
  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      className={cn(common, 'bg-line-soft font-semibold text-gold light:bg-navy/10 light:text-gold-ink')}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}

/** Two overlapping portraits for a duo conversation. */
export function AvatarPair({ a, b, size = 42 }: { a: Pick<AvatarProps, 'src' | 'name'>; b: Pick<AvatarProps, 'src' | 'name'>; size?: number }) {
  return (
    <span className="inline-flex items-center">
      <Avatar {...a} size={size} className="border-2 border-fg-strong light:border-white" />
      <Avatar {...b} size={size} className="-ms-3.5 border-2 border-fg-strong light:border-white" />
    </span>
  );
}

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Heading level for document outline. */
  as?: 'h2' | 'h3' | 'h4';
  /** Show the gold divider with the sparkle above the header (book-chat column). */
  divider?: boolean;
  icon?: ReactNode;
}

/** Column section header ("Explore the world", "The characters"). */
export function SectionHeader({ title, description, as: H = 'h3', divider, icon, className, ...rest }: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)} {...rest}>
      {divider && <Divider />}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-gold [&_svg]:size-5">{icon ?? <Sparkle />}</span>
        <div>
          <H className="font-display text-display-sm font-semibold text-fg-strong">{title}</H>
          {description && <p className="mt-0.5 font-display text-[0.84375rem] text-fg-muted">{description}</p>}
        </div>
      </div>
    </div>
  );
}

/** Thin gold rule. */
export function Divider({ className }: { className?: string }) {
  return (
    <div role="separator" className={cn('flex items-center gap-2', className)}>
      <i className="h-px flex-1 bg-[linear-gradient(90deg,transparent,var(--by-card-border))] rtl:bg-[linear-gradient(270deg,transparent,var(--by-card-border))]" />
      <i className="h-px flex-1 bg-[linear-gradient(270deg,transparent,var(--by-card-border))] rtl:bg-[linear-gradient(90deg,transparent,var(--by-card-border))]" />
    </div>
  );
}

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2c.5 4.5 2.5 7.5 7.5 8.5v1C14.5 12.5 12.5 15.5 12 20h-1c-.5-4.5-2.5-7.5-7.5-8.5v-1C8.5 9.5 10.5 6.5 11 2z" />
    </svg>
  );
}
