import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Clock, Plus, BookOpen, User } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

// モバイル用ボトムナビゲーション（〜767px）
export function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-zinc-800 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {/* ホーム */}
        <NavLink to="/dashboard" className={({ isActive }) =>
          clsx('flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors',
            isActive ? 'text-[var(--color-brand-primary)]' : 'text-zinc-500 hover:text-zinc-300')
        }>
          <Home size={22} />
          <span className="text-[10px] font-medium">ホーム</span>
        </NavLink>

        {/* タイムライン */}
        <NavLink to="/timeline" className={({ isActive }) =>
          clsx('flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors',
            isActive ? 'text-[var(--color-brand-primary)]' : 'text-zinc-500 hover:text-zinc-300')
        }>
          <Clock size={22} />
          <span className="text-[10px] font-medium">タイムライン</span>
        </NavLink>

        {/* クイック記録FAB（中央・強調） */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/notes/new')}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-brand-primary)] text-white shadow-lg -mt-5"
          aria-label="練習ノートを作成"
        >
          <Plus size={28} strokeWidth={2.5} />
        </motion.button>

        {/* ノート */}
        <NavLink to="/notes" className={({ isActive }) =>
          clsx('flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors',
            isActive ? 'text-[var(--color-brand-primary)]' : 'text-zinc-500 hover:text-zinc-300')
        }>
          <BookOpen size={22} />
          <span className="text-[10px] font-medium">ノート</span>
        </NavLink>

        {/* プロフィール */}
        <NavLink to="/profile" className={({ isActive }) =>
          clsx('flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors',
            isActive ? 'text-[var(--color-brand-primary)]' : 'text-zinc-500 hover:text-zinc-300')
        }>
          <User size={22} />
          <span className="text-[10px] font-medium">プロフィール</span>
        </NavLink>
      </div>
    </nav>
  );
}

// デスクトップ用サイドナビゲーション（768px〜）
export function SideNav() {
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'ホーム' },
    { to: '/timeline', icon: Clock, label: 'タイムライン' },
    { to: '/notes', icon: BookOpen, label: 'ノート一覧' },
    { to: '/profile', icon: User, label: 'プロフィール' },
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

        {/* クイック記録ボタン */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/notes/new')}
          className="flex items-center gap-3 px-3 py-3 mt-4 rounded-xl bg-[var(--color-brand-primary)] text-white font-semibold hover:opacity-90 transition-all"
        >
          <Plus size={20} />
          <span>練習ノートを書く</span>
        </motion.button>
      </nav>
    </aside>
  );
}
