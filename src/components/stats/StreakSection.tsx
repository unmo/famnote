import { motion } from 'motion/react';
import { Flame } from 'lucide-react';

interface StreakSectionProps {
  currentStreak: number;
  longestStreak: number;
  /** 長さ7: true=その曜日に記録あり（月〜日順） */
  weeklyDots: boolean[];
  isLoading: boolean;
}

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

/** ストリーク継続記録セクション */
export function StreakSection({
  currentStreak,
  longestStreak,
  weeklyDots,
  isLoading,
}: StreakSectionProps) {
  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
        <div className="h-4 w-24 bg-zinc-700 rounded mb-3" />
        <div className="flex gap-2 mb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-zinc-700" />
          ))}
        </div>
        <div className="flex gap-4">
          <div className="h-8 w-16 bg-zinc-700 rounded" />
          <div className="h-8 w-16 bg-zinc-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-green-400" />
        <h2 className="text-sm font-semibold text-zinc-300">継続記録</h2>
      </div>

      {/* ウィークリードット（7個） */}
      <div className="flex gap-2 mb-4">
        {weeklyDots.map((hasRecord, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div
              className={
                hasRecord
                  ? 'w-8 h-8 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center'
                  : 'w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-700'
              }
            />
            <span className="text-[9px] text-zinc-600">{DAY_LABELS[i]}</span>
          </div>
        ))}
      </div>

      {/* 現在 / 最長 並列表示 */}
      <div className="flex gap-4">
        <div>
          <p className="text-xs text-zinc-500">現在の連続</p>
          <p className="text-2xl font-bold text-green-400">
            {currentStreak}
            <span className="text-xs text-zinc-400 ml-1">日</span>
          </p>
        </div>
        <div className="w-px bg-zinc-700" />
        <div>
          <p className="text-xs text-zinc-500">最長記録</p>
          <p className="text-2xl font-bold text-zinc-50">
            {longestStreak}
            <span className="text-xs text-zinc-400 ml-1">日</span>
          </p>
        </div>
      </div>
    </motion.section>
  );
}
