import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import '../src/styles/fonts.css';
import '../src/styles/index.css';

/** Applies theme + direction to <html>, exactly as the app does, and paints the Bayan backdrop. */
const withBayan: Decorator = (Story, ctx) => {
  const theme = ctx.globals.theme === 'light' ? 'light' : 'dark';
  const rtl = ctx.globals.dir === 'rtl';
  const backdrop = ctx.globals.backdrop !== 'plain' && ctx.parameters.backdrop !== false;
  useEffect(() => {
    const h = document.documentElement;
    h.dataset.theme = theme;
    h.dir = rtl ? 'rtl' : 'ltr';
    h.lang = rtl ? 'ar' : 'en';
  }, [theme, rtl]);
  return (
    <div
      className="min-h-full bg-bg font-sans text-fg"
      style={{
        padding: ctx.parameters.layout === 'fullscreen' ? 0 : 32,
        minHeight: '100vh',
        backgroundImage: backdrop ? `linear-gradient(var(--by-scrim),var(--by-scrim)),url(./bg-${theme}.jpg)` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withBayan],
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: { title: 'Theme', icon: 'mirror', items: [{ value: 'dark', title: 'Dark' }, { value: 'light', title: 'Light' }], dynamicTitle: true },
    },
    dir: {
      description: 'Language and direction',
      toolbar: { title: 'Language', icon: 'globe', items: [{ value: 'ltr', title: 'English (LTR)' }, { value: 'rtl', title: 'العربية (RTL)' }], dynamicTitle: true },
    },
    backdrop: {
      description: 'Background behind components',
      toolbar: { title: 'Backdrop', icon: 'photo', items: [{ value: 'image', title: 'Bayan image' }, { value: 'plain', title: 'Plain' }], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'dark', dir: 'ltr', backdrop: 'image' },
  parameters: {
    layout: 'padded',
    controls: { expanded: true, matchers: { color: /(background|color)$/i } },
    a11y: { test: 'error' },
    options: { storySort: { order: ['Introduction', 'Foundations', 'Primitives', 'Forms', 'Navigation', 'Content', 'Chat', 'Feedback', 'Patterns'] } },
  },
};
export default preview;
