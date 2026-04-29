import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LogOut,
  BookOpen,
  Star,
  Home,
  Settings,
  Sun,
  Moon,
  NotebookPen,
} from 'lucide-react';
import { clsx } from 'clsx';
import { BottomNav } from './BottomNav';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSelector } from './ThemeSelector';
import { useDarkMode } from '@/theme/DarkModeContext';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/lib/firebase/auth';
import { toast } from 'sonner';

// アプリ全体のレイアウト（認証済みページ用）
export function AppLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useDarkMode();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('auth.logoutSuccess'));
      navigate('/login');
    } catch {
      toast.error(t('common.error'));
    }
  };

  const navItems = [
    { to: '/dashboard', icon: Home, labelKey: 'nav.home' },
    { to: '/journals', icon: NotebookPen, labelKey: 'journals.title' },
    { to: '/highlights', icon: Star, labelKey: 'highlights.title' },
    { to: '/notes', icon: BookOpen, labelKey: 'nav.notes' },
    { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col transition-colors duration-200 w-full overflow-x-hidden relative">
      {/* ヘッダー（SkillSync準拠） */}
      <header className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* ロゴ */}
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <img src="/favicon.svg" alt="FamNote" className="w-8 h-8" />
              <span className="text-xl font-bold text-zinc-50 tracking-wider">
                Fam<span className="text-[var(--color-brand-primary)]">Note</span>
              </span>
            </Link>
          </div>

          {firebaseUser && (
            <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
              {/* デスクトップ用ナビリンク（左寄り） */}
              <div className="hidden md:flex items-center gap-1 mr-2">
                {navItems.map(({ to, icon: Icon, labelKey }) => (
                  <Link
                    key={to}
                    to={to}
                    className={clsx(
                      'p-2 rounded-lg transition-all',
                      location.pathname === to || location.pathname.startsWith(to + '/')
                        ? 'bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] text-[var(--color-brand-primary)]'
                        : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800'
                    )}
                    title={t(labelKey)}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>

              {/* 右側: 言語・テーマ・ダークモード・ログアウト */}
              <div className="flex items-center gap-1 border-l border-zinc-800/60 pl-2 md:pl-3">
                <LanguageSwitcher />
                <ThemeSelector />
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-full transition-all"
                  title={theme === 'dark' ? 'ライトモード' : 'ダークモード'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 md:p-2 text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] hover:bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] rounded-full transition-all border border-[color-mix(in_srgb,var(--color-brand-primary)_20%,transparent)]"
                  title={t('auth.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 w-full">
        <Outlet />
      </main>

      {/* モバイル用ボトムナビ */}
      {firebaseUser && <BottomNav />}
    </div>
  );
}
