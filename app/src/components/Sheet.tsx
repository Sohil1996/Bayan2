'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from '@bayan/ui';
import { usePrefs } from '@/lib/prefs';

/** Bottom sheet for phones (book details, characters). */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const { t } = usePrefs();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('keydown', esc);
      prev?.focus();
    };
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-end bg-scrim backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className="no-scrollbar max-h-[85dvh] w-full overflow-y-auto rounded-t-[28px] border-t border-line bg-[var(--by-dialog-bg)] p-5 pb-[max(20px,env(safe-area-inset-bottom))] outline-none animate-rise">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-display-sm text-fg-strong">{title}</h2>
          <IconButton size="sm" variant="ghost" aria-label={t('Close')} onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
