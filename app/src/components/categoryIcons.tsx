import { BookOpen, Hourglass, House, Landmark, PenLine, Sparkles, Columns3, UserRound } from 'lucide-react';

/** Icon per category id (ids are kept from the live site). */
export const CATEGORY_ICON: Record<string, React.ReactNode> = {
  philosophy: <Landmark />,
  arabic: <PenLine />,
  science: <House />,
  history: <Hourglass />,
  fiction: <Sparkles />,
  poetry: <Columns3 />,
  growth: <BookOpen />,
  classics: <UserRound />,
};

/** Order the categories appear in across the app (same as the live site). */
export const CATEGORY_ORDER = ['philosophy', 'arabic', 'science', 'history', 'fiction', 'poetry', 'growth', 'classics'];
