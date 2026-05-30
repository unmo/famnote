import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PracticeCharts } from './PracticeCharts';
import { MatchCharts } from './MatchCharts';
import type { MonthlyPracticeStats, MonthlyMatchStats } from '@/types/stats';

type TabType = 'practice' | 'match';

interface StatsTabPanelProps {
  practiceStats: MonthlyPracticeStats[];
  matchStats: MonthlyMatchStats[];
  isLoading: boolean;
}

/** 練習 / 試合 タブ切り替えコンテナ */
export function StatsTabPanel({
  practiceStats,
  matchStats,
  isLoading,
}: StatsTabPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('practice');

  return (
    <div className="space-y-3">
      {/* タブUI */}
      <div
        role="tablist"
        aria-label="グラフ切り替え"
        className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1"
      >
        {(['practice', 'match'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`tabpanel-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-150 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 ${
              activeTab === tab
                ? 'bg-[var(--color-brand-primary)] text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab === 'practice' ? '練習' : '試合'}
          </button>
        ))}
      </div>

      {/* コンテンツ（AnimatePresence でスライド切り替え） */}
      <div role="tabpanel" id={`tabpanel-${activeTab}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'practice' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'practice' ? 10 : -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'practice' ? (
              <PracticeCharts data={practiceStats} isLoading={isLoading} />
            ) : (
              <MatchCharts data={matchStats} isLoading={isLoading} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
