'use client';
import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { IconButton, cn } from '@bayan/ui';
import { usePrefs } from '@/lib/prefs';

/** "…" menu on library cards. */
export function MoreMenu({ items, label }: { items: { label: string; onClick: () => void; danger?: boolean }[]; label: string }) {
  const { t } = usePrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative z-10">
      <IconButton size="sm" variant="ghost" aria-label={`${t('More options')}: ${label}`} aria-expanded={open} aria-haspopup="menu" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        <MoreHorizontal size={16} />
      </IconButton>
      {open && (
        <div role="menu" className="surface-panel absolute end-0 top-9 min-w-36 rounded-[14px] p-1.5">
          {items.map((it) => (
            <button key={it.label} role="menuitem" type="button" onClick={(e) => { e.stopPropagation(); setOpen(false); it.onClick(); }} className={cn('focus-ring w-full rounded-lg px-3 py-2 text-start text-sm hover:bg-line-soft', it.danger ? 'text-danger' : 'text-fg')}>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
