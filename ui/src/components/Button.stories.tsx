import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, BookOpen, Heart, LogOut, Moon, Play, User } from 'lucide-react';
import { Button, IconButton } from './Button';
import { tr } from '../stories/fixtures';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { children: 'Continue', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'gold', 'glass', 'outline', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    iconStart: { control: false },
    iconEnd: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Every action button in the app. `md` is 44px, the minimum touch target. `primary` is gold in dark and navy in light; use `gold` where the brand gold must stay in both themes (Sign in, Pay).',
      },
    },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" iconEnd={<ArrowRight size={18} className="rtl:-scale-x-100" />}>{t('Continue', 'متابعة')}</Button>
        <Button variant="gold">{t('Sign in', 'تسجيل الدخول')}</Button>
        <Button variant="glass" iconStart={<BookOpen size={18} />}>{t('This book', 'هذا الكتاب')}</Button>
        <Button variant="outline" iconStart={<Play size={16} fill="currentColor" />}>{t('Read summary', 'اقرأ الملخص')}</Button>
        <Button variant="ghost">{t('Skip', 'تخطّي')}</Button>
        <Button variant="danger" iconStart={<LogOut size={18} className="rtl:-scale-x-100" />}>{t('Sign out', 'تسجيل الخروج')}</Button>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="glass">{t('Small 30', 'صغير 30')}</Button>
        <Button size="md">{t('Medium 44', 'متوسط 44')}</Button>
        <Button size="lg" variant="gold">{t('Large 50', 'كبير 50')}</Button>
      </div>
    );
  },
};

export const States: Story = {
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button loading>{t('Sending', 'جارٍ الإرسال')}</Button>
        <Button disabled>{t('Disabled', 'غير متاح')}</Button>
        <Button block variant="gold" className="max-w-sm">{t('Pay 39 SAR', 'ادفع 39 ر.س')}</Button>
      </div>
    );
  },
};

export const IconButtons: Story = {
  name: 'IconButton',
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <div className="flex flex-wrap items-center gap-3">
        <IconButton size="sm" aria-label={t('Favorites', 'المفضلة')}><Heart size={15} /></IconButton>
        <IconButton size="sm" aria-label={t('Switch to dark mode', 'الوضع الداكن')}><Moon size={15} /></IconButton>
        <IconButton size="sm" aria-label={t('Profile', 'الملف الشخصي')}><User size={15} /></IconButton>
        <IconButton size="md" aria-label={t('Back', 'رجوع')} flipInRtl><ArrowRight size={18} className="rotate-180" /></IconButton>
        <IconButton size="lg" variant="primary" aria-label={t('Send', 'إرسال')} flipInRtl><ArrowRight size={20} /></IconButton>
      </div>
    );
  },
  parameters: { docs: { description: { story: '`aria-label` is required. Use `flipInRtl` for arrows and chevrons only; logos and media controls never mirror.' } } },
};
