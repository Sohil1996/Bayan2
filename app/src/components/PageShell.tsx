'use client';
import type { ReactNode } from 'react';
import { cn } from '@bayan/ui';
import { Backdrop } from './Backdrop';
import { SiteDock } from './SiteDock';
import { SiteHeader, type SiteHeaderProps } from './SiteHeader';

/** Header, artwork, dock and main landmark shared by every page. */
export function PageShell({ children, header, className }: { children: ReactNode; header?: SiteHeaderProps; className?: string }) {
  return (
    <>
      <Backdrop />
      <SiteHeader {...header} />
      <main id="main" className={cn('relative pb-28', className)}>
        {children}
      </main>
      <SiteDock />
    </>
  );
}

/**
 * Two-column library page: a fixed intro column at the start (eyebrow, title, description,
 * optional filters) and the content beside it. Stacks on phones.
 */
export function SidePage({ eyebrow, title, description, aside, children }: { eyebrow: string; title: string; description?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-6 px-5 pt-6 md:grid-cols-[260px_minmax(0,1fr)] md:gap-10 md:px-8 md:pt-10 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="min-w-0 md:sticky md:top-24 md:self-start md:pt-6">
        <p className="eyebrow !text-[0.65rem] !tracking-[0.12em] !normal-case">{eyebrow}</p>
        <h1 className="mt-1 font-display text-[2rem] leading-tight text-fg-strong md:mt-2">{title}</h1>
        {description && <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-fg-muted">{description}</p>}
        {aside}
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
