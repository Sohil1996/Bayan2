'use client';
import { usePrefs } from '@/lib/prefs';

/** Full-screen artwork behind every page: the night sky (dark) or dawn (light). */
export function Backdrop({ variant = 'hero' }: { variant?: 'hero' | 'chat' }) {
  const { theme } = usePrefs();
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img src={`/img/${variant}-${theme}.jpg`} alt="" className="size-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_9_17/0.35),transparent_30%,transparent_70%,rgb(7_9_17/0.45))] light:bg-[linear-gradient(180deg,rgb(235_237_242/0.3),transparent_35%,transparent_75%,rgb(235_237_242/0.35))]" />
    </div>
  );
}
