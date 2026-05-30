import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useStats } from '@/hooks/useStats';
import { useHighlights } from '@/hooks/useHighlights';
import { useStreak } from '@/hooks/useStreak';
import { usePastInsights } from '@/hooks/usePastInsights';
import { calculateLongestStreak } from '@/lib/utils/streak';
import { StatsHeader } from '@/components/stats/StatsHeader';
import { StatsSummaryCards } from '@/components/stats/StatsSummaryCards';
import { StreakSection } from '@/components/stats/StreakSection';
import { StatsTabPanel } from '@/components/stats/StatsTabPanel';
import { PastInsightsSection } from '@/components/stats/PastInsightsSection';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const sectionContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

/** 成長の見える化ページ（/stats） */
export function StatsPage() {
  const { activeProfile } = useActiveProfile();
  const { data: statsData, isLoading: statsLoading, isError } = useStats(activeProfile?.uid);
  const { data: highlightsData, isLoading: highlightsLoading } = useHighlights(activeProfile?.uid);
  const streakResult = useStreak(activeProfile?.uid);
  const currentStreak = streakResult.data?.currentStreak ?? 0;
  const weeklyDots = streakResult.data?.weeklyStatus ?? Array(7).fill(false) as boolean[];
  const recordDates = streakResult.data?.recordDates ?? [];
  const longestStreak = calculateLongestStreak(recordDates);

  const pastInsights = usePastInsights(highlightsData?.highlights ?? []);

  const isLoading = statsLoading || highlightsLoading;
  const isEmpty =
    !isLoading &&
    (statsData?.totals.practiceCount ?? 0) === 0 &&
    (statsData?.totals.matchCount ?? 0) === 0;

  // Firestore エラー時はトーストで通知
  useEffect(() => {
    if (isError) {
      toast.error('データの取得に失敗しました', {
        description: 'しばらく経ってから再試行してください',
      });
    }
  }, [isError]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen bg-zinc-950 pb-24"
    >
      <StatsHeader />

      <main aria-label="成長の記録" className="px-4 pt-4">
        {isEmpty ? (
          /* 空状態 */
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 opacity-40">
              <BarChart2 className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-base font-semibold text-zinc-300 mb-2">
              まだ記録がありません
            </h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-[260px]">
              練習ノートや試合ノートを書くと、ここに成長の記録が表示されます
            </p>
            <Link
              to="/notes/new"
              className="px-5 py-2.5 bg-[var(--color-brand-primary)] text-white rounded-xl text-sm font-semibold min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950"
            >
              練習ノートを書く
            </Link>
          </div>
        ) : (
          <motion.div
            variants={sectionContainerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={sectionVariants}>
              <StatsSummaryCards
                totals={statsData?.totals}
                currentStreak={currentStreak}
                isLoading={isLoading}
              />
            </motion.div>

            <motion.div variants={sectionVariants}>
              <StreakSection
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                weeklyDots={weeklyDots}
                isLoading={streakResult.isLoading}
              />
            </motion.div>

            <motion.div variants={sectionVariants}>
              <StatsTabPanel
                practiceStats={statsData?.practiceStats ?? []}
                matchStats={statsData?.matchStats ?? []}
                isLoading={statsLoading}
              />
            </motion.div>

            {(pastInsights.length > 0 || highlightsLoading) && (
              <motion.div variants={sectionVariants}>
                <PastInsightsSection
                  insights={pastInsights}
                  isLoading={highlightsLoading}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
