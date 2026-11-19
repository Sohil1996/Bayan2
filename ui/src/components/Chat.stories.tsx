import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssistantMessage, SuggestionRow, TypingIndicator, UserMessage } from './Chat';
import { SuggestionChip } from './Chip';
import { BookCard, BookList } from './Book';
import { Avatar } from './Brand';
import { books, characters, tr } from '../stories/fixtures';

const meta = {
  title: 'Chat/Messages',
  component: AssistantMessage,
  args: { children: 'Macbeth is Shakespeare’s shortest tragedy: a brave general hears a prophecy, and ambition does the rest.' },
  parameters: {
    docs: {
      description: {
        component:
          'Replies sit in a glass bubble (dark) or a gold bubble (light). Book cards and media always go in `attachments`, as separate blocks under the text, never inside the bubble. The reader’s own messages have no bubble.',
      },
    },
  },
} satisfies Meta<typeof AssistantMessage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Reply: Story = {};

export const Conversation: Story = {
  render: (_, ctx) => {
    const t = tr(ctx);
    const L = { copy: t('Copy reply', 'نسخ الرد'), copied: t('Copied', 'تم النسخ'), good: t('Good response', 'رد جيد'), bad: t('Bad response', 'رد غير مفيد'), regenerate: t('Regenerate', 'إعادة توليد') };
    return (
      <div className="flex max-w-2xl flex-col gap-6">
        <UserMessage avatar="S">{t('Recommend me a thriller', 'رشّح لي رواية تشويق')}</UserMessage>
        <AssistantMessage
          actionLabels={L}
          onRegenerate={() => {}}
          attachments={
            <BookList label={t('Recommended books', 'كتب مقترحة')}>
              {books(ctx).slice(5, 7).map((b) => (
                <BookCard key={b.id} book={b} onFavoriteChange={() => {}} favoriteLabels={{ add: t('Add to favorites', 'أضف إلى المفضلة'), remove: t('Remove from favorites', 'إزالة من المفضلة') }} />
              ))}
            </BookList>
          }
        >
          {t('Here are a few books I’d start with. First pick: “موسم صيد الغزلان” by Ahmed Mourad, a contemporary Arabic thriller.', 'إليك بعض الكتب التي أقترح أن تبدأ بها. اختياري الأول: «موسم صيد الغزلان» لأحمد مراد، رواية تشويق عربية معاصرة.')}
        </AssistantMessage>
        <SuggestionRow label={t('Suggested messages', 'رسائل مقترحة')}>
          <SuggestionChip>{t('Ask about موسم صيد الغزلان', 'حدّثني عن «موسم صيد الغزلان»')}</SuggestionChip>
          <SuggestionChip>{t('Show me something shorter', 'اقترح كتابًا أقصر')}</SuggestionChip>
        </SuggestionRow>
        <TypingIndicator label={t('Bayan is typing', 'بيان يكتب')} />
      </div>
    );
  },
};

export const CharacterReply: Story = {
  render: (_, ctx) => {
    const c = characters(ctx)[2];
    return (
      <AssistantMessage avatar={<Avatar src={c.img} name={c.name} size={36} decorative />}>
        {tr(ctx)('Honest Iago, they call me. I only say what others are too polite to.', 'يسمّونني إياغو الأمين. أنا لا أقول إلا ما يتحرّج الآخرون من قوله.')}
      </AssistantMessage>
    );
  },
};
