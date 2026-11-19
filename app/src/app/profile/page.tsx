'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Ban, BookOpen, Coins, Lightbulb, Lock, LogOut, Plus, SlidersHorizontal, Sparkles, User as UserIcon } from 'lucide-react';
import { Avatar, Button, Chip, CreditMeter, Switch, TextField, cn } from '@bayan/ui';
import { api, type Credits, type TopUpPlan } from '@/api';
import { GLOBAL } from '@/content';
import { PageShell } from '@/components/PageShell';
import { usePrefs } from '@/lib/prefs';

type Tab = 'info' | 'topics' | 'prefs' | 'credit' | 'sec';
const TOPICS = ['Philosophy', 'Arabic literature', 'Science', 'History', 'Fiction', 'Poetry', 'Self-growth', 'Classics'];

function Profile() {
  const { t, lang, user, setUser, ready } = usePrefs();
  const router = useRouter();
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'info');

  useEffect(() => {
    if (ready && !user) router.replace('/signin');
  }, [ready, user, router]);
  if (!user) return <PageShell>{null}</PageShell>;

  const S = GLOBAL.profile.sections;
  const nav: [Tab, React.ReactNode][] = [
    ['info', <UserIcon key="i" />],
    ['topics', <Sparkles key="t" />],
    ['prefs', <SlidersHorizontal key="p" />],
    ['credit', <Coins key="c" />],
    ['sec', <Lock key="s" />],
  ];
  const joined = new Date(user.joined).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const signOut = async () => {
    await api.signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <PageShell>
      <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-8 px-5 pt-8 md:grid-cols-[240px_minmax(0,1fr)] md:px-8">
        <aside className="flex flex-col md:sticky md:top-24 md:h-[calc(100dvh-140px)]">
          <div className="flex flex-col items-center text-center">
            <span className="relative">
              <Avatar name={user.name} size={72} ring decorative className="font-display" />
              <span className="absolute -end-1 -top-1 grid size-6 place-items-center rounded-full bg-gold text-[#0d0f17]" aria-hidden="true">
                <Plus size={14} />
              </span>
            </span>
            <h1 className="mt-3 font-display text-display-sm text-fg-strong">{user.name}</h1>
            <p className="mt-1 rounded-full bg-tag px-3 py-0.5 text-2xs text-tag-fg">
              {t('Joined')} {joined}
            </p>
          </div>
          <nav aria-label={t('Profile')} className="mt-6 flex gap-1 max-md:no-scrollbar max-md:overflow-x-auto md:flex-col">
            {nav.map(([id, icon]) => (
              <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)} className={cn('focus-ring flex shrink-0 cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2 text-sm whitespace-nowrap [&_svg]:size-4', tab === id ? 'surface-tab-on' : 'border-transparent text-fg-muted hover:text-fg')}>
                {icon}
                {t(S[id][0])}
              </button>
            ))}
          </nav>
          <button type="button" onClick={signOut} className="focus-ring mt-auto hidden w-fit items-center gap-2 rounded-full px-4 py-2 text-sm text-danger md:inline-flex">
            <LogOut size={16} className="rtl:-scale-x-100" aria-hidden="true" /> {t('Sign out')}
          </button>
        </aside>
        <section aria-labelledby="pf-h" className="min-w-0 max-w-[720px]">
          <h2 id="pf-h" className="font-display text-display-md text-fg-strong">{t(S[tab][0])}</h2>
          <p className="mt-1 text-sm text-fg-muted">{t(S[tab][1])}</p>
          <div className="mt-6">
            {tab === 'info' && <Info />}
            {tab === 'topics' && <Topics />}
            {tab === 'prefs' && <Prefs />}
            {tab === 'credit' && <CreditsTab />}
            {tab === 'sec' && <Security />}
          </div>
          <Button variant="danger" className="mt-10 md:hidden" iconStart={<LogOut size={16} />} onClick={signOut}>
            {t('Sign out')}
          </Button>
        </section>
      </div>
    </PageShell>
  );
}

function Saved({ show }: { show: boolean }) {
  const { t } = usePrefs();
  return (
    <span role="status" className={cn('text-sm text-gold-ink transition-opacity', show ? 'opacity-100' : 'opacity-0')}>
      {show ? t('Saved') : ''}
    </span>
  );
}

function Info() {
  const { t, user, setUser } = usePrefs();
  const [name, setName] = useState(user!.name);
  const [email, setEmail] = useState(user!.email);
  const [bio, setBio] = useState(user!.bio ?? '');
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="flex max-w-[460px] flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setUser(await api.updateMe({ name, email, bio }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }}
    >
      <TextField label={t('Full name')} hideLabel placeholder={t('Full name')} icon={<UserIcon />} value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label={t('Email address')} hideLabel placeholder={t('Email address')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <textarea aria-label={t('A short bio')} placeholder={t('A short bio')} dir="auto" value={bio} onChange={(e) => setBio(e.target.value)} className="glass h-28 resize-none rounded-[22px] px-[18px] py-3 text-md text-fg outline-none placeholder:text-fg-subtle focus:shadow-[0_0_0_3px_rgb(235_193_122/0.35)]" />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="gold" className="flex-1">
          {t('Save changes')}
        </Button>
        <Button variant="ghost" onClick={() => { setName(user!.name); setEmail(user!.email); setBio(user!.bio ?? ''); }}>
          {t('Reset')}
        </Button>
        <Saved show={saved} />
      </div>
    </form>
  );
}

function Topics() {
  const { t, user, setUser } = usePrefs();
  const [sel, setSel] = useState<string[]>(user!.topics);
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <p className="text-2xs font-semibold tracking-[0.14em] text-fg-subtle uppercase">{t('Favourite topics')}</p>
      <div role="group" aria-label={t('Favourite topics')} className="mt-3 flex max-w-[460px] flex-wrap gap-2">
        {TOPICS.map((x) => (
          <Chip key={x} selected={sel.includes(x)} onClick={() => setSel(sel.includes(x) ? sel.filter((y) => y !== x) : [...sel, x])}>
            {t(x)}
          </Chip>
        ))}
      </div>
      <div className="mt-5 flex max-w-[460px] items-center gap-3">
        <Button variant="gold" className="flex-1" onClick={async () => { setUser(await api.updateMe({ topics: sel })); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
          {t('Save changes')}
        </Button>
        <Button variant="ghost" onClick={() => setSel(user!.topics)}>
          {t('Reset')}
        </Button>
        <Saved show={saved} />
      </div>
    </div>
  );
}

function Prefs() {
  const { t, user, setUser } = usePrefs();
  const P = user!.preferences;
  const set = async (k: keyof typeof P, v: boolean) => setUser(await api.updateMe({ preferences: { ...P, [k]: v } }));
  const stats: [React.ReactNode, string, string, number][] = [
    [<BookOpen key="a" />, 'Active Preferences', 'Topics and styles you prefer', user!.topics.length],
    [<Ban key="b" />, 'Things You Avoid', 'Topics and themes you prefer to avoid', 0],
    [<Lightbulb key="c" />, 'Learned Insights', 'What Bayan has learned about you', 0],
  ];
  const uses: [keyof typeof P, string, string][] = [
    ['rememberConversations', 'Conversations', 'Use relevant information from your chats.'],
    ['useFeedback', 'Liked & Disliked Books', 'Use your feedback to improve recommendations.'],
    ['saveSummaries', 'Saved Books', 'Use your saved books to understand your interests.'],
  ];
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(([icon, title, desc, n]) => (
          <div key={title} className="surface-card rounded-card p-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-line-soft text-gold-ink [&_svg]:size-4">{icon}</span>
              <b className="text-sm font-semibold text-fg-strong">{t(title)}</b>
            </div>
            <p className="mt-3 text-xs text-fg-muted">
              <b className="text-fg-strong">{n}</b> · {t(desc)}
            </p>
          </div>
        ))}
      </div>
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-display-sm text-fg-strong">{t('Reading Preferences')}</h3>
            <p className="text-sm text-fg-muted">{t('Choose what you like to read so Bayan can recommend the right books.')}</p>
          </div>
          <Button size="sm" variant="glass" iconStart={<Plus size={14} />}>
            {t('Add Preferences')}
          </Button>
        </div>
        <p className="surface-card mt-3 rounded-card p-4 text-sm text-fg-muted">{t('No preferences yet. Add one so Bayan can tailor its recommendations.')}</p>
      </div>
      <div>
        <h3 className="font-display text-display-sm text-fg-strong">{t('What Bayan Can Use')}</h3>
        <p className="text-sm text-fg-muted">{t('Choose what data Bayan can use to personalize your experience.')}</p>
        <ul className="mt-3 divide-y divide-line-soft">
          {uses.map(([k, title, desc]) => (
            <li key={k} className="flex items-center justify-between gap-4 py-3">
              <span>
                <b className="block text-sm font-semibold text-fg-strong">{t(title)}</b>
                <small className="text-xs text-fg-muted">{t(desc)}</small>
              </span>
              <Switch label={t(title)} hideLabel checked={P[k]} onChange={(e) => set(k, e.target.checked)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CreditsTab() {
  const { t, p, lang, refreshCredits } = usePrefs();
  const [c, setC] = useState<Credits | null>(null);
  const [plans, setPlans] = useState<TopUpPlan[]>([]);
  const [plan, setPlan] = useState(1);
  const [card, setCard] = useState({ name: '', number: '', exp: '', cvv: '' });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    api.credits().then(setC);
    api.topUpPlans().then(setPlans);
  }, []);
  if (!c) return null;
  const nf = (n: number) => n.toLocaleString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US');
  const total = c.balance + c.usedThisMonth;
  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    // Demo validation only. Card details never leave this form and are not stored.
    if (!card.name.trim()) return setErr(t('Enter the name as it appears on the card.'));
    if (card.number.replace(/\s/g, '').length < 12) return setErr(t('The card number is not valid.'));
    if (!/^\d{2}\/\d{2}$/.test(card.exp)) return setErr(t('The expiry date is not valid.'));
    if (!/^\d{3,4}$/.test(card.cvv)) return setErr(t('The security code is not valid.'));
    setBusy(true);
    setC(await api.topUp(plans[plan]));
    refreshCredits();
    setCard({ name: '', number: '', exp: '', cvv: '' });
    setBusy(false);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };
  return (
    <div className="flex max-w-[460px] flex-col gap-6">
      <CreditMeter
        balance={c.balance}
        used={c.usedThisMonth}
        total={total}
        unit={t('credits')}
        caption={p(`${nf(c.usedThisMonth)} of ${nf(total)} used this month · each message uses 1 credit`, `استهلكت ${nf(c.usedThisMonth)} من ${nf(total)} هذا الشهر · كل رسالة تستهلك رصيدًا واحدًا`)}
      />
      <form onSubmit={pay} noValidate>
        <h3 className="text-sm font-semibold text-fg-strong">{t('Top up')}</h3>
        <div role="radiogroup" aria-label={t('Top up')} className="mt-3 grid grid-cols-3 gap-2">
          {plans.map((x, i) => (
            <button key={x.credits} type="button" role="radio" aria-checked={plan === i} onClick={() => setPlan(i)} className={cn('focus-ring cursor-pointer rounded-card border py-3 text-center', plan === i ? 'surface-tab-on' : 'surface-card')}>
              <b className="block text-display-sm font-semibold text-fg-strong">{nf(x.credits)}</b>
              <small className="text-2xs text-fg-muted">{p(`SAR ${nf(x.price)}`, `${nf(x.price)} ر.س`)}</small>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          <TextField label={t('Name on card')} hideLabel placeholder={t('Name on card')} autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
          <TextField label={t('Card number')} hideLabel placeholder="1234 5678 9012 3456" inputMode="numeric" autoComplete="cc-number" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
          <div className="grid grid-cols-2 gap-2.5">
            <TextField label={t('Expiry')} hideLabel placeholder="MM/YY" autoComplete="cc-exp" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
            <TextField label="CVV" hideLabel placeholder="CVV" inputMode="numeric" autoComplete="cc-csc" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
          </div>
        </div>
        {err && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {err}
          </p>
        )}
        <Button type="submit" variant="gold" block size="lg" className="mt-4" loading={busy}>
          {busy ? t('Processing…') : p(`Pay SAR ${plans[plan] ? nf(plans[plan].price) : ''}`, `ادفع ${plans[plan] ? nf(plans[plan].price) : ''} ر.س`)}
        </Button>
        <p role="status" className="mt-2 min-h-4 text-sm text-gold-ink">{done ? p('Credits added.', 'أُضيف الرصيد.') : ''}</p>
        <p className="mt-1 text-xs text-fg-subtle">{t('Demo mode: no money is charged and card details are not stored. A payment gateway must be connected before launch.')}</p>
      </form>
      <div>
        <h3 className="text-sm font-semibold text-fg-strong">{t('History')}</h3>
        <ul className="mt-2 divide-y divide-line-soft">
          {c.history.map((h) => (
            <li key={h.id} className="flex justify-between py-2.5 text-sm">
              <span className="text-fg">
                {t(h.label === 'top' ? 'Top-up' : 'Conversation usage')} · <span className="text-fg-subtle">{new Date(h.date).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-GB', { day: 'numeric', month: 'short' })}</span>
              </span>
              <b className={h.amount > 0 ? 'text-blue' : 'text-fg-muted'}>
                {h.amount > 0 ? '+' : '−'}
                {nf(Math.abs(h.amount))}
              </b>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Security() {
  const { t } = usePrefs();
  const [sent, setSent] = useState(false);
  return (
    <div className="surface-card flex max-w-[460px] flex-wrap items-center justify-between gap-3 rounded-card p-4">
      <span>
        <b className="block text-sm font-semibold text-fg-strong">{t('Password')}</b>
        <small className="text-xs text-fg-muted">{sent ? t('Check your inbox for the link.') : t('Send yourself a link to choose a new password.')}</small>
      </span>
      <Button size="sm" variant="glass" disabled={sent} onClick={() => setSent(true)}>
        {t('Reset password')}
      </Button>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Profile />
    </Suspense>
  );
}
