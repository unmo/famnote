import { AnimatePresence } from 'motion/react';
import { motion } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { useJournalComments, useDeleteJournalComment } from '@/hooks/useJournalComments';
import { JournalCommentItem } from './JournalCommentItem';
import { JournalCommentForm } from './JournalCommentForm';

interface JournalCommentSectionProps {
  journalId: string;
  /** 管理者（親）かどうか */
  isManager: boolean;
}

const sectionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const listVariants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

/**
 * コメントセクション全体のコンテナ
 * コメント一覧・空状態・スケルトン・管理者フォームをまとめる
 */
export function JournalCommentSection({
  journalId,
  isManager,
}: JournalCommentSectionProps) {
  const user = useAuthStore((s) => s.firebaseUser);
  const { comments, isLoading } = useJournalComments(journalId);
  const deleteComment = useDeleteJournalComment();

  const handleDelete = (commentId: string) => {
    if (!user) return;
    deleteComment.mutate({ journalId, commentId, userId: user.uid });
  };

  return (
    <motion.section
      aria-label="親からのコメント"
      aria-live="polite"
      aria-relevant="additions"
      variants={sectionVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mx-4 mt-3 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
        <span className="text-base" aria-hidden="true">💬</span>
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex-1">
          親からのコメント
        </h2>
        {comments.length > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
            {comments.length}
          </span>
        )}
      </div>

      {/* コメント一覧 / ローディング / 空状態 */}
      {isLoading ? (
        <SkeletonComments />
      ) : comments.length === 0 ? (
        <EmptyState isManager={isManager} />
      ) : (
        <motion.div
          variants={listVariants}
          animate="animate"
          className="divide-y divide-zinc-800/40"
        >
          <AnimatePresence>
            {comments.map((comment) => (
              <JournalCommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.uid ?? ''}
                onDelete={handleDelete}
                isDeleting={
                  deleteComment.isPending &&
                  deleteComment.variables?.commentId === comment.id
                }
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 管理者向け入力フォーム */}
      {isManager && (
        <div className="border-t border-zinc-800/60">
          <JournalCommentForm journalId={journalId} />
        </div>
      )}
    </motion.section>
  );
}

/** スケルトンローダー（コメント2件分） */
function SkeletonComments() {
  return (
    <div className="divide-y divide-zinc-800/40">
      {[0, 1].map((i) => (
        <div key={i} className="px-4 py-3 flex items-start gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-zinc-800 rounded" />
              <div className="h-3 w-6 bg-zinc-800 rounded" />
            </div>
            <div className="h-3 w-full bg-zinc-800 rounded" />
            <div className="h-3 w-3/4 bg-zinc-800 rounded" />
            <div className="h-2.5 w-12 bg-zinc-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** 空状態表示 */
function EmptyState({ isManager }: { isManager: boolean }) {
  return (
    <div className="py-6 flex flex-col items-center gap-2 text-center">
      <span className={`text-2xl ${isManager ? 'opacity-50' : 'opacity-40'}`}>💬</span>
      <p className={`text-sm ${isManager ? 'text-zinc-500' : 'text-zinc-600'}`}>
        まだコメントはありません
      </p>
      {isManager && (
        <p className="text-xs text-zinc-600">最初のコメントを送りましょう！</p>
      )}
    </div>
  );
}
