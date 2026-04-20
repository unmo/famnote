import type { JournalStatus } from '@/types/matchJournal';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: JournalStatus;
  size?: 'sm' | 'md';
}

const STATUS_STYLES = {
  pre: {
    label: '振り返り待ち',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-400',
    animate: true,
  },
  completed: {
    label: '振り返り完了',
    className: 'bg-green-500/15 text-green-400 border-green-500/30',
    dotColor: 'bg-green-400',
    animate: false,
  },
  post_only: {
    label: '試合後のみ',
    className: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30',
    dotColor: 'bg-zinc-400',
    animate: false,
  },
} as const;

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <span
      aria-label={`ステータス: ${style.label}`}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        style.className,
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      )}
    >
      {style.animate ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', style.dotColor)} />
          <span className={clsx('relative inline-flex rounded-full h-1.5 w-1.5', style.dotColor)} />
        </span>
      ) : (
        <span className={clsx('inline-flex rounded-full h-1.5 w-1.5', style.dotColor)} />
      )}
      {style.label}
    </span>
  );
}
