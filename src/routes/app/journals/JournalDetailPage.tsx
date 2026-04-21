import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Pin, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { useJournal, useDeleteJournal } from '@/hooks/useMatchJournals';
import { usePinToggle, useHighlights } from '@/hooks/useHighlights';
import { StatusBadge } from '@/components/journals/StatusBadge';
import { GoalReviewItem } from '@/components/journals/GoalReviewItem';
import { SPORT_LABELS } from '@/types/sport';
import type { BulletItem, MatchJournal } from '@/types/matchJournal';
import type { HighlightSourceType } from '@/types/highlight';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

interface PinnedBulletItemProps {
  item: BulletItem;
  isPinned: boolean;
  onPinToggle: () => void;
  showPinButton: boolean;
}

function PinnedBulletItem({ item, isPinned, onPinToggle, showPinButton }: PinnedBulletItemProps) {
  return (
    <div className={`flex items-start gap-2.5 py-2.5 rounded-lg transition-colors ${isPinned ? 'bg-amber-500/10 border-l-2 border-amber-500 pl-2' : ''}`}>
      <p className="text-sm text-zinc-200 leading-relaxed flex-1">
        {isPinned && <span className="mr-1">📌</span>}
        {item.text}
      </p>
      {showPinButton && (
        <motion.button
          type="button"
          onClick={onPinToggle}
          animate={isPinned ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.25 }}
          aria-label={isPinned ? '気づきのかけらから削除' : '気づきのかけらに追加'}
          aria-pressed={isPinned}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs flex-shrink-0 transition-colors ${
            isPinned
              ? 'text-amber-400 bg-amber-400/15 border border-amber-400/30'
              : 'text-zinc-500 bg-zinc-800 border border-zinc-700 hover:text-amber-400 hover:border-amber-400/40'
          }`}
        >
          <Pin size={11} />
          <span>{isPinned ? 'ピン済み' : '保存'}</span>
        </motion.button>
      )}
    </div>
  );
}

function SectionHeader({ icon, title, onEdit }: { icon: string; title: string; onEdit?: () => void }) {
  return (
    <div className="px-4 py-3 flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide flex-1">{title}</h2>
      {onEdit && (
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
        >
          <Pencil size={11} />
          <span>編集</span>
        </button>
      )}
    </div>
  );
}

export function JournalDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: journalId } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.userProfile);
  const group = useGroupStore((s) => s.group);
  const { data: journal, isLoading } = useJournal(journalId);
  const deleteMutation = useDeleteJournal();
  const { pinMutation, unpinMutation } = usePinToggle();
  const { data: highlightsData } = useHighlights(user?.uid);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const highlights = highlightsData?.highlights ?? [];
  const pinnedBulletIds = new Set(highlights.map((h) => h.bulletItemId));

  const handlePinToggle = async (
    item: BulletItem,
    sourceType: HighlightSourceType,
    journal: MatchJournal
  ) => {
    if (!user) return;

    if (pinnedBulletIds.has(item.id)) {
      unpinMutation.mutate({ userId: user.uid, bulletItemId: item.id });
    } else {
      pinMutation.mutate({
        userId: user.uid,
        groupId: group?.id ?? '',
        sport: journal.sport,
        sourceType,
        sourceId: journal.id,
        bulletItem: item,
        sourceDate: journal.date,
      });
    }
  };

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

        {journal.postNote && (
          <div className="flex justify-center items-center gap-4 mt-3">
            <span className="text-5xl font-black text-zinc-50">
              {journal.postNote.myScore ?? '-'}
            </span>
            <span className="text-2xl text-zinc-600">-</span>
            <span className="text-5xl font-black text-zinc-400">
              {journal.postNote.opponentScore ?? '-'}
            </span>
          </div>
        )}
      </div>

      {/* 試合後ノート未記入時のCTA */}
      {journal.status === 'pre' && isOwner && (
        <div className="mx-4 my-4">
          {/* ステップインジケーター */}
          <div className="flex items-center mb-3 gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[11px] font-bold text-zinc-400">1</div>
              <span className="text-xs text-zinc-500 line-through">試合前の目標</span>
            </div>
            <div className="flex-1 h-px bg-[var(--color-brand-primary)]/40 mx-1 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-primary)]/40 to-transparent" />
            </div>
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
              <span className="text-xs text-white/70">結果・できたこと・課題を入力</span>
            </div>
            <span className="text-xl">→</span>
          </motion.button>
        </div>
      )}

      {/* セクション1: 試合前の目標 */}
      {journal.preNote && (
        <div className="mt-4">
          <SectionHeader
            icon="🎯"
            title={t('journals.preGoals')}
            onEdit={isOwner ? () => navigate(`/journals/${journal.id}/edit/pre`) : undefined}
          />
          <div className="px-4 pb-4">
            {journal.preNote.goals.map((item) => (
              <PinnedBulletItem
                key={item.id}
                item={item}
                isPinned={pinnedBulletIds.has(item.id)}
                showPinButton={isOwner}
                onPinToggle={() => handlePinToggle(item, 'journal_pre_goal', journal)}
              />
            ))}
            {journal.preNote.challenges.length > 0 && (
              <>
                <p className="text-xs text-zinc-500 mt-3 mb-1">チャレンジしたいこと</p>
                {journal.preNote.challenges.map((item) => (
                  <PinnedBulletItem
                    key={item.id}
                    item={item}
                    isPinned={pinnedBulletIds.has(item.id)}
                    showPinButton={isOwner}
                    onPinToggle={() => handlePinToggle(item, 'journal_pre_challenge', journal)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* セクション2: 試合後の振り返り */}
      {journal.postNote && (
        <div className="mt-2 border-t border-zinc-800">
          <SectionHeader
            icon="💡"
            title={t('journals.postReview')}
            onEdit={isOwner ? () => navigate(`/journals/${journal.id}/edit/post`) : undefined}
          />
          <div className="px-4 pb-4 space-y-4">
            {/* 目標達成状況 */}
            {journal.preNote && journal.preNote.goals.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">目標の達成状況</p>
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

            {/* できたこと */}
            {journal.postNote.achievements.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">✅ できたこと</p>
                {journal.postNote.achievements.map((item) => (
                  <PinnedBulletItem
                    key={item.id}
                    item={item}
                    isPinned={pinnedBulletIds.has(item.id)}
                    showPinButton={isOwner}
                    onPinToggle={() => handlePinToggle(item, 'journal_post_achievement', journal)}
                  />
                ))}
              </div>
            )}

            {/* できなかったこと */}
            {journal.postNote.improvements.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">📈 できなかったこと / 課題</p>
                {journal.postNote.improvements.map((item) => (
                  <PinnedBulletItem
                    key={item.id}
                    item={item}
                    isPinned={pinnedBulletIds.has(item.id)}
                    showPinButton={isOwner}
                    onPinToggle={() => handlePinToggle(item, 'journal_post_improvement', journal)}
                  />
                ))}
              </div>
            )}

            {/* 探求したいこと */}
            {journal.postNote.explorations.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">🔍 もっと探求したいこと</p>
                {journal.postNote.explorations.map((item) => (
                  <PinnedBulletItem
                    key={item.id}
                    item={item}
                    isPinned={pinnedBulletIds.has(item.id)}
                    showPinButton={isOwner}
                    onPinToggle={() => handlePinToggle(item, 'journal_post_exploration', journal)}
                  />
                ))}
              </div>
            )}

            {/* 自己評価 */}
            {journal.postNote.performance && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">自己評価</p>
                <p className="text-xl text-amber-400">
                  {'★'.repeat(journal.postNote.performance)}
                  <span className="text-zinc-600">{'★'.repeat(5 - journal.postNote.performance)}</span>
                </p>
              </div>
            )}
          </div>
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
