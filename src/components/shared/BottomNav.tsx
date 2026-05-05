import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Star, NotebookPen, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useUnreadCount } from '@/hooks/useNotifications';
import { NotificationBadge } from './NotificationBadge';

// ナビタブ定義
const NAV_ITEMS = [
  { path: '/dashboard', icon: Home, labelKey: 'nav.home' },
  { path: '/journals', icon: NotebookPen, labelKey: 'journals.title' },
  { path: '/highlights', icon: Star, labelKey: 'highlights.title' },
  { path: '/notes', icon: BookOpen, labelKey: 'nav.notes' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
] as const;

// モバイル用ボトムナビゲーション（layoutId アニメーションでアクティブ状態を視覚化）
export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const { activeProfile } = useActiveProfile();
  // 子プロフィールの場合はバッジを表示しない
  const isChildProfile = activeProfile?.isChildProfile ?? false;
  const { count: unreadCount } = useUnreadCount(
    isChildProfile ? undefined : activeProfile?.uid,
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/60">
      {/* 上部グラデーションライン */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-brand-primary)]/30 to-transparent" />
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => {
          const isActive =
            location.pathname === path ||
            location.pathname.startsWith(path + '/') ||
            (path === '/settings' && location.pathname === '/theme');
          return (
            <Link
              key={path}
              to={path}
              className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] min-h-[44px]"
            >
              {/* アクティブ背景ピル（layoutId でタブ間をスムーズに移動） */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-bg"
                  className="absolute inset-0 bg-[var(--color-brand-primary)]/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              {/* Homeアイコンのみ未読バッジを表示 */}
              {path === '/dashboard' ? (
                <div className="relative">
                  <Icon
                    className={
                      isActive
                        ? 'w-6 h-6 text-[var(--color-brand-primary)] relative z-10'
                        : 'w-5 h-5 text-zinc-500 relative z-10'
                    }
                  />
                  {!isChildProfile && (
                    <NotificationBadge
                      count={unreadCount}
                      positionClassName="absolute -top-1 -right-1"
                    />
                  )}
                </div>
              ) : (
                <Icon
                  className={
                    isActive
                      ? 'w-6 h-6 text-[var(--color-brand-primary)] relative z-10'
                      : 'w-5 h-5 text-zinc-500 relative z-10'
                  }
                />
              )}
              <span
                className={
                  isActive
                    ? 'text-[9px] font-bold text-[var(--color-brand-primary)] relative z-10'
                    : 'text-[9px] font-bold text-zinc-500 relative z-10'
                }
              >
                {t(labelKey)}
              </span>
              {/* ドットインジケーター（layoutId でタブ間をスムーズに移動） */}
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--color-brand-primary)] z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
