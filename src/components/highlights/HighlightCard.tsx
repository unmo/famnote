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
  journal_pre_goal: { label: '試合前 / 目標', badge: 'bg-blue-500/20 text-blue-400' },
  journal_pre_challenge: { label: '試合前 / チャレンジ', badge: 'bg-blue-500/20 text-blue-400' },
  journal_post_achievement: { label: '試合後 / できたこと', badge: 'bg-green-500/20 text-green-400' },
  journal_post_improvement: { label: '試合後 / 課題', badge: 'bg-red-500/20 text-red-400' },
  journal_post_exploration: { label: '試合後 / 探求', badge: 'bg-purple-500/20 text-purple-400' },
  practice_bullet: { label: '練習メモ', badge: 'bg-purple-500/20 text-purple-400' },
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
      <p className="text-base font-medium text-zinc-50 leading-relaxed line-clamp-3">
        {highlight.text}
      </p>

      {/* 出典行 */}
      <p className="mt-2.5 text-xs text-zinc-500 flex items-center gap-1">
        <span>→</span>
        <span>{dateStr} · {sourceInfo.label}</span>
      </p>
    </div>
  );
}
