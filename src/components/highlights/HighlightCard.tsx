import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { clsx } from 'clsx';
import type { Highlight, HighlightSourceType } from '@/types/highlight';

interface HighlightCardProps {
  highlight: Highlight;
  onPress?: (highlight: Highlight) => void;
  variant?: 'full' | 'mini';
}

const SOURCE_TYPE_LABELS: Record<HighlightSourceType, { label: string; badge: string }> = {
  // アクティブなsourceType（鮮やかバッジ）
  journal_insight: { label: '試合の気づき', badge: 'bg-amber-500/20 text-amber-400' },
  note_insight: { label: '練習の気づき', badge: 'bg-amber-500/20 text-amber-400' },
  practice_bullet: { label: '練習メモ', badge: 'bg-purple-500/20 text-purple-400' },
  // 過去データ互換（薄いグレーバッジ）
  journal_pre_goal: { label: '試合メモ（過去データ）', badge: 'bg-zinc-700/50 text-zinc-500' },
  journal_pre_challenge: { label: '試合メモ（過去データ）', badge: 'bg-zinc-700/50 text-zinc-500' },
  journal_post_achievement: { label: '試合メモ（過去データ）', badge: 'bg-zinc-700/50 text-zinc-500' },
  journal_post_improvement: { label: '試合メモ（過去データ）', badge: 'bg-zinc-700/50 text-zinc-500' },
  journal_post_exploration: { label: '試合メモ（過去データ）', badge: 'bg-zinc-700/50 text-zinc-500' },
};

export function HighlightCard({ highlight, onPress, variant = 'full' }: HighlightCardProps) {
  const dateStr = format(highlight.sourceDate.toDate(), 'M/d', { locale: ja });
  const sourceInfo = SOURCE_TYPE_LABELS[highlight.sourceType];

  if (variant === 'mini') {
    return (
      <div
        onClick={() => onPress?.(highlight)}
        className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 cursor-pointer hover:border-amber-500/30 transition-colors duration-150"
      >
        <p className="text-sm text-zinc-200 line-clamp-2">
          <span className="text-amber-400 text-xs mr-1.5">📌</span>
          {highlight.text}
        </p>
        <p className="text-xs text-zinc-600 mt-1">{dateStr} · {sourceInfo.label}</p>
      </div>
    );
  }

  return (
    <div
      onClick={() => onPress?.(highlight)}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-amber-500/30 transition-colors duration-150 cursor-pointer"
    >
      {/* ヘッダー行 */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">📌</span>
          <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', sourceInfo.badge)}>
            {sourceInfo.label}
          </span>
        </div>
        <span className="text-xs text-zinc-500">{dateStr}</span>
      </div>

      {/* テキスト本体 */}
      <p className="text-[15px] font-medium text-zinc-50 leading-relaxed line-clamp-3">
        {highlight.text}
      </p>

      {/* 出典行: sourceIdがある場合のみ元のジャーナルへの参照を表示 */}
      {highlight.sourceId && (
        <p className="mt-2 text-xs text-zinc-500 flex items-center gap-1">
          <span className="text-zinc-600" aria-hidden="true">→</span>
          <span>元のジャーナルを見る</span>
        </p>
      )}
    </div>
  );
}
