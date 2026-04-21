import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { MapPin, ChevronRight } from 'lucide-react';
import { SPORT_EMOJIS } from '@/types/sport';
import type { MatchJournal } from '@/types/matchJournal';
import { StatusBadge } from './StatusBadge';

interface MatchJournalCardProps {
  journal: MatchJournal;
  onPress: (id: string) => void;
  onPostNotePress?: (id: string) => void;
  variant?: 'timeline' | 'mini';
}

function calcAchievementRate(journal: MatchJournal): number {
  if (!journal.postNote || !journal.preNote) return 0;
  const total = journal.preNote.goals.length;
  if (total === 0) return 0;
  const achieved = journal.postNote.goalReviews.filter(
    (r) => r.achievement === 'achieved' || r.achievement === 'partial'
  ).length;
  return Math.round((achieved / total) * 100);
}

const STATUS_THEME = {
  pre: {
    border: 'border-amber-500/30',
    accent: 'bg-amber-500',
    glow: 'from-amber-500/8 to-transparent',
    badge: 'text-amber-400',
  },
  completed: {
    border: 'border-green-500/30',
    accent: 'bg-green-500',
    glow: 'from-green-500/8 to-transparent',
    badge: 'text-green-400',
  },
  post_only: {
    border: 'border-blue-500/30',
    accent: 'bg-blue-500',
    glow: 'from-blue-500/8 to-transparent',
    badge: 'text-blue-400',
  },
} as const;

const RESULT_LABEL: Record<string, { label: string; color: string }> = {
  win:  { label: '勝利', color: 'text-green-400 bg-green-500/15' },
  draw: { label: '引分', color: 'text-zinc-400 bg-zinc-700/50' },
  loss: { label: '敗戦', color: 'text-red-400 bg-red-500/15' },
};

export function MatchJournalCard({
  journal,
  onPress,
  onPostNotePress,
  variant = 'timeline',
}: MatchJournalCardProps) {
  const dateObj = journal.date.toDate();
  const dateStr = format(dateObj, 'M月d日（EEE）', { locale: ja });
  const sportEmoji = SPORT_EMOJIS[journal.sport];
  const achievementRate = journal.status === 'completed' ? calcAchievementRate(journal) : 0;
  const achievedCount = journal.postNote?.goalReviews.filter(
    (r) => r.achievement === 'achieved' || r.achievement === 'partial'
  ).length ?? 0;
  const totalGoals = journal.preNote?.goals.length ?? 0;
  const theme = STATUS_THEME[journal.status as keyof typeof STATUS_THEME] ?? STATUS_THEME.pre;
  const resultInfo = journal.postNote?.result ? RESULT_LABEL[journal.postNote.result] : null;

  if (variant === 'mini') {
    return (
      <motion.article
        aria-label={`${dateStr} ${journal.opponent}戦`}
        whileTap={{ scale: 0.99 }}
        onClick={() => onPress(journal.id)}
        className={`bg-zinc-900 border ${theme.border} rounded-xl overflow-hidden cursor-pointer active:bg-zinc-800/80 transition-colors duration-100`}
      >
        <div className={`h-0.5 w-full ${theme.accent}`} />
        <div className="p-3 flex items-center gap-3">
          <span className="text-xl">{sportEmoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-50 truncate">vs {journal.opponent}</p>
            <p className="text-xs text-zinc-500">{dateStr}</p>
          </div>
          <StatusBadge status={journal.status} />
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      aria-label={`${dateStr} ${journal.opponent}戦`}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.15 }}
      onClick={() => onPress(journal.id)}
      className={`bg-zinc-900 border ${theme.border} rounded-2xl overflow-hidden cursor-pointer transition-colors duration-100`}
    >
      {/* カラーバー */}
      <div className={`h-1 w-full ${theme.accent}`} />

      {/* グラデーション背景 */}
      <div className={`bg-gradient-to-br ${theme.glow} p-4`}>

        {/* 上段: 日付・ステータス */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{sportEmoji}</span>
            <span className="text-xs text-zinc-500">{dateStr}</span>
            {journal.venue && (
              <span className="text-xs text-zinc-600 flex items-center gap-0.5">
                <MapPin size={10} />
                {journal.venue}
              </span>
            )}
          </div>
          <StatusBadge status={journal.status} />
        </div>

        {/* 中段: 対戦情報 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">対戦相手</p>
            <p className="text-xl font-bold text-zinc-50">vs {journal.opponent}</p>
          </div>

          {/* 試合結果（completed時） */}
          {journal.status !== 'pre' && journal.postNote && (
            <div className="text-right">
              {resultInfo && (
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1 ${resultInfo.color}`}>
                  {resultInfo.label}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-3xl font-black text-zinc-50 tabular-nums">
                  {journal.postNote.myScore ?? '-'}
                </span>
                <span className="text-lg text-zinc-600 font-bold">-</span>
                <span className="text-3xl font-black text-zinc-400 tabular-nums">
                  {journal.postNote.opponentScore ?? '-'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* completed: 目標達成率 + 自己評価 */}
        {journal.status === 'completed' && journal.postNote && totalGoals > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-800/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-500">目標達成</span>
              <span className="text-zinc-300 font-medium">{achievedCount}/{totalGoals}件 ({achievementRate}%)</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${achievementRate}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-green-500"
              />
            </div>
            {journal.postNote.performance && (
              <p className="text-xs text-amber-400 mt-2">
                {'★'.repeat(journal.postNote.performance)}
                <span className="text-zinc-700">{'★'.repeat(5 - journal.postNote.performance)}</span>
              </p>
            )}
          </div>
        )}

        {/* pre時: 目標件数 + 振り返りCTA */}
        {journal.status === 'pre' && (
          <div className="mt-3 pt-3 border-t border-zinc-800/60">
            {totalGoals > 0 && (
              <p className="text-xs text-zinc-500 mb-2">🎯 目標が{totalGoals}件設定されています</p>
            )}
            <motion.button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPostNotePress?.(journal.id); }}
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(245,158,11,0)',
                  '0 0 0 6px rgba(245,158,11,0.15)',
                  '0 0 0 0 rgba(245,158,11,0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl py-2.5 text-sm text-amber-400 font-semibold flex items-center justify-center gap-1 hover:bg-amber-500/20 transition-colors duration-150"
            >
              試合後の振り返りを書く
              <ChevronRight size={15} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
