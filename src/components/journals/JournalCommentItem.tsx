import { motion } from 'motion/react';
import { Crown, Trash2 } from 'lucide-react';
import { format, isToday } from 'date-fns';
import type { JournalComment } from '@/types/matchJournal';

interface JournalCommentItemProps {
  comment: JournalComment;
  currentUserId: string;
  onDelete: (commentId: string) => void;
  isDeleting?: boolean;
}

export const itemVariants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8 },
};

export function JournalCommentItem({
  comment,
  currentUserId,
  onDelete,
  isDeleting = false,
}: JournalCommentItemProps) {
  const isParent = comment.role === 'parent';
  const isOwn = currentUserId === comment.userId;

  const createdDate = comment.createdAt?.toDate?.() ?? new Date();
  const timeStr = isToday(createdDate)
    ? format(createdDate, 'HH:mm')
    : format(createdDate, 'M月d日 HH:mm');

  const initial = comment.displayName ? Array.from(comment.displayName)[0] : '?';

  return (
    <motion.article
      variants={itemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      aria-label={`${comment.displayName}さんのコメント: ${comment.text}（${timeStr}）`}
      className={`px-4 py-3 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* 送信者ヘッダー */}
      <div className="flex items-center gap-2 mb-2">
        {/* アバター */}
        <div className="relative flex-shrink-0">
          {comment.avatarUrl ? (
            <img
              src={comment.avatarUrl}
              alt={comment.displayName}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isParent ? 'bg-amber-900/50 text-amber-300' : 'bg-zinc-700 text-zinc-300'
              }`}
            >
              {initial}
            </div>
          )}
          {isParent && (
            <span className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5">
              <Crown size={8} className="text-amber-900" />
            </span>
          )}
        </div>

        {/* 表示名 + 役割バッジ */}
        <span className={`text-sm font-bold ${isParent ? 'text-amber-300' : 'text-zinc-200'}`}>
          {comment.displayName}
        </span>
        {isParent ? (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-800/50 flex items-center gap-0.5">
            <Crown size={8} />管理者
          </span>
        ) : (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">
            メンバー
          </span>
        )}

        <span className="text-[11px] text-zinc-600 ml-auto">{timeStr}</span>

        {/* 削除ボタン */}
        {isOwn && (
          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            aria-label="コメントを削除"
            disabled={isDeleting}
            className="min-w-[32px] min-h-[32px] flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <div className="w-3 h-3 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
        )}
      </div>

      {/* コメント本文 */}
      <div
        className={`ml-9 rounded-xl rounded-tl-sm px-3 py-2.5 text-sm leading-relaxed break-all ${
          isParent
            ? 'bg-amber-950/40 border border-amber-900/30 text-zinc-100'
            : 'bg-zinc-800/60 border border-zinc-700/40 text-zinc-200'
        }`}
      >
        {comment.text}
      </div>
    </motion.article>
  );
}
