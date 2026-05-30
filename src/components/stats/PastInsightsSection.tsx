import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HighlightCard } from '@/components/highlights/HighlightCard';
import type { PastInsightItem } from '@/hooks/usePastInsights';

interface PastInsightsSectionProps {
  insights: PastInsightItem[];
  isLoading: boolean;
}

/** ラベルに応じたバッジスタイルを返す */
function getBadgeClass(label: '1ヶ月前' | '3ヶ月前' | '6ヶ月前'): string {
  switch (label) {
    case '1ヶ月前':
      return 'bg-green-500/15 text-green-400 border border-green-500/30';
    case '3ヶ月前':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case '6ヶ月前':
      return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
  }
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

/** 過去の自分からセクション（HighlightCard × 最大3枚） */
export function PastInsightsSection({
  insights,
  isLoading,
}: PastInsightsSectionProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-green-400 to-amber-400" />
          <h2 className="text-base font-bold text-zinc-200">過去の自分から</h2>
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 w-16 bg-zinc-700 rounded-full mb-3" />
              <div className="h-4 bg-zinc-700 rounded w-full mb-2" />
              <div className="h-4 bg-zinc-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 候補なしはセクション非表示
  if (insights.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-green-400 to-amber-400" />
        <h2 className="text-base font-bold text-zinc-200">過去の自分から</h2>
        <p className="text-xs text-zinc-500">あの日の気づきを振り返ろう</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {insights.map((item) => (
          <motion.div key={item.highlight.id} variants={itemVariants}>
            <div className="relative">
              <div className="mb-1.5 ml-1">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${getBadgeClass(item.label)}`}
                >
                  <Clock className="w-3 h-3" />
                  {item.label}
                </span>
              </div>
              <HighlightCard
                highlight={item.highlight}
                variant="full"
                onPress={(h) =>
                  h.sourceType === 'note_insight'
                    ? navigate(`/notes/${h.sourceId}`)
                    : navigate(`/journals/${h.sourceId}`)
                }
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
