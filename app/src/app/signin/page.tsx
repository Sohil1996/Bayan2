'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, LogIn, Mail, User as UserIcon, UserPlus } from 'lucide-react';
import { Button, Checkbox, Tabs, TextField, Wordmark } from '@bayan/ui';
import { api } from '@/api';
import { PageShell } from '@/components/PageShell';
import { usePrefs } from '@/lib/prefs';

export default function SignIn() {
  const { t, lang, setUser } = usePrefs();
  const router = useRouter();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t('Enter a valid email address.'));
    if (password.length < 6) return setError(t('Password must be at least 6 characters.'));
    if (mode === 'up' && !name.trim()) return setError(t('Enter your name.'));
    setBusy(true);
    try {
      const u = mode === 'in' ? await api.signIn(email, password) : await api.signUp(name.trim(), email, password);
      setUser(u);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto grid min-h-[calc(100dvh-64px)] max-w-[1100px] grid-cols-[minmax(0,1fr)] items-center gap-10 px-4 py-8 md:grid-cols-[1fr_420px] md:px-5">
        <div className="max-md:hidden">
          <h1 className="font-display text-[3rem] leading-tight text-fg-strong">
            {t('Every book has')} <em className="text-gold light:text-gold-ink rtl:not-italic">{t('a voice.')}</em>
          </h1>
          <p className="mt-3 max-w-[40ch] text-base text-fg-muted">{t('Save your shelves, keep your place and pick up every conversation where you left it.')}</p>
        </div>
        <div className="surface-panel min-w-0 rounded-panel p-5 sm:p-7">
          <Wordmark size={20} lang={lang} />
          <Tabs
            fill
            className="mt-5 [&_[role=tab]]:px-2.5 [&_[role=tab]]:text-sm"
            label={t('Account')}
            value={mode}
            onChange={(m) => {
              setMode(m);
              setError(null);
            }}
            items={[
              { value: 'in', label: t('Sign in'), icon: <LogIn /> },
              { value: 'up', label: t('Create account'), icon: <UserPlus /> },
            ]}
          />
          <h2 className="mt-6 font-display text-display-md text-fg-strong">{t(mode === 'in' ? 'Welcome back' : 'Create your account')}</h2>
          <p className="mt-1 text-sm text-fg-muted">{t(mode === 'in' ? 'Sign in to pick up where you left off.' : 'Save your shelves, keep your place and pick up every conversation where you left it.')}</p>
          <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-3">
            {mode === 'up' && <TextField label={t('Full name')} hideLabel placeholder={t('Full name')} icon={<UserIcon />} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />}
            <TextField label={t('Email address')} hideLabel placeholder={t('Email address')} icon={<Mail />} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label={t('Password')} hideLabel placeholder={t('Password')} icon={<Lock />} type="password" revealLabels={{ show: t('Show password'), hide: t('Hide password') }} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
            {mode === 'in' && (
              <div className="flex items-center justify-between">
                <Checkbox label={t('Remember me')} defaultChecked />
                <button type="button" className="focus-ring rounded text-sm text-gold-ink hover:underline">
                  {t('Forgot password?')}
                </button>
              </div>
            )}
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            <Button type="submit" variant="gold" size="lg" block loading={busy}>
              {t(mode === 'in' ? 'Sign in' : 'Create account')}
            </Button>
          </form>
          <p className="my-4 text-center text-xs text-fg-subtle">{t('or continue with')}</p>
          <Button variant="glass" block size="lg" onClick={() => setError(t('Google sign-in needs the real backend.'))} iconStart={<GoogleG />}>
            Google
          </Button>
        </div>
      </div>
    </PageShell>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
