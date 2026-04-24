import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuthStore } from '@/store/authStore';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useJournal, useDeleteJournal } from '@/hooks/useMatchJournals';
import { StatusBadge } from '@/components/journals/StatusBadge';
import { GoalReviewItem } from '@/components/journals/GoalReviewItem';
import { JournalCommentSection } from '@/components/journals/JournalCommentSection';
import { JournalAccordionBlock } from '@/components/journals/JournalAccordionBlock';
import { JournalStepProgress } from '@/components/journals/JournalStepProgress';
import { SPORT_LABELS } from '@/types/sport';
import { markCommentsAsRead } from '@/lib/firebase/journalCommentService';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function BulletList({ items }: { items: { id: string; text: string }[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <p key={item.id} className="text-sm text-zinc-200 leading-relaxed">{item.text}</p>
      ))}
    </div>
  );
}

export function JournalDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: journalId } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.userProfile);
  // AuthContextでメンバーリストがロードされる前はisManagerが確定しないため、authStore.isLoadingで待機
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const { isManager } = useActiveProfile();
  const { data: journal, isLoading } = useJournal(journalId);
  const deleteMutation = useDeleteJournal();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // isOwner は journal がロード後に確定するが、hooks は早期リターン前に宣言する必要がある
  const isOwner = user?.uid === journal?.userId;
  const markedRef = useRef(false);

  useEffect(() => {
    if (!journalId || !isOwner || !journal) return;
    if (markedRef.current) return;
    if ((journal.unreadCommentCount ?? 0) > 0) {
      markedRef.current = true;
      markCommentsAsRead(journalId).catch(() => {});
    }
  }, [journalId, isOwner, journal]);

  const handleDelete = async () => {
    if (!user || !journalId) return;
    try {
      await deleteMutation.mutateAsync({ journalId, userId: user.uid });
      navigate('/journals');
    } catch {
      // エラーはmutationのonErrorで処理済み
    }
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-[var(--color-brand-primary)] rounded-full animate-spin" role="status" aria-label="読み込み中" />
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">{t('common.error')}</p>
        <button onClick={() => navigate('/journals')} className="text-[var(--color-brand-primary)]">
          {t('common.back')}
        </button>
      </div>
    );
  }

  const dateStr = format(journal.date.toDate(), 'yyyy年M月d日（EEE）', { locale: ja });

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen bg-zinc-950 pb-24"
    >
      {/* スティッキーヘッダー */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50 h-[52px]">
        <button
          onClick={() => navigate('/journals')}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <StatusBadge status={journal.status} />
        {isOwner ? (
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-red-400 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="このジャーナルを削除する"
          >
            削除
          </button>
        ) : (
          <div className="min-w-[44px]" aria-hidden="true" />
        )}
      </header>

      {/* 試合情報ヘッダーカード */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-xl p-5 mx-4 mt-3">
        <div className="flex justify-between items-start mb-3">
          <div className="text-sm text-zinc-500 space-y-0.5">
            <p>{dateStr}</p>
            <p>{SPORT_LABELS[journal.sport]}</p>
            {journal.venue && <p>📍 {journal.venue}</p>}
          </div>
          <StatusBadge status={journal.status} size="md" />
        </div>

        <div className="text-center py-2">
          <p className="text-xs text-zinc-500 mb-1">vs</p>
          <p className="text-xl font-bold text-zinc-50">{journal.opponent}</p>
        </div>

        {journal.postNote?.myScore != null && (
          <div className="text-center mt-2">
            <span className="text-sm text-zinc-400">自分のゴール数: </span>
            <span className="text-xl font-black text-zinc-50">{journal.postNote.myScore}</span>
          </div>
        )}
      </div>

      {/* ステップ進捗インジケーター（オーナーのみ） */}
      {isOwner && (
        <div className="mx-4 my-3">
          <JournalStepProgress
            hasPreNote={!!journal.preNote}
            hasPostNote={!!journal.postNote}
            isOwner={isOwner}
            journalId={journal.id}
            onPostCta={() => navigate(`/journals/${journal.id}/post`)}
          />
        </div>
      )}

      {/* 試合前ブロック（アコーディオン） */}
      {journal.preNote && (
        <div className="mx-4 mt-2">
          <JournalAccordionBlock
            icon="🎯"
            title="試合前の目標"
            defaultOpen={true}
            onEdit={isOwner ? () => navigate(`/journals/${journal.id}/edit/pre`) : undefined}
          >
            <BulletList items={journal.preNote.goals} />
            {journal.preNote.challenges.length > 0 && (
              <>
                <p className="text-xs text-zinc-600 mt-3 mb-1 pt-2 border-t border-zinc-800/60">チャレンジしたいこと</p>
                <BulletList items={journal.preNote.challenges} />
              </>
            )}
          </JournalAccordionBlock>
        </div>
      )}

      {/* 試合後ブロック（アコーディオン） */}
      {journal.postNote && (
        <div className="mx-4 mt-3">
          <JournalAccordionBlock
            icon="📊"
            title="試合後の振り返り"
            defaultOpen={true}
            onEdit={isOwner ? () => navigate(`/journals/${journal.id}/edit/post`) : undefined}
          >
            {/* 目標達成状況（試合前ゴールがある場合のみ） */}
            {journal.preNote && journal.preNote.goals.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  目標の達成状況
                </p>
                {journal.preNote.goals.map((goal) => (
                  <GoalReviewItem
                    key={goal.id}
                    goal={goal}
                    review={journal.postNote?.goalReviews.find((r) => r.goalItemId === goal.id)}
                    readonly
                  />
                ))}
              </div>
            )}

            {/* 気づき */}
            {(journal.postNote.insights ?? []).length > 0 && (
              <div className="border-t border-zinc-800/60 pt-3 mt-3">
                <p className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  💡 気づき
                </p>
                <BulletList items={journal.postNote.insights ?? []} />
              </div>
            )}

            {/* できたこと */}
            {journal.postNote.achievements.length > 0 && (
              <div className="border-t border-zinc-800/60 pt-3 mt-3">
                <p className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  ✅ できたこと
                </p>
                <BulletList items={journal.postNote.achievements} />
              </div>
            )}

            {/* 課題 */}
            {journal.postNote.improvements.length > 0 && (
              <div className="border-t border-zinc-800/60 pt-3 mt-3">
                <p className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  📈 課題
                </p>
                <BulletList items={journal.postNote.improvements} />
              </div>
            )}

            {/* 探求したいこと */}
            {journal.postNote.explorations.length > 0 && (
              <div className="border-t border-zinc-800/60 pt-3 mt-3">
                <p className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  🔍 もっと探求したいこと
                </p>
                <BulletList items={journal.postNote.explorations} />
              </div>
            )}

            {/* 自己評価 */}
            {journal.postNote.performance && (
              <div className="border-t border-zinc-800/60 pt-3 mt-3">
                <p className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  ⭐ 自己評価
                </p>
                <p className="text-xl text-amber-400" aria-label={`自己評価 ${journal.postNote.performance}点`}>
                  {'★'.repeat(journal.postNote.performance)}
                  <span className="text-zinc-700" aria-hidden="true">{'★'.repeat(5 - journal.postNote.performance)}</span>
                </p>
              </div>
            )}
          </JournalAccordionBlock>
        </div>
      )}

      {/* コメントセクション（プロファイルロード完了後に描画） */}
      {journalId && !isAuthLoading && (
        <div className="mx-4 mt-4">
          <JournalCommentSection
            journalId={journalId}
            isManager={isManager}
          />
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-zinc-50 mb-2">このジャーナルを削除しますか？</h3>
            <p className="text-sm text-zinc-400 mb-6">
              このジャーナルを削除すると、試合後ノートとすべての写真も削除されます。この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 bg-zinc-800 text-zinc-200 rounded-lg py-2.5 text-sm font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
