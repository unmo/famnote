import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuthStore } from '@/store/authStore';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useJournal, useDeleteJournal } from '@/hooks/useMatchJournals';
import { StatusBadge } from '@/components/journals/StatusBadge';
import { GoalReviewItem } from '@/components/journals/GoalReviewItem';
import { JournalCommentSection } from '@/components/journals/JournalCommentSection';
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
  const { isManager } = useActiveProfile();
  const { data: journal, isLoading } = useJournal(journalId);
  const deleteMutation = useDeleteJournal();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
  const isOwner = user?.uid === journal.userId;

  // ジャーナルオーナーが詳細ページを開いたときに未読コメントをリセット
  useEffect(() => {
    if (!journalId || !isOwner || !journal) return;
    if ((journal.unreadCommentCount ?? 0) > 0) {
      markCommentsAsRead(journalId).catch(() => {
        // 既読処理の失敗はサイレントに無視（UXをブロックしない）
      });
    }
  // isOwner は journal.userId と user.uid から導出されるため journal を依存に含める
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId, isOwner, journal?.unreadCommentCount, journal?.userId]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen bg-zinc-950 pb-8"
    >
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50">
        <button
          onClick={() => navigate('/journals')}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-100"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={22} />
        </button>
        <StatusBadge status={journal.status} />
        {isOwner && (
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-red-400 text-xs"
          >
            削除
          </button>
        )}
      </header>

      {/* ヘッダーカード */}
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

      {/* 試合後ノート未記入時のCTA */}
      {journal.status === 'pre' && isOwner && (
        <div className="mx-4 my-4">
          <div className="flex items-center mb-3 gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[11px] font-bold text-zinc-400">1</div>
              <span className="text-xs text-zinc-500 line-through">試合前の目標</span>
            </div>
            <div className="flex-1 h-px bg-[var(--color-brand-primary)]/40 mx-1" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center text-[11px] font-bold text-white animate-pulse">2</div>
              <span className="text-xs font-medium text-[var(--color-brand-primary)]">試合後の振り返り</span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/journals/${journal.id}/post`)}
            className="w-full bg-[var(--color-brand-primary)] text-white rounded-xl px-5 py-4 text-sm font-semibold flex items-center justify-between"
          >
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-base font-bold">試合の振り返りを記録</span>
              <span className="text-xs text-white/70">気づき・できたこと・課題を入力</span>
            </div>
            <span className="text-xl">→</span>
          </motion.button>
        </div>
      )}

      {/* セクション1: 試合前の目標 */}
      {journal.preNote && (
        <div className="mx-4 mt-3 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
            <span>🎯</span>
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex-1">{t('journals.preGoals')}</h2>
            {isOwner && (
              <button onClick={() => navigate(`/journals/${journal.id}/edit/pre`)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 hover:text-zinc-200 transition-colors">
                <Pencil size={11} />編集
              </button>
            )}
          </div>
          <div className="px-4 py-3 space-y-1">
            <BulletList items={journal.preNote.goals} />
            {journal.preNote.challenges.length > 0 && (
              <>
                <p className="text-xs text-zinc-600 mt-3 mb-1 pt-2 border-t border-zinc-800/60">チャレンジしたいこと</p>
                <BulletList items={journal.preNote.challenges} />
              </>
            )}
          </div>
        </div>
      )}

      {/* セクション2: 試合後の振り返り */}
      {journal.postNote && (
        <div className="mx-4 mt-3 space-y-3">
          {/* 目標達成状況 */}
          {journal.preNote && journal.preNote.goals.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
                <span>📊</span>
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex-1">目標の達成状況</h2>
                {isOwner && (
                  <button onClick={() => navigate(`/journals/${journal.id}/edit/post`)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 hover:text-zinc-200 transition-colors">
                    <Pencil size={11} />編集
                  </button>
                )}
              </div>
              <div className="px-4 py-3">
                {journal.preNote.goals.map((goal) => (
                  <GoalReviewItem key={goal.id} goal={goal} review={journal.postNote?.goalReviews.find((r) => r.goalItemId === goal.id)} readonly />
                ))}
              </div>
            </div>
          )}

          {/* 気づき */}
          {(journal.postNote.insights ?? []).length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
                <span>💡</span>
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">気づき</h2>
              </div>
              <div className="px-4 py-3 space-y-1">
                <BulletList items={journal.postNote.insights ?? []} />
              </div>
            </div>
          )}

          {/* できたこと */}
          {journal.postNote.achievements.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
                <span>✅</span>
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">できたこと</h2>
              </div>
              <div className="px-4 py-3 space-y-1">
                <BulletList items={journal.postNote.achievements} />
              </div>
            </div>
          )}

          {/* できなかったこと */}
          {journal.postNote.improvements.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
                <span>📈</span>
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">できなかったこと / 課題</h2>
              </div>
              <div className="px-4 py-3 space-y-1">
                <BulletList items={journal.postNote.improvements} />
              </div>
            </div>
          )}

          {/* 探求したいこと */}
          {journal.postNote.explorations.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
                <span>🔍</span>
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">もっと探求したいこと</h2>
              </div>
              <div className="px-4 py-3 space-y-1">
                <BulletList items={journal.postNote.explorations} />
              </div>
            </div>
          )}

          {/* 自己評価 */}
          {journal.postNote.performance && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
                <span>⭐</span>
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">自己評価</h2>
              </div>
              <div className="px-4 py-3">
                <p className="text-xl text-amber-400">
                  {'★'.repeat(journal.postNote.performance)}
                  <span className="text-zinc-700">{'★'.repeat(5 - journal.postNote.performance)}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* コメントセクション */}
      {journalId && (
        <JournalCommentSection
          journalId={journalId}
          isManager={isManager}
        />
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
