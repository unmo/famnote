import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, BookOpen, Swords } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useStreak } from '@/hooks/useStreak';
import { useGroupNotes } from '@/hooks/useNotes';
import { SportBadge } from '@/components/shared/SportBadge';
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
                    active
                      ? 'bg-[var(--color-brand-primary)]'
                      : 'bg-zinc-800'
                  }`}
                  aria-label={active ? '記録あり' : '記録なし'}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* クイック記録ボタン */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/notes/new">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 hover:border-[var(--color-brand-primary)] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--color-brand-primary)_15%,transparent)] flex items-center justify-center">
              <BookOpen size={20} className="text-[var(--color-brand-primary)]" />
            </div>
            <div>
              <p className="text-zinc-50 font-medium text-sm">{t('dashboard.practiceNote')}</p>
              <p className="text-zinc-500 text-xs">{t('dashboard.practiceSubtext')}</p>
            </div>
          </motion.div>
        </Link>

        <Link to="/matches/new">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 hover:border-zinc-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
              <Swords size={20} className="text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-50 font-medium text-sm">{t('dashboard.matchRecord')}</p>
              <p className="text-zinc-500 text-xs">{t('dashboard.matchSubtext')}</p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* 最近のアクティビティ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-50">{t('dashboard.recentActivity')}</h2>
          <Link
            to="/timeline"
            className="text-sm text-[var(--color-brand-primary)] hover:underline"
          >
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
                      <SportBadge sport={note.sport} size="sm" />
                      <span className="text-zinc-500 text-xs">
                        {formatRelativeTime(note.createdAt)}
                      </span>
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
    </div>
  );
}
