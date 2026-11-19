'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Moon, Sun, User as UserIcon, LibraryBig, SlidersHorizontal, Globe, CircleHelp, LogOut, Palette } from 'lucide-react';
import { AppHeader, Avatar, Button, IconButton, SegmentedControl, Switch, Wordmark, cn } from '@bayan/ui';
import { api } from '@/api';
import { usePrefs } from '@/lib/prefs';

export interface SiteHeaderProps {
  /** Show the "Recommend" switch (home page). */
  recommend?: { on: boolean; onChange: (on: boolean) => void };
  /** Extra content at the start edge instead of the logo (book chat on phones). */
  start?: React.ReactNode;
  back?: { label: string; onClick: () => void };
  /** Extra actions before the language switch (e.g. Spoiler free). */
  extra?: React.ReactNode;
  className?: string;
}

export function SiteHeader({ recommend, start, back, extra, className }: SiteHeaderProps) {
  const { t, lang, setLang, theme, setTheme, user, favorites } = usePrefs();
  const router = useRouter();
  const [menu, setMenu] = useState(false);

  const actions = (
    <>
      {extra}
      {recommend && (
        <span className="glass hidden h-chip items-center gap-2 rounded-full ps-3 pe-1.5 sm:inline-flex">
          <Switch label={t('Recommend')} checked={recommend.on} onChange={(e) => recommend.onChange(e.target.checked)} className="flex-row-reverse text-xs [&>span:first-child]:scale-[0.82]" />
        </span>
      )}
      {recommend && (
        <span className="glass inline-flex h-chip items-center rounded-full px-1.5 sm:hidden">
          <Switch label={t('Recommend books')} hideLabel checked={recommend.on} onChange={(e) => recommend.onChange(e.target.checked)} className="[&>span:first-child]:scale-[0.82]" />
        </span>
      )}
      <SegmentedControl
        className="hidden sm:inline-flex"
        label={t('Language')}
        value={lang}
        onChange={setLang}
        options={[
          { value: 'en', label: 'EN', lang: 'en' },
          { value: 'ar', label: 'عربي', lang: 'ar' },
        ]}
      />
      <Button variant="glass" size="sm" className="sm:hidden" lang={lang === 'ar' ? 'en' : 'ar'} onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label={lang === 'ar' ? 'English' : 'العربية'}>
        {lang === 'ar' ? 'EN' : 'عربي'}
      </Button>
      {user && (
        <Link href="/favorites" aria-label={t('Favorites')} className="focus-ring glass inline-flex h-chip items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-fg">
          <Heart size={14} fill="currentColor" aria-hidden="true" />
          {favorites.length}
        </Link>
      )}
      <IconButton size="sm" aria-label={theme === 'dark' ? t('Switch to light mode') : t('Switch to dark mode')} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </IconButton>
      {user ? (
        <div className="relative">
          <IconButton size="sm" aria-label={t('Profile')} aria-expanded={menu} aria-haspopup="menu" onClick={() => setMenu((m) => !m)} className="ring-1 ring-gold/70">
            <UserIcon size={15} />
          </IconButton>
          {menu && <ProfileMenu onClose={() => setMenu(false)} />}
        </div>
      ) : (
        <Button variant="gold" size="sm" onClick={() => router.push('/signin')} className="px-4">
          {t('Log in')}
        </Button>
      )}
    </>
  );

  return (
    <AppHeader
      className={cn('sticky top-0 z-30 border-b border-line-soft bg-bg/40 backdrop-blur-xl light:bg-white/30', className)}
      back={back}
      start={
        start ?? (
          <Link href="/" aria-label={t('Bayan home')} className="focus-ring rounded-md">
            <Wordmark size={19} lang={lang} className="max-sm:[&>span]:hidden" />
          </Link>
        )
      }
      actions={actions}
    />
  );
}

function ProfileMenu({ onClose }: { onClose: () => void }) {
  const { t, user, credits, theme, lang, setUser } = usePrefs();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && !(e.target as Element).closest('[aria-haspopup="menu"]')) onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    ref.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus();
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [onClose]);
  if (!user) return null;
  const go = (href: string) => {
    onClose();
    router.push(href);
  };
  const total = credits ? credits.balance + credits.usedThisMonth : 1;
  const item = 'focus-ring flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm text-fg hover:bg-line-soft [&_svg]:size-4 [&_svg]:text-fg-muted';
  return (
    <div ref={ref} role="menu" aria-label={t('Profile')} className="surface-panel absolute end-0 top-11 z-50 w-64 rounded-[22px] p-2.5 animate-rise">
      <div className="flex items-center gap-2.5 px-1.5 py-1.5">
        <Avatar name={user.name} size={32} decorative />
        <b className="truncate text-sm font-semibold text-fg-strong">{user.name}</b>
      </div>
      {credits && (
        <button role="menuitem" type="button" onClick={() => go('/profile?tab=credit')} className="focus-ring my-2 block w-full rounded-[14px] border border-gold/22 bg-[linear-gradient(135deg,rgb(235_193_122/0.1),rgb(30_41_75/0.1))] px-3 py-2.5 text-start">
          <span className="flex items-baseline justify-between">
            <b className="text-sm font-semibold text-gold-ink">
              {credits.balance} {t('credits')}
            </b>
            <small className="text-2xs text-fg-subtle">
              {credits.usedThisMonth} {t('used')}
            </small>
          </span>
          <span className="mt-2 block h-1 overflow-hidden rounded-full bg-line-soft">
            <span className="block h-full rounded-full bg-gold" style={{ width: `${Math.max(2, Math.round((credits.usedThisMonth / total) * 100))}%` }} />
          </span>
        </button>
      )}
      <button role="menuitem" type="button" className={item} onClick={() => go('/library')}>
        <LibraryBig /> {t('My Library')}
      </button>
      <button role="menuitem" type="button" className={item} onClick={() => go('/profile?tab=prefs')}>
        <SlidersHorizontal /> {t('Personalization')}
      </button>
      <div className="my-1.5 h-px bg-line-soft" />
      <button role="menuitem" type="button" className={item} onClick={() => go('/profile')}>
        <Palette /> <span className="flex-1">{t('Appearance')}</span>
        <small className="text-2xs text-fg-subtle">{t(theme === 'dark' ? 'Dark' : 'Light')}</small>
      </button>
      <button role="menuitem" type="button" className={item} onClick={() => go('/profile')}>
        <Globe /> <span className="flex-1">{t('Language')}</span>
        <small className="text-2xs text-fg-subtle">{lang === 'ar' ? 'العربية' : 'English'}</small>
      </button>
      <button role="menuitem" type="button" className={item} onClick={() => go('/explore')}>
        <CircleHelp /> {t('Help and feedback')}
      </button>
      <div className="my-1.5 h-px bg-line-soft" />
      <button
        role="menuitem"
        type="button"
        className={cn(item, 'text-danger [&_svg]:text-danger')}
        onClick={async () => {
          await api.signOut();
          setUser(null);
          go('/');
        }}
      >
        <LogOut className="rtl:-scale-x-100" /> {t('Sign out')}
      </button>
    </div>
  );
}
