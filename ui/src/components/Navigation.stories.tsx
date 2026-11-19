import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { BookMarked, Compass, Heart, Home, Library, Moon, Sun, User } from 'lucide-react';
import { AppHeader, Dock } from './Navigation';
import { IconButton } from './Button';
import { SegmentedControl, Switch } from './Controls';
import { tr } from '../stories/fixtures';

const meta = {
  title: 'Navigation/Dock and header',
  component: Dock,
  parameters: { layout: 'fullscreen' },
  args: { items: [], activeId: 'home', fixed: false },
} satisfies Meta<typeof Dock>;
export default meta;
type Story = StoryObj<typeof meta>;

export const BottomDock: Story = {
  name: 'Dock',
  render: (_, ctx) => {
    const t = tr(ctx);
    const [active, setActive] = useState('home');
    return (
      <div className="grid min-h-60 place-items-end justify-center pb-8">
        <Dock
          fixed={false}
          activeId={active}
          onNavigate={setActive}
          label={t('Primary', 'التنقل الرئيسي')}
          centerLabel={t('New conversation', 'محادثة جديدة')}
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

export const Header: Story = {
  name: 'AppHeader',
  render: (_, ctx) => {
    const t = tr(ctx);
    const light = ctx.globals.theme === 'light';
    const [lang, setLang] = useState<'en' | 'ar'>(ctx.globals.dir === 'rtl' ? 'ar' : 'en');
    const actions = (
      <>
        <Switch label={t('Suggest', 'اقتراح')} hideLabel defaultChecked />
        <SegmentedControl label={t('Language', 'اللغة')} value={lang} onChange={setLang} options={[{ value: 'en', label: 'EN' }, { value: 'ar', label: 'عربي', lang: 'ar' }]} />
        <IconButton size="sm" aria-label={light ? t('Switch to dark mode', 'الوضع الداكن') : t('Switch to light mode', 'الوضع الفاتح')}>{light ? <Moon size={15} /> : <Sun size={15} />}</IconButton>
        <IconButton size="sm" aria-label={t('Favorites', 'المفضلة')}><Heart size={15} /></IconButton>
        <IconButton size="sm" aria-label={t('Profile', 'الملف الشخصي')}><User size={15} /></IconButton>
      </>
    );
    return (
      <div className="flex flex-col gap-4 py-4">
        <AppHeader actions={actions} />
        <AppHeader back={{ label: t('Back', 'رجوع'), onClick: () => {} }} actions={actions} />
      </div>
    );
  },
};
