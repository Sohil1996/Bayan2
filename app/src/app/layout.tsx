import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/lib/prefs';

export const metadata: Metadata = {
  title: 'Bayan — Your AI cultural librarian',
  description: 'Talk to books and their characters, in Arabic and English.',
  icons: { icon: '/img/favicon.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#070911' },
    { media: '(prefers-color-scheme: light)', color: '#ebedf2' },
  ],
};

/**
 * Applies the saved language and theme before first paint, so there is no flash
 * of the wrong direction or colours. Keys match the live site, so a user's choice carries over.
 */
const boot = `try{var l=localStorage.getItem('bayan-lang')==='ar'?'ar':'en',t=localStorage.getItem('bayan-theme')==='light'?'light':'dark',d=document.documentElement;d.lang=l;d.dir=l==='ar'?'rtl':'ltr';d.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
