import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactElement } from 'react';
import { BookMarked, BookOpen, Building2, Clock, Compass, Feather, Heart, Home, Hourglass, Landmark, Library, Lock, Mail, MapPin, Play, Repeat, Sparkles, User, Users } from 'lucide-react';
import { AppHeader, Dock } from '../components/Navigation';
import { AssistantMessage, SuggestionRow, UserMessage } from '../components/Chat';
import { BookCard, BookCover, BookList } from '../components/Book';
import { Button, IconButton } from '../components/Button';
import { Chip, SuggestionChip } from '../components/Chip';
import { Composer, SearchBar, TextField } from '../components/Field';
import { Checkbox } from '../components/Controls';
import { Card, ListItem } from '../components/Card';
import { SectionHeader, Wordmark } from '../components/Brand';
import { Tabs } from '../components/Tabs';
import { books, characters, tr } from './fixtures';

const meta = {
  title: 'Patterns/Screens',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Reference compositions of real Bayan screens, built only from library components. Switch theme and language in the toolbar.' } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const HomeHero: Story = {
  name: 'Home',
  render: (_, ctx) => {
    const t = tr(ctx);
    const cats: [ReactElement, string][] = [
      [<Landmark key="a" />, t('Heritage', 'التراث')],
      [<Feather key="b" />, t('Arabic literature', 'الأدب العربي')],
      [<Building2 key="c" />, t('Architecture', 'العمارة')],
      [<Hourglass key="d" />, t('History', 'تاريخ')],
      [<Library key="e" />, t('Classics', 'كلاسيكيات')],
    ];
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader actions={<><IconButton size="sm" aria-label={t('Favorites', 'المفضلة')}><Heart size={15} /></IconButton><IconButton size="sm" aria-label={t('Profile', 'الملف الشخصي')}><User size={15} /></IconButton></>} />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-7 px-5 pb-32 text-center">
          <p className="text-2xs font-medium tracking-[0.3em] text-fg-muted uppercase">{t('Your AI cultural librarian', 'أمين مكتبتك الثقافي الذكي')}</p>
          <h1 className="font-display text-[clamp(2.4rem,5vw,3.87rem)] leading-[1.1] font-medium text-fg-strong">
            {t('Where shall we ', 'إلى أين ')}
            <em className="text-gold-ink">{t('wander', 'نتجوّل')}</em>
            {t(' today?', ' اليوم؟')}
          </h1>
          <SearchBar className="w-full" label={t('Ask Bayan', 'اسأل بيان')} submitLabel={t('Send', 'إرسال')} placeholder={t('Recommend me a thriller', 'رشّح لي رواية تشويق')} />
          <div role="group" aria-label={t('Categories', 'التصنيفات')} className="flex flex-wrap justify-center gap-2">
            {cats.map(([i, l]) => <Chip key={l} icon={i}>{l}</Chip>)}
          </div>
        </main>
        <Dock
          label={t('Primary', 'التنقل الرئيسي')}
          centerLabel={t('New conversation', 'محادثة جديدة')}
          activeId="home"
          items={[
            { id: 'home', label: t('Home', 'الرئيسية'), icon: <Home /> },
            { id: 'explore', label: t('Explore', 'استكشف'), icon: <Compass /> },
            { id: 'books', label: t('Books', 'الكتب'), icon: <Library /> },
            { id: 'lib', label: t('My Library', 'مكتبتي'), icon: <BookMarked /> },
          ]}
        />
      </div>
    );
  },
};

export const BookChat: Story = {
  name: 'Book chat',
  render: (_, ctx) => {
    const t = tr(ctx);
    const b = books(ctx)[0];
    const chars = characters(ctx).slice(0, 2);
    const [tab, setTab] = useState<'book' | 'chars'>('book');
    return (
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside aria-label={t('About this book', 'عن هذا الكتاب')} className="flex w-full flex-col gap-6 border-line p-6 lg:w-[420px] lg:border-e lg:rounded-se-column">
          <AppHeader className="h-auto px-0" back={{ label: t('Back', 'رجوع'), onClick: () => {} }} />
          <div className="flex gap-5">
            <BookCover src={b.cover} alt="" size="lg" />
            <div className="flex min-w-0 flex-col justify-center gap-1">
              <h2 className="font-display text-display-md text-fg-strong">{b.title}</h2>
              <p className="font-display text-sm text-fg-muted">{b.author}</p>
              <Button variant="outline" className="mt-3 w-fit" iconStart={<Play size={15} fill="currentColor" />}>{t('Read summary', 'اقرأ الملخص')}</Button>
            </div>
          </div>
          <Tabs
            fill
            label={t('Book sections', 'أقسام الكتاب')}
            value={tab}
            onChange={setTab}
            items={[
              { value: 'book', label: t('This book', 'هذا الكتاب'), icon: <BookOpen /> },
              { value: 'chars', label: t('Characters', 'الشخصيات'), icon: <Users /> },
            ]}
          />
          <SectionHeader divider title={t('Explore the world', 'استكشف العالم')} description={t('Places and the story’s timeline', 'الأماكن والخط الزمني للقصة')} />
          <div className="flex flex-col gap-2">
            {tab === 'book' ? (
              <>
                <ListItem title={t('Inverness Castle', 'قلعة إنفرنيس')} subtitle={t('Where Duncan is murdered', 'حيث يُقتل دنكن')} leading={<span className="grid size-[66px] place-items-center rounded-thumb bg-line-soft text-gold"><MapPin /></span>} />
                <ListItem title={t('Birnam Wood', 'غابة بيرنام')} subtitle={t('The prophecy comes true', 'تتحقّق النبوءة')} leading={<span className="grid size-[66px] place-items-center rounded-thumb bg-line-soft text-gold"><Clock /></span>} />
              </>
            ) : (
              chars.map((c) => <ListItem key={c.id} title={c.name} subtitle={c.role} image={c.img} round />)
            )}
          </div>
        </aside>
        <main className="flex flex-1 flex-col justify-end gap-6 p-6 lg:p-10">
          <AssistantMessage onRegenerate={() => {}}>{t('Macbeth is Shakespeare’s shortest tragedy: a brave general hears a prophecy, and ambition does the rest. Where shall we go?', '«ماكبث» أقصر مآسي شكسبير: قائد شجاع يسمع نبوءة، ويتكفّل الطموح بالباقي. من أين نبدأ؟')}</AssistantMessage>
          <SuggestionRow label={t('Suggested messages', 'رسائل مقترحة')}>
            <SuggestionChip>{t('Summarize this book', 'لخّص هذا الكتاب')}</SuggestionChip>
            <SuggestionChip>{t('Meet the characters', 'تعرّف على الشخصيات')}</SuggestionChip>
            <SuggestionChip>{t('Find a similar book', 'اقترح كتابًا مشابهًا')}</SuggestionChip>
          </SuggestionRow>
          <Composer label={t('Message', 'رسالة')} sendLabel={t('Send', 'إرسال')} placeholder={t('Ask about Macbeth…', 'اسأل عن ماكبث…')} />
        </main>
      </div>
    );
  },
};

export const GeneralChat: Story = {
  name: 'General chat with recommendations',
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-end gap-6 p-6">
        <UserMessage avatar="S">{t('Something about Riyadh’s history', 'شيء عن تاريخ الرياض')}</UserMessage>
        <AssistantMessage
          attachments={
            <BookList label={t('Recommended books', 'كتب مقترحة')}>
              {books(ctx).slice(3, 5).map((b) => <BookCard key={b.id} book={b} onFavoriteChange={() => {}} favoriteLabels={{ add: t('Add to favorites', 'أضف إلى المفضلة'), remove: t('Remove from favorites', 'إزالة من المفضلة') }} />)}
            </BookList>
          }
        >
          {t('Start with Hamad Al-Jasser: he traces Riyadh from a small oasis town to a capital.', 'ابدأ بحمد الجاسر: يتتبّع الرياض من بلدة في واحة إلى عاصمة.')}
        </AssistantMessage>
        <Composer label={t('Message', 'رسالة')} sendLabel={t('Send', 'إرسال')} placeholder={t('Ask Bayan anything…', 'اسأل بيان أي شيء…')} />
      </main>
    );
  },
};

export const DuoColumn: Story = {
  name: 'Duo column',
  render: (_, ctx) => {
    const t = tr(ctx);
    const c = characters(ctx);
    const b = books(ctx);
    return (
      <aside aria-label={t('Duo conversation', 'حوار ثنائي')} className="flex max-w-[420px] flex-col gap-6 p-6">
        <div className="flex gap-5">
          <div className="relative h-[180px] w-[120px] shrink-0">
            <BookCover src={b[0].cover} alt="" size="md" className="absolute top-0 start-0 z-10 w-[94px]!" />
            <BookCover src={b[1].cover} alt="" size="md" className="absolute end-0 bottom-0 w-[94px]! rotate-6 rtl:-rotate-6" />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <h2 className="font-display text-display-md text-fg-strong">{t(`${c[0].name} & ${c[2].name}`, `${c[0].name} و${c[2].name}`)}</h2>
            <p className="font-display text-sm text-fg-muted">{t('A duo across two books', 'حوار ثنائي بين كتابين')}</p>
            <Button variant="outline" className="mt-3 w-fit" iconStart={<Repeat size={16} />}>{t('Change characters', 'تغيير الشخصيات')}</Button>
          </div>
        </div>
        <SectionHeader divider title={t('The characters', 'الشخصيتان')} description={t('Who is talking in this duo', 'من يتحدث في هذا الحوار')} />
        <div className="flex flex-col gap-2">
          {[c[0], c[2]].map((x, i) => <ListItem key={x.id} title={x.name} subtitle={`${x.role} · ${b[i].title}`} image={x.img} round />)}
        </div>
        <SectionHeader title={t('The books', 'الكتابان')} description={t('Open a chat with either book', 'افتح محادثة أي كتاب')} />
        <div className="flex flex-col gap-2">
          {b.slice(0, 2).map((x) => <ListItem key={x.id} title={x.title} subtitle={x.author} image={x.cover} />)}
        </div>
      </aside>
    );
  },
};

export const SignIn: Story = {
  name: 'Sign in',
  render: (_, ctx) => {
    const t = tr(ctx);
    const [mode, setMode] = useState<'in' | 'up'>('in');
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <Card surface="panel" padding="lg" className="w-full max-w-[420px]">
          <Wordmark />
          <Tabs
            className="mt-6"
            fill
            label={t('Account', 'الحساب')}
            value={mode}
            onChange={setMode}
            items={[
              { value: 'in', label: t('Sign in', 'تسجيل الدخول') },
              { value: 'up', label: t('Create account', 'إنشاء حساب') },
            ]}
          />
          <h1 className="mt-6 font-display text-display-md text-fg-strong">{mode === 'in' ? t('Welcome back', 'مرحبًا بعودتك') : t('Create your account', 'أنشئ حسابك')}</h1>
          <p className="mt-1 text-sm text-fg-muted">{t('Sign in to pick up where you left off.', 'سجّل الدخول لتكمل من حيث توقفت.')}</p>
          <form className="mt-6 flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <TextField label={t('Email', 'البريد الإلكتروني')} hideLabel icon={<Mail />} type="email" placeholder={t('Email address', 'البريد الإلكتروني')} autoComplete="email" />
            <TextField label={t('Password', 'كلمة المرور')} hideLabel icon={<Lock />} type="password" placeholder={t('Password', 'كلمة المرور')} />
            {mode === 'up' ? <Checkbox label={t('I agree to the Terms and Privacy Policy', 'أوافق على الشروط وسياسة الخصوصية')} /> : <Checkbox label={t('Remember me', 'تذكّرني')} defaultChecked />}
            <Button type="submit" variant="gold" block className="mt-2" iconEnd={<Sparkles size={16} />}>{mode === 'in' ? t('Sign in', 'تسجيل الدخول') : t('Create account', 'إنشاء حساب')}</Button>
          </form>
        </Card>
      </div>
    );
  },
};
