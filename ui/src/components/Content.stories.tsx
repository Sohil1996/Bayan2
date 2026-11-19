import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { BookOpen, Clock, MapPin, Users } from 'lucide-react';
import { Card, ListItem } from './Card';
import { Tabs } from './Tabs';
import { Avatar, AvatarPair, Divider, SectionHeader, Wordmark } from './Brand';
import { BookCard, BookCover, BookList } from './Book';
import { CreditMeter, Timeline } from './Feedback';
import { books, characters, tr } from '../stories/fixtures';

const meta = {
  title: 'Content/Cards and lists',
  component: ListItem,
  args: { title: 'Diriyah and the Turaif quarter', subtitle: 'Where the first Saudi state began', image: './b-riyhist.jpg' },
  parameters: { docs: { description: { component: 'The app’s standard row (86px, 66px thumbnail). The whole row is one button; the chevron mirrors in RTL.' } } },
} satisfies Meta<typeof ListItem>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = { name: 'ListItem', decorators: [(S) => <div className="max-w-sm"><S /></div>] };

export const Characters: Story = {
  render: (_, ctx) => (
    <div className="flex max-w-sm flex-col gap-2">
      {characters(ctx).map((c) => (
        <ListItem key={c.id} title={c.name} subtitle={c.role} image={c.img} round />
      ))}
    </div>
  ),
};

export const Recommendations: Story = {
  name: 'BookCard',
  render: (_, ctx) => {
    const t = tr(ctx);
    const [fav, setFav] = useState<Record<string, boolean>>({ coffee: true });
    return (
      <BookList label={t('Recommended books', 'كتب مقترحة')} className="max-w-md">
        {books(ctx).slice(3, 7).map((b) => (
          <BookCard
            key={b.id}
            book={b}
            favorite={!!fav[b.id]}
            onFavoriteChange={(on) => setFav((f) => ({ ...f, [b.id]: on }))}
            favoriteLabels={{ add: t('Add to favorites', 'أضف إلى المفضلة'), remove: t('Remove from favorites', 'إزالة من المفضلة') }}
          />
        ))}
      </BookList>
    );
  },
  parameters: { docs: { description: { story: 'Arabic titles stay correctly aligned inside the English interface, and the other way round.' } } },
};

export const Covers: Story = {
  name: 'BookCover',
  render: (_, ctx) => (
    <div className="flex items-end gap-4">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <BookCover key={s} src="./b-macbeth.jpg" alt={tr(ctx)('Macbeth', 'ماكبث')} size={s} />
      ))}
    </div>
  ),
};

export const ColumnTabs: Story = {
  name: 'Tabs',
  render: (_, ctx) => {
    const t = tr(ctx);
    const [v, setV] = useState<'book' | 'chars' | 'places' | 'time'>('book');
    return (
      <div className="max-w-md">
        <Tabs
          label={t('Book sections', 'أقسام الكتاب')}
          value={v}
          onChange={setV}
          fill
          items={[
            { value: 'book', label: t('This book', 'هذا الكتاب'), icon: <BookOpen />, panel: <p className="text-sm text-fg-muted">{t('About the book…', 'عن الكتاب…')}</p> },
            { value: 'chars', label: t('Characters', 'الشخصيات'), icon: <Users />, panel: <p className="text-sm text-fg-muted">{t('Characters…', 'الشخصيات…')}</p> },
          ]}
        />
        <div className="mt-6">
          <Tabs
            label={t('Explore the world', 'استكشف العالم')}
            value={v}
            onChange={setV}
            items={[
              { value: 'places', label: t('Places', 'الأماكن'), icon: <MapPin /> },
              { value: 'time', label: t('Timeline', 'الخط الزمني'), icon: <Clock /> },
            ]}
          />
        </div>
      </div>
    );
  },
  parameters: { docs: { description: { story: 'Arrow keys move between tabs in reading order (reversed in Arabic); Home and End jump to the ends.' } } },
};

export const Headers: Story = {
  name: 'SectionHeader and Divider',
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <div className="flex max-w-sm flex-col gap-6">
        <SectionHeader divider title={t('Explore the world', 'استكشف العالم')} description={t('Places, characters and the story’s timeline', 'الأماكن والشخصيات والخط الزمني للقصة')} />
        <Divider />
      </div>
    );
  },
};

export const Identity: Story = {
  name: 'Wordmark and Avatar',
  render: (_, ctx) => {
    const c = characters(ctx);
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-8">
          <Wordmark lang="en" />
          <Wordmark lang="ar" />
          <Wordmark iconOnly size={28} />
        </div>
        <div className="flex items-center gap-4">
          <Avatar name="Sohil Reda" ring />
          <Avatar name={c[0].name} src={c[0].img} size={48} />
          <AvatarPair a={{ name: c[0].name, src: c[0].img }} b={{ name: c[2].name, src: c[2].img }} />
        </div>
      </div>
    );
  },
};

export const StoryTimeline: Story = {
  name: 'Timeline',
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <div className="max-w-md">
        <Timeline
          label={t('Story timeline', 'الخط الزمني للقصة')}
          events={[
            { id: '1', meta: t('Act I', 'الفصل الأول'), title: t('The witches’ prophecy', 'نبوءة الساحرات'), description: t('Macbeth is told he will be king.', 'تخبر الساحرات ماكبث بأنه سيصبح ملكًا.') },
            { id: '2', meta: t('Act II', 'الفصل الثاني'), title: t('Duncan is murdered', 'مقتل دنكن'), description: t('Ambition turns to action.', 'يتحوّل الطموح إلى فعل.') },
            { id: '3', meta: t('Act V', 'الفصل الخامس'), title: t('Birnam Wood moves', 'غابة بيرنام تتحرك'), description: t('The prophecy closes in.', 'تقترب النبوءة من تحقّقها.') },
          ]}
        />
      </div>
    );
  },
};

export const Credits: Story = {
  name: 'CreditMeter',
  render: (_, ctx) => {
    const t = tr(ctx);
    return <CreditMeter className="max-w-md" balance={120} used={30} total={150} unit={t('credits', 'رصيد')} caption={t('Used 30 of 150 this month · each message uses one credit', 'استهلكت 30 من 150 هذا الشهر · كل رسالة تستهلك رصيدًا واحدًا')} />;
  },
};

export const Surfaces: Story = {
  name: 'Card surfaces',
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
        <Card padding="md"><b>card</b><p className="text-sm text-fg-muted">{t('Lists, recommendations', 'القوائم والاقتراحات')}</p></Card>
        <Card surface="panel" padding="md"><b>panel</b><p className="text-sm text-fg-muted">{t('Forms, dialogs', 'النماذج والنوافذ')}</p></Card>
        <Card surface="glass" padding="md"><b>glass</b><p className="text-sm text-fg-muted">{t('Floating bars', 'الأشرطة العائمة')}</p></Card>
      </div>
    );
  },
};
