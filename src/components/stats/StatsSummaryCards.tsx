import { motion } from 'motion/react';
import { Flame, Clock, Trophy, TrendingUp } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

interface StatsSummaryCardsProps {
  totals:
    | {
        practiceCount: number;
        totalHours: number;
        matchCount: number;
        winRate: number | null;
      }
    | undefined;
  currentStreak: number | undefined;
  isLoading: boolean;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

/** 単一サマリーカード */
function SummaryCard({
  icon: Icon,
  iconClass,
  gradientFrom,
  gradientTo,
  borderClass,
  value,
  unit,
  label,
  ariaLabel,
}: {
  icon: React.ElementType;
  iconClass: string;
  gradientFrom: string;
  gradientTo: string;
  borderClass: string;
  value: number | string;
  unit: string;
  label: string;
  ariaLabel: string;
}) {
  // 数値のみカウントアップアニメーション（文字列 "-" はスキップ）
  const numValue = typeof value === 'number' ? value : 0;
  const animated = useCountUp(numValue, 1.2);
  const displayValue = typeof value === 'string' ? value : animated;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      role="region"
      aria-label={`${ariaLabel}の統計`}
      className={`rounded-xl p-4 flex flex-col gap-2 shadow-lg shadow-black/20 bg-gradient-to-br ${gradientFrom} ${gradientTo} border ${borderClass}`}
    >
      <Icon className={`w-5 h-5 ${iconClass}`} />
      <div>
        <span className="text-3xl font-bold text-zinc-50 font-[Inter]">
          {displayValue}
        </span>
        <span className="text-xs text-zinc-400 ml-1">{unit}</span>
      </div>
      <p className="text-xs text-zinc-400 leading-tight">{label}</p>
    </motion.div>
  );
}

/** スケルトンカード */
function SkeletonCard() {
  return (
    <div className="rounded-xl p-4 bg-zinc-900 border border-zinc-800 animate-pulse">
      <div className="h-5 w-5 bg-zinc-700 rounded-full mb-2" />
      <div className="h-8 w-16 bg-zinc-700 rounded mb-1" />
      <div className="h-3 w-20 bg-zinc-700 rounded" />
    </div>
  );
}

/** 4枚のKPIカードグリッド */
export function StatsSummaryCards({
  totals,
  currentStreak,
  isLoading,
}: StatsSummaryCardsProps) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="データを読み込み中"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
      >
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const winRateDisplay =
    totals?.winRate != null ? totals.winRate : '-';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
    >
      <SummaryCard
        icon={Flame}
        iconClass="text-green-400"
        gradientFrom="from-green-900/40"
        gradientTo="to-green-950/20"
        borderClass="border-green-800/30"
        value={currentStreak ?? 0}
        unit="日"
        label="継続中"
        ariaLabel="ストリーク継続日数"
      />
      <SummaryCard
        icon={Clock}
        iconClass="text-blue-400"
        gradientFrom="from-blue-900/40"
        gradientTo="to-blue-950/20"
        borderClass="border-blue-800/30"
        value={totals?.totalHours ?? 0}
        unit="時間"
        label="練習時間（合計）"
        ariaLabel="練習時間合計"
      />
      <SummaryCard
        icon={Trophy}
        iconClass="text-amber-400"
        gradientFrom="from-amber-900/40"
        gradientTo="to-amber-950/20"
        borderClass="border-amber-800/30"
        value={totals?.matchCount ?? 0}
        unit="試合"
        label="直近6ヶ月"
        ariaLabel="試合数"
      />
      <SummaryCard
        icon={TrendingUp}
        iconClass="text-purple-400"
        gradientFrom="from-purple-900/40"
        gradientTo="to-purple-950/20"
        borderClass="border-purple-800/30"
        value={winRateDisplay}
        unit="%"
        label="勝率"
        ariaLabel="勝率"
      />
    </motion.div>
  );
}
