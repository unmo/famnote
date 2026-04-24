import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, BookOpen, NotebookPen, Star, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useStreak } from '@/hooks/useStreak';
import { useGroupNotes } from '@/hooks/useNotes';
import { Avatar } from '@/components/shared/Avatar';
import { formatRelativeTime } from '@/lib/utils/date';

// ストリーク炎アニメーション
const flameVariants = {
  animate: {
    rotate: [-3, 3, -3],
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' as const },
  },
};

// ショートカットメニュー定義
const MENU_ITEMS = [
  {
    to: '/journals',
    icon: NotebookPen,
    label: '試合ノート',
    sub: '記録・振り返り',
    color: 'from-orange-500/20 to-orange-600/5',
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-500/20',
  },
  {
    to: '/notes',
    icon: BookOpen,
    label: '練習ノート',
    sub: '練習内容を記録',
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
  },
  {
    to: '/highlights',
    icon: Star,
    label: '気づきのかけら',
    sub: '蓄積した気づき',
    color: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
  },
  {
    to: '/profile',
    icon: User,
    label: 'プロフィール',
    sub: '設定・実績',
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
  },
] as const;

const containerVariants = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// ダッシュボードページ
export function DashboardPage() {
  const { t } = useTranslation();
  const { userProfile } = useAuthStore();
  const { data: streakData } = useStreak(userProfile?.uid);
  const { data: recentNotes, isLoading } = useGroupNotes(userProfile?.groupId ?? undefined);

  const currentStreak = streakData?.currentStreak ?? 0;
  const weeklyStatus = streakData?.weeklyStatus ?? Array(7).fill(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* ウェルカムメッセージ */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">
          {t('dashboard.greeting', { name: userProfile?.displayName ?? t('common.defaultName') })}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* ストリークカード */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-orange-950/50 to-amber-950/50 border border-orange-900/50 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <motion.span
                variants={flameVariants}
                animate="animate"
                className="text-4xl select-none"
                aria-hidden="true"
              >
                🔥
              </motion.span>
              <span className="text-5xl font-extrabold text-zinc-50">{currentStreak}</span>
              <span className="text-zinc-400 text-lg">日</span>
            </div>
            <p className="text-orange-300 font-medium mt-1">{t('dashboard.streak')}</p>
          </div>

          {/* 週間ストリークバー */}
          <div className="flex flex-col gap-1">
            <p className="text-zinc-500 text-xs text-right mb-1">{t('dashboard.thisWeek')}</p>
            <div className="flex gap-1.5">
              {weeklyStatus.map((active: boolean, i: number) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full transition-all ${
                    active ? 'bg-[var(--color-brand-primary)]' : 'bg-zinc-800'
                  }`}
                  aria-label={active ? '記録あり' : '記録なし'}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 最近のアクティビティ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-50">{t('dashboard.recentActivity')}</h2>
          <Link to="/timeline" className="text-sm text-[var(--color-brand-primary)] hover:underline">
            {t('dashboard.viewMore')}
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recentNotes && recentNotes.length > 0 ? (
          <div className="space-y-3">
            {recentNotes.slice(0, 5).map((note) => (
              <Link key={note.id} to={`/notes/${note.id}`}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-start gap-3 hover:border-zinc-700 transition-colors"
                >
                  <Avatar size="sm" name={note.userId} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-zinc-500 text-xs">{formatRelativeTime(note.createdAt)}</span>
                    </div>
                    <p className="text-zinc-300 text-sm line-clamp-2">{note.content}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-zinc-400">{t('common.noRecords')}</p>
            <Link
              to="/notes/new"
              className="inline-flex items-center gap-2 mt-4 text-[var(--color-brand-primary)] text-sm hover:underline"
            >
              <Plus size={16} />
              {t('common.createFirstRecord')}
            </Link>
          </div>
        )}
      </div>

      {/* セクションナビゲーション */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">メニュー</h2>
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 gap-3"
        >
          {MENU_ITEMS.map(({ to, icon: Icon, label, sub, color, iconColor, borderColor }) => (
            <motion.div key={to} variants={itemVariants}>
              <Link to={to}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`bg-gradient-to-br ${color} border ${borderColor} rounded-2xl p-4 transition-all duration-150`}
                >
                  <Icon size={24} className={`${iconColor} mb-3`} />
                  <p className="text-zinc-100 font-semibold text-sm">{label}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{sub}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
