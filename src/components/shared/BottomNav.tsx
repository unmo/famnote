import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Star, User, NotebookPen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';

// ナビタブ定義
const NAV_ITEMS = [
  { path: '/dashboard', icon: Home, labelKey: 'nav.home' },
  { path: '/journals', icon: NotebookPen, labelKey: 'journals.title' },
  { path: '/highlights', icon: Star, labelKey: 'highlights.title' },
  { path: '/notes', icon: BookOpen, labelKey: 'nav.notes' },
  { path: '/profile', icon: User, labelKey: 'nav.profile' },
] as const;

// モバイル用ボトムナビゲーション（SkillSync準拠）
export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/60">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => {
          const isActive =
            location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              className={clsx(
                'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all',
                isActive
                  ? 'text-[var(--color-brand-primary)]'
                  : 'text-zinc-500 active:text-[var(--color-brand-primary)]'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
