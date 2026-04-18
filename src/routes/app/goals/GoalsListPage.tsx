import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useGoals } from '@/hooks/useGoals';
import { SportBadge } from '@/components/shared/SportBadge';
import { formatDate } from '@/lib/utils/date';
import { GOAL_TYPE_LABELS, type GoalStatus } from '@/types/goal';
import type { Sport } from '@/types/sport';
import { clsx } from 'clsx';

const statusStyles: Record<GoalStatus, string> = {
  active: 'text-blue-400 bg-blue-950/50 border-blue-800',
  completed: 'text-green-400 bg-green-950/50 border-green-800',
  expired: 'text-zinc-500 bg-zinc-800 border-zinc-700',
};

const statusLabels: Record<GoalStatus, string> = {
  active: '進行中',
  completed: '達成！',
  expired: '期限切れ',
};

// 目標一覧ページ
export function GoalsListPage() {
  const { t } = useTranslation();
  const { userProfile } = useAuthStore();
  const { data: goals, isLoading } = useGoals(userProfile?.uid);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">{t('goals.title')}</h1>
        <Link to="/goals/new">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
          >
            <Plus size={16} />
            {t('goals.new')}
          </motion.div>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress =
              goal.targetValue
                ? Math.min(100, (goal.currentValue / goal.targetValue) * 100)
                : 0;

            return (
              <motion.div
                key={goal.id}
                whileHover={{ scale: 1.01 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <SportBadge sport={goal.sport as Sport} size="sm" />
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded-full text-xs font-medium border',
                          statusStyles[goal.status]
                        )}
                      >
                        {statusLabels[goal.status]}
                      </span>
                    </div>
                    <h3 className="text-zinc-50 font-medium">{goal.title}</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {GOAL_TYPE_LABELS[goal.goalType]}
                      {goal.targetValue && ` • 目標: ${goal.targetValue}`}
                      {' • 期限: '}{formatDate(goal.deadline)}
                    </p>
                  </div>
                </div>

                {/* 進捗バー（目標値がある場合） */}
                {goal.targetValue && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                      <span>進捗</span>
                      <span>{goal.currentValue} / {goal.targetValue}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-[var(--color-brand-primary)] rounded-full"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎯</p>
          <p className="text-zinc-400 mb-4">まだ目標が設定されていません</p>
          <Link to="/goals/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} />
            最初の目標を設定
          </Link>
        </div>
      )}
    </div>
  );
}
