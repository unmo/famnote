import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';
import { SPORT_EMOJIS } from '@/types/sport';
import type { MatchJournal } from '@/types/matchJournal';
import { StatusBadge } from './StatusBadge';

interface MatchJournalCardProps {
  journal: MatchJournal;
  onPress: (id: string) => void;
  onPostNotePress?: (id: string) => void;
  variant?: 'timeline' | 'mini';
}

const STATUS_THEME = {
  pre:       { bar: 'bg-amber-500', glow: 'from-amber-500/6' },
  completed: { bar: 'bg-green-500', glow: 'from-green-500/6' },
  post_only: { bar: 'bg-blue-500',  glow: 'from-blue-500/6'  },
} as const;

const RESULT_LABEL: Record<string, { label: string; cls: string }> = {
  win:  { label: '勝', cls: 'text-green-400 bg-green-500/15' },
  draw: { label: '分', cls: 'text-zinc-400 bg-zinc-700/50' },
  loss: { label: '負', cls: 'text-red-400 bg-red-500/15' },
};

export function MatchJournalCard({ journal, onPress, onPostNotePress }: MatchJournalCardProps) {
  const dateStr = format(journal.date.toDate(), 'M/d（EEE）', { locale: ja });
  const sportEmoji = SPORT_EMOJIS[journal.sport];
  const theme = STATUS_THEME[journal.status as keyof typeof STATUS_THEME] ?? STATUS_THEME.pre;
  const resultInfo = journal.postNote?.result ? RESULT_LABEL[journal.postNote.result] : null;
  const totalGoals = journal.preNote?.goals.length ?? 0;
  const achievedCount = journal.postNote?.goalReviews.filter(
    (r) => r.achievement === 'achieved' || r.achievement === 'partial'
  ).length ?? 0;
  const achievementRate = totalGoals > 0 ? Math.round((achievedCount / totalGoals) * 100) : 0;

  return (
    <motion.article
      aria-label={`${dateStr} ${journal.opponent}戦`}
      whileTap={{ scale: 0.97 }}
      onClick={() => onPress(journal.id)}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer active:bg-zinc-800/80 transition-colors duration-100"
    >
      {/* カラーバー */}
      <div className={`h-1 w-full ${theme.bar}`} />

      <div className={`bg-gradient-to-b ${theme.glow} to-transparent p-3 flex flex-col gap-2`}>
        {/* 日付・スポーツ */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
            <span>{sportEmoji}</span>{dateStr}
          </span>
          <StatusBadge status={journal.status} />
        </div>

        {/* 対戦相手 */}
        <div>
          <p className="text-[10px] text-zinc-600 mb-0.5">vs</p>
          <p className="text-sm font-bold text-zinc-100 truncate">{journal.opponent}</p>
        </div>

        {/* 完了時: スコア＋達成率 */}
        {journal.status !== 'pre' && journal.postNote && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              {resultInfo && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${resultInfo.cls}`}>
                  {resultInfo.label}
                </span>
              )}
              <span className="text-lg font-black text-zinc-100 tabular-nums">
                {journal.postNote.myScore ?? '-'}
              </span>
              <span className="text-xs text-zinc-600">-</span>
              <span className="text-lg font-black text-zinc-500 tabular-nums">
                {journal.postNote.opponentScore ?? '-'}
              </span>
              {journal.postNote.performance && (
                <span className="ml-auto text-[10px] text-amber-400">
                  {'★'.repeat(journal.postNote.performance)}
                </span>
              )}
            </div>
            {totalGoals > 0 && (
              <div>
                <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${achievementRate}%` }} />
                </div>
                <p className="text-[10px] text-zinc-600 mt-0.5">{achievedCount}/{totalGoals}目標達成</p>
              </div>
            )}
          </div>
        )}

        {/* 試合前: 振り返りCTA */}
        {journal.status === 'pre' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPostNotePress?.(journal.id); }}
            className="w-full mt-1 bg-amber-500/10 border border-amber-500/30 rounded-lg py-1.5 text-[11px] text-amber-400 font-semibold flex items-center justify-center gap-0.5"
          >
            振り返りを書く <ChevronRight size={12} />
          </button>
        )}
      </div>
    </motion.article>
  );
}
