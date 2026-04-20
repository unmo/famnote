import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Star, User } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

// ナビタブ定義
const NAV_ITEMS = [
  { path: '/dashboard', icon: Home, labelKey: 'nav.home' },
  { path: '/journals', icon: BookOpen, labelKey: 'journals.title' },
  { path: '/highlights', icon: Star, labelKey: 'highlights.title' },
  { path: '/profile', icon: User, labelKey: 'nav.profile' },
] as const;

// モバイル用ボトムナビゲーション（〜767px）
export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 md:hidden">
      <div className="flex items-stretch max-w-lg mx-auto">
        {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors relative min-h-[56px]',
                isActive ? 'text-[var(--color-brand-primary)]' : 'text-zinc-500 hover:text-zinc-300'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} />
                <span className="text-[10px] font-medium">{t(labelKey)}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute bottom-0.5 w-4 h-0.5 bg-[var(--color-brand-primary)] rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

// デスクトップ用サイドナビゲーション（768px〜）
export function SideNav() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/dashboard', icon: Home, label: t('nav.home') },
    { to: '/journals', icon: BookOpen, label: t('journals.title') },
    { to: '/highlights', icon: Star, label: t('highlights.title') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-zinc-950 border-r border-zinc-800 px-4 py-6">
      {/* ロゴ */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center">
          <span className="text-white font-bold text-sm">F</span>
        </div>
        <span className="text-xl font-bold text-zinc-50">FamNote</span>
      </div>

      {/* ナビアイテム */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-[color-mix(in_srgb,var(--color-brand-primary)_15%,transparent)] text-[var(--color-brand-primary)]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              )
            }
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}

      </nav>
    </aside>
  );
}
