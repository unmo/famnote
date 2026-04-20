import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { MapPin, MessageSquare } from 'lucide-react';
import { REACTION_EMOJIS } from '@/types/reaction';
import { SPORT_EMOJIS } from '@/types/sport';
import type { MatchJournal } from '@/types/matchJournal';
import { StatusBadge } from './StatusBadge';

interface MatchJournalCardProps {
  journal: MatchJournal;
  onPress: (id: string) => void;
  onPostNotePress?: (id: string) => void;
  variant?: 'timeline' | 'mini';
}

// 目標達成率を計算
function calcAchievementRate(journal: MatchJournal): number {
  if (!journal.postNote || !journal.preNote) return 0;
  const total = journal.preNote.goals.length;
  if (total === 0) return 0;
  const achieved = journal.postNote.goalReviews.filter(
    (r) => r.achievement === 'achieved' || r.achievement === 'partial'
  ).length;
  return Math.round((achieved / total) * 100);
}

export function MatchJournalCard({
  journal,
  onPress,
  onPostNotePress,
  variant = 'timeline',
}: MatchJournalCardProps) {
  const dateObj = journal.date.toDate();
  const dateStr = format(dateObj, 'M/d（EEE）', { locale: ja });
  const sportEmoji = SPORT_EMOJIS[journal.sport];
  const achievementRate = journal.status === 'completed' ? calcAchievementRate(journal) : 0;
  const achievedCount = journal.postNote?.goalReviews.filter(
    (r) => r.achievement === 'achieved' || r.achievement === 'partial'
  ).length ?? 0;
  const totalGoals = journal.preNote?.goals.length ?? 0;

  const statusBarColor =
    journal.status === 'pre'
      ? 'bg-amber-500'
      : journal.status === 'completed'
      ? 'bg-green-500'
      : 'bg-zinc-600';

  if (variant === 'mini') {
    return (
      <motion.article
        aria-label={`${dateStr} ${journal.opponent}戦`}
        whileTap={{ scale: 0.99 }}
        onClick={() => onPress(journal.id)}
        className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer active:bg-zinc-800/80 transition-colors duration-100"
      >
        <div className={`h-0.5 w-full ${statusBarColor}`} />
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
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
      onClick={() => onPress(journal.id)}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer active:bg-zinc-800/80 transition-colors duration-100"
    >
      {/* ステータスバー */}
      <div className={`h-1 w-full ${statusBarColor}`} />

      <div className="p-4">
        {/* 上段: 日付・ステータス */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <span>{sportEmoji}</span>
            {dateStr}
          </span>
          <StatusBadge status={journal.status} />
        </div>

        {/* 中段: 対戦情報 */}
        <p className="text-lg font-semibold text-zinc-50 mb-1">vs {journal.opponent}</p>
        {journal.venue && (
          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
            <MapPin size={11} />
            {journal.venue}
          </p>
        )}

        {/* completed時: スコア・達成率 */}
        {journal.status === 'completed' && journal.postNote && (
          <>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-3xl font-black text-zinc-50">
                {journal.postNote.myScore ?? '-'}
              </span>
              <span className="text-lg text-zinc-600">-</span>
              <span className="text-3xl font-black text-zinc-400">
                {journal.postNote.opponentScore ?? '-'}
              </span>
              {journal.postNote.performance && (
                <span className="text-sm text-amber-400 ml-auto">
                  {'★'.repeat(journal.postNote.performance)}{'☆'.repeat(5 - journal.postNote.performance)}
                </span>
              )}
            </div>
            {totalGoals > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-500">目標達成</span>
                  <span className="text-zinc-300">{achievedCount}/{totalGoals}件</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${achievementRate}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* pre時: 目標件数 + 振り返りCTA */}
        {journal.status === 'pre' && (
          <>
            {totalGoals > 0 && (
              <p className="text-xs text-zinc-400 mt-2">目標が{totalGoals}件設定されています</p>
            )}
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPostNotePress?.(journal.id);
              }}
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(245,158,11,0)',
                  '0 0 0 6px rgba(245,158,11,0.15)',
                  '0 0 0 0 rgba(245,158,11,0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-3 w-full bg-amber-500/10 border border-amber-500/30 rounded-lg py-2.5 text-sm text-amber-400 font-medium flex items-center justify-center gap-1.5 hover:bg-amber-500/20 transition-colors duration-150"
            >
              <span>試合後の振り返りを書く →</span>
            </motion.button>
          </>
        )}

        {/* リアクション行 */}
        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-3 text-xs text-zinc-500">
          {Object.entries(journal.reactionCounts)
            .filter(([, count]) => count > 0)
            .map(([type, count]) => (
              <span key={type}>
                {REACTION_EMOJIS[type as keyof typeof REACTION_EMOJIS]}{count}
              </span>
            ))}
          {journal.commentCount > 0 && (
            <span className="flex items-center gap-0.5 ml-auto">
              <MessageSquare size={11} />
              {journal.commentCount}コメント
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
