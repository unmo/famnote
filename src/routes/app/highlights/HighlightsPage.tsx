import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useHighlights } from '@/hooks/useHighlights';
import { HighlightCard } from '@/components/highlights/HighlightCard';
import type { HighlightSourceType } from '@/types/highlight';
import { clsx } from 'clsx';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

type FilterSourceType = 'all' | 'pre' | 'post' | 'practice';

const SOURCE_FILTERS: Array<{ value: FilterSourceType; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'pre', label: '試合前' },
  { value: 'post', label: '試合後' },
  { value: 'practice', label: '練習' },
];

function filterToSourceTypes(filter: FilterSourceType): HighlightSourceType[] | undefined {
  switch (filter) {
    case 'pre': return ['journal_pre_goal', 'journal_pre_challenge'];
    case 'post': return ['journal_post_achievement', 'journal_post_improvement', 'journal_post_exploration'];
    case 'practice': return ['practice_bullet'];
    default: return undefined;
  }
}

export function HighlightsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeProfile } = useActiveProfile();
  const [sourceFilter, setSourceFilter] = useState<FilterSourceType>('all');
  const { data, isLoading } = useHighlights(activeProfile?.uid);

  const highlights = data?.highlights ?? [];

  // クライアントサイドフィルタリング
  const allowedTypes = filterToSourceTypes(sourceFilter);
  const filtered = allowedTypes
    ? highlights.filter((h) => allowedTypes.includes(h.sourceType))
    : highlights;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen bg-zinc-950 pb-24"
    >
      {/* ヘッダー */}
      <header className="px-4 py-3 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50">
        <h1 className="text-xl font-bold text-zinc-50">{t('highlights.title')}</h1>
      </header>

      {/* フィルターバー */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none border-b border-zinc-800 sticky top-[57px] bg-zinc-950/95 backdrop-blur-md z-10">
        {SOURCE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSourceFilter(value)}
            className={clsx(
              'rounded-full px-3 py-1.5 text-xs font-medium border whitespace-nowrap transition-colors',
              sourceFilter === value
                ? 'bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] border-[var(--color-brand-primary)]/50'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="space-y-3" role="status" aria-label="読み込み中">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-zinc-700 rounded w-1/3 mb-3" />
                <div className="h-5 bg-zinc-700 rounded w-full mb-2" />
                <div className="h-4 bg-zinc-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-6xl opacity-20 mb-4">📌</p>
            <h2 className="text-lg font-semibold text-zinc-300">{t('highlights.emptyTitle')}</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-[280px] whitespace-pre-line">
              {t('highlights.emptyDesc')}
            </p>
            <button
              onClick={() => navigate('/journals')}
              className="mt-6 px-6 py-2.5 bg-[var(--color-brand-primary)] text-white rounded-xl text-sm font-medium"
            >
              {t('journals.title')}へ
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((highlight) => (
              <HighlightCard
                key={highlight.id}
                highlight={highlight}
                variant="full"
                onPress={(h) => {
                  // 元のジャーナルへリンク
                  if (h.sourceType.startsWith('journal_')) {
                    navigate(`/journals/${h.sourceId}`);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
