import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { BookOpen, Building2, Feather, Hourglass, Landmark, Library, Sparkles, User } from 'lucide-react';
import { Chip, SuggestionChip, Tag } from './Chip';
import { tr } from '../stories/fixtures';

const meta = {
  title: 'Primitives/Chip',
  component: Chip,
  args: { children: 'Heritage', selected: false },
  parameters: { docs: { description: { component: 'Glass pill for categories and filters. Pass `selected` to make it a toggle (sets `aria-pressed`).' } } },
} satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { icon: <Landmark /> } };

export const HomeCategories: Story = {
  render: (_, ctx) => {
    const t = tr(ctx);
    const cats = [
      [<Landmark key="i" />, t('Heritage', 'التراث')],
      [<Feather key="i" />, t('Arabic literature', 'الأدب العربي')],
      [<Building2 key="i" />, t('Architecture', 'العمارة')],
      [<Hourglass key="i" />, t('History', 'تاريخ')],
      [<Sparkles key="i" />, t('Novels', 'روايات')],
      [<Library key="i" />, t('Classics', 'كلاسيكيات')],
      [<BookOpen key="i" />, t('Knowledge', 'المعرفة')],
      [<User key="i" />, t('Biography', 'سِيَر')],
    ] as const;
    const [on, setOn] = useState<number | null>(3);
    return (
      <div className="flex max-w-xl flex-wrap justify-center gap-2" role="group" aria-label={t('Categories', 'التصنيفات')}>
        {cats.map(([icon, label], i) => (
          <Chip key={i} icon={icon} selected={on === i} onClick={() => setOn(on === i ? null : i)}>
            {label}
          </Chip>
        ))}
      </div>
    );
  },
};

export const Suggestions: Story = {
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <div className="flex flex-wrap gap-2">
        <SuggestionChip>{t('Summarize this book', 'لخّص هذا الكتاب')}</SuggestionChip>
        <SuggestionChip>{t('Meet the characters', 'تعرّف على الشخصيات')}</SuggestionChip>
        <SuggestionChip>{t('Find a similar book', 'اقترح كتابًا مشابهًا')}</SuggestionChip>
      </div>
    );
  },
  parameters: { docs: { description: { story: '`SuggestionChip`: follow-ups under a reply. Text keeps its own direction (`dir="auto"`).' } } },
};

export const Tags: Story = {
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <div className="flex gap-2">
        <Tag>{t('Tragedy · Classic', 'مأساة · كلاسيكي')}</Tag>
        <Tag>{t('Arabic · Thriller', 'عربي · تشويق')}</Tag>
      </div>
    );
  },
};
