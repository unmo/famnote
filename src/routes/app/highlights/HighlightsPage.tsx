import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useHighlights } from '@/hooks/useHighlights';
import { HighlightCard } from '@/components/highlights/HighlightCard';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function HighlightsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeProfile } = useActiveProfile();
  const { data, isLoading } = useHighlights(activeProfile?.uid);

  const insights = (data?.highlights ?? []).filter((h) => h.sourceType === 'journal_insight');

  // 日付でグループ化
  const grouped = insights.reduce<Record<string, typeof insights>>((acc, h) => {
    const dateKey = format(h.sourceDate.toDate(), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(h);
    return acc;
  }, {});
  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen bg-zinc-950 pb-24"
    >
      <header className="px-4 py-3 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50">
        <h1 className="text-xl font-bold text-zinc-50">{t('highlights.title')}</h1>
        <p className="text-xs text-zinc-500 mt-0.5">試合後ノートの「気づき」が自動で記録されます</p>
      </header>

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
        ) : insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-6xl opacity-20 mb-4">💡</p>
            <h2 className="text-lg font-semibold text-zinc-300">{t('highlights.emptyTitle')}</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-[280px] whitespace-pre-line">
              試合後ノートの「気づき」欄に記録すると、ここに自動で蓄積されます
            </p>
            <button
              onClick={() => navigate('/journals')}
              className="mt-6 px-6 py-2.5 bg-[var(--color-brand-primary)] text-white rounded-xl text-sm font-medium"
            >
              {t('journals.title')}へ
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {dateKeys.map((dateKey) => (
              <div key={dateKey}>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                  {format(new Date(dateKey), 'yyyy年M月d日（EEE）', { locale: ja })}
                </p>
                <div className="space-y-2">
                  {grouped[dateKey].map((highlight) => (
                    <HighlightCard
                      key={highlight.id}
                      highlight={highlight}
                      variant="full"
                      onPress={(h) => navigate(`/journals/${h.sourceId}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
