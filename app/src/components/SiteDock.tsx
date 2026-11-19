'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, House, Library, LibraryBig } from 'lucide-react';
import { Dock } from '@bayan/ui';
import { usePrefs } from '@/lib/prefs';

/** Bottom navigation. Shown to signed-in readers, as on the live site. */
export function SiteDock() {
  const { t, user } = usePrefs();
  const path = usePathname();
  const router = useRouter();
  if (!user) return null;
  const active = path === '/' ? 'home' : path.startsWith('/explore') ? 'explore' : path.startsWith('/books') ? 'books' : path.startsWith('/library') || path.startsWith('/favorites') ? 'library' : '';
  return (
    <Dock
      label={t('Primary')}
      activeId={active}
      centerLabel={t('Ask the Librarian')}
      onCenter={() => router.push('/chat')}
      onNavigate={(id) => router.push(id === 'home' ? '/' : `/${id}`)}
      items={[
        { id: 'home', label: t('Home'), icon: <House /> },
        { id: 'explore', label: t('Explore'), icon: <Compass /> },
        { id: 'books', label: t('Books'), icon: <Library /> },
        { id: 'library', label: t('My Library'), icon: <LibraryBig /> },
      ]}
    />
  );
}
