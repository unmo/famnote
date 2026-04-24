import { motion } from 'motion/react';
import { Crown, Trash2 } from 'lucide-react';
import { format, isToday } from 'date-fns';
import type { JournalComment } from '@/types/matchJournal';

interface JournalCommentItemProps {
  comment: JournalComment;
  /** 自分のコメントか判定するための現在のユーザーID */
  currentUserId: string;
  onDelete: (commentId: string) => void;
  isDeleting?: boolean;
}

export const itemVariants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8 },
};

/**
 * コメント1件の表示コンポーネント
 * 管理者（role=parent）には Crown バッジとアンバーアクセントを適用する
 */
export function JournalCommentItem({
  comment,
  currentUserId,
  onDelete,
  isDeleting = false,
}: JournalCommentItemProps) {
  const isParent = comment.role === 'parent';
  const isOwn = currentUserId === comment.userId;

  // createdAt が Timestamp の場合はtoDate()で変換
  const createdDate = comment.createdAt?.toDate?.() ?? new Date();
  const timeStr = isToday(createdDate)
    ? format(createdDate, 'HH:mm')
    : format(createdDate, 'M月d日 HH:mm');

  // イニシャル（日本語・英語両対応）
  const initial = comment.displayName ? Array.from(comment.displayName)[0] : '?';

  return (
    <motion.article
      variants={itemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      aria-label={`${comment.displayName}さんのコメント: ${comment.text}（${timeStr}）`}
      className={`px-4 py-3 flex items-start gap-3 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* アバター */}
      <div className="relative flex-shrink-0">
        {comment.avatarUrl ? (
          <img
            src={comment.avatarUrl}
            alt={comment.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              isParent
                ? 'bg-amber-900/40 text-amber-300'
                : 'bg-zinc-700 text-zinc-300'
            }`}
          >
            {initial}
          </div>
        )}
        {/* 管理者バッジ（Crown アイコン） */}
        {isParent && (
          <span className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5">
            <Crown size={10} className="text-amber-900" />
          </span>
        )}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 min-w-0">
        {/* 表示名行 */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-zinc-100 truncate">
            {comment.displayName}
          </span>
          {isParent && (
            <span className="text-[10px] text-amber-500 flex-shrink-0">親</span>
          )}
        </div>

        {/* コメント本文（XSS対策: JSXテキストノードで描画） */}
        <p
          className={`mt-1 text-sm leading-relaxed break-all ${
            isParent ? 'text-zinc-100' : 'text-zinc-200'
          }`}
        >
          {comment.text}
        </p>

        {/* タイムスタンプ */}
        <p className="mt-1 text-[11px] text-zinc-600">{timeStr}</p>
      </div>

      {/* 削除ボタン（自分のコメントのみ） */}
      {isOwn && (
        <button
          type="button"
          onClick={() => onDelete(comment.id)}
          aria-label="コメントを削除"
          disabled={isDeleting}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
            isDeleting ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          {isDeleting ? (
            <div className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      )}
    </motion.article>
  );
}
