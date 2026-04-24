import { AnimatePresence } from 'motion/react';
import { motion } from 'motion/react';

interface UnreadCommentBadgeProps {
  count: number;
}

/**
 * MatchJournalCard の右上に表示する未読コメント件数バッジ
 * count が 0 の場合はレンダリングしない
 */
export function UnreadCommentBadge({ count }: UnreadCommentBadgeProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          aria-label={`未読コメント ${count}件`}
          role="status"
          className="absolute -top-1.5 -right-1.5 z-10 rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-[10px] font-bold text-white tabular-nums"
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
