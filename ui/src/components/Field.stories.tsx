import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { Composer, SearchBar, TextField } from './Field';
import { Checkbox, SegmentedControl, Switch } from './Controls';
import { tr } from '../stories/fixtures';

const meta = {
  title: 'Forms/Fields',
  component: TextField,
  args: { label: 'Email', placeholder: 'Email address', hideLabel: false },
  parameters: {
    docs: {
      description: {
        component:
          'Inputs keep the placeholder on the interface side (next to the icon in Arabic) while typed text uses its own direction, so an email address stays left to right inside the Arabic form.',
      },
    },
  },
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { icon: <Mail /> } };

export const SignInFields: Story = {
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <TextField label={t('Email', 'البريد الإلكتروني')} hideLabel icon={<Mail />} type="email" placeholder={t('Email address', 'البريد الإلكتروني')} autoComplete="email" />
        <TextField label={t('Password', 'كلمة المرور')} hideLabel icon={<Lock />} type="password" placeholder={t('Password', 'كلمة المرور')} autoComplete="current-password" />
        <TextField label={t('Full name', 'الاسم الكامل')} hint={t('Shown on your profile.', 'يظهر في ملفك الشخصي.')} placeholder={t('Your name', 'اسمك')} />
        <TextField label={t('Card number', 'رقم البطاقة')} error={t('Check the card number.', 'تحقّق من رقم البطاقة.')} defaultValue="1234 5678" inputMode="numeric" />
      </div>
    );
  },
};

export const HeroSearch: Story = {
  name: 'SearchBar',
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <div className="flex max-w-xl flex-col gap-6">
        <SearchBar label={t('Ask Bayan', 'اسأل بيان')} submitLabel={t('Send', 'إرسال')} placeholder={t('Recommend me a thriller', 'رشّح لي رواية تشويق')} />
        <SearchBar tone="inline" label={t('Search books', 'ابحث في الكتب')} placeholder={t('Search books or authors', 'ابحث عن كتاب أو مؤلف')} />
      </div>
    );
  },
};

export const ChatComposer: Story = {
  name: 'Composer',
  render: (_, ctx) => {
    const t = tr(ctx);
    return (
      <div className="max-w-xl">
        <Composer label={t('Message', 'رسالة')} sendLabel={t('Send', 'إرسال')} attachLabel={t('More options', 'خيارات أخرى')} placeholder={t('Ask Bayan anything…', 'اسأل بيان أي شيء…')} />
      </div>
    );
  },
};

export const Toggles: Story = {
  name: 'Checkbox, Switch, SegmentedControl',
  render: (_, ctx) => {
    const t = tr(ctx);
    const [lang, setLang] = useState<'en' | 'ar'>(ctx.globals.dir === 'rtl' ? 'ar' : 'en');
    return (
      <div className="flex flex-col items-start gap-5">
        <Checkbox label={t('Remember me', 'تذكّرني')} defaultChecked />
        <Checkbox label={t('I agree to the Terms and Privacy Policy', 'أوافق على الشروط وسياسة الخصوصية')} />
        <Switch label={t('Suggest', 'اقتراح')} defaultChecked />
        <SegmentedControl
          label={t('Language', 'اللغة')}
          value={lang}
          onChange={setLang}
          options={[
            { value: 'en', label: 'EN' },
            { value: 'ar', label: 'عربي', lang: 'ar' },
          ]}
        />
      </div>
    );
  },
};
