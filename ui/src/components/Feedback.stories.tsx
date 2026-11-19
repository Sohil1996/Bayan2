import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Dialog, Toast } from './Feedback';
import { Button } from './Button';
import { Chip } from './Chip';
import { tr } from '../stories/fixtures';

const meta = {
  title: 'Feedback/Dialog and toast',
  component: Toast,
  args: { children: 'Conversation saved to your library' },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SavedToast: Story = {
  name: 'Toast',
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <Toast icon={<Bookmark />} action={<Button size="sm" variant="ghost">{t('View', 'عرض')}</Button>}>
        {t('Conversation saved to your library', 'تم حفظ المحادثة في مكتبتك')}
      </Toast>
    );
  },
};

export const FeedbackDialog: Story = {
  name: 'Dialog',
  render: (_, ctx) => {
    const t = tr(ctx);
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<number | null>(null);
    const reasons = [t('Not accurate', 'غير دقيق'), t('Not helpful', 'غير مفيد'), t('Wrong book', 'كتاب خاطئ'), t('Other', 'أخرى')];
    return (
      <>
        <Button variant="glass" onClick={() => setOpen(true)}>{t('Open feedback form', 'افتح نموذج الملاحظات')}</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          closeLabel={t('Close', 'إغلاق')}
          title={t('What went wrong?', 'ما المشكلة؟')}
          description={t('Your feedback helps improve Bayan’s answers.', 'ملاحظاتك تساعد في تحسين إجابات بيان.')}
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>{t('Cancel', 'إلغاء')}</Button>
              <Button variant="gold" onClick={() => setOpen(false)}>{t('Send', 'إرسال')}</Button>
            </>
          }
        >
          <div role="group" aria-label={t('Reason', 'السبب')} className="flex flex-wrap gap-2">
            {reasons.map((r, i) => (
              <Chip key={i} selected={reason === i} onClick={() => setReason(i)}>{r}</Chip>
            ))}
          </div>
        </Dialog>
      </>
    );
  },
  parameters: { docs: { description: { story: 'Built on the native `<dialog>`: focus is trapped, Escape and a backdrop click close it, focus returns to the trigger.' } } },
};
