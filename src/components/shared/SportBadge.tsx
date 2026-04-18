import { clsx } from 'clsx';
import { SPORT_LABELS, SPORT_EMOJIS, SPORT_COLORS, type Sport } from '@/types/sport';

interface SportBadgeProps {
  sport: Sport;
  size?: 'sm' | 'md';
  className?: string;
}

// スポーツバッジコンポーネント
export function SportBadge({ sport, size = 'md', className }: SportBadgeProps) {
  const colors = SPORT_COLORS[sport];
  const label = SPORT_LABELS[sport];
  const emoji = SPORT_EMOJIS[sport];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        'bg-zinc-800 border',
        colors.border,
        colors.text,
        className
      )}
    >
      <span aria-hidden="true">{emoji}</span>
      {label}
    </span>
  );
}
