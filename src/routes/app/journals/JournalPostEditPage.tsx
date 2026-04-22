import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useJournal, useUpdatePostMatchNote } from '@/hooks/useMatchJournals';
import { BulletListInput } from '@/components/journals/BulletListInput';
import { GoalReviewItem } from '@/components/journals/GoalReviewItem';
import type { GoalReview } from '@/types/matchJournal';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function JournalPostEditPage() {
  const navigate = useNavigate();
  const { id: journalId } = useParams<{ id: string }>();
  const { activeProfile } = useActiveProfile();
  const { data: journal, isLoading } = useJournal(journalId);
  const updateMutation = useUpdatePostMatchNote();

  const [myGoals, setMyGoals] = useState<string>('');
  const [goalReviews, setGoalReviews] = useState<GoalReview[]>([]);
  const [achievements, setAchievements] = useState<string[]>(['']);
  const [improvements, setImprovements] = useState<string[]>(['']);
  const [explorations, setExplorations] = useState<string[]>(['']);
  const [insights, setInsights] = useState<string[]>(['']);
  const [performance, setPerformance] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (!journal?.postNote) return;
    const p = journal.postNote;
    setMyGoals(p.myScore != null ? String(p.myScore) : '');
    setGoalReviews(p.goalReviews ?? []);
    setAchievements(p.achievements.map((a) => a.text) || ['']);
    setImprovements(p.improvements.map((i) => i.text) || ['']);
    setExplorations(p.explorations.map((e) => e.text) || ['']);
    setInsights((p.insights ?? []).map((i) => i.text) || ['']);
    setPerformance(p.performance as 1 | 2 | 3 | 4 | 5 | null);
    setIsPublic(journal.isPublic);
  }, [journal]);

  const handleGoalReviewChange = (review: GoalReview) => {
    setGoalReviews((prev) => {
      const idx = prev.findIndex((r) => r.goalItemId === review.goalItemId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = review;
        return next;
      }
      return [...prev, review];
    });
  };

  const handleSubmit = async () => {
    if (!activeProfile || !journalId) {
      toast.error('プロフィールが選択されていません');
      return;
    }
    try {
      await updateMutation.mutateAsync({
        journalId,
        userId: activeProfile.uid,
        data: {
          result: null,
          myScore: myGoals !== '' ? Number(myGoals) : null,
          opponentScore: null,
          goalReviews,
          achievements: achievements.filter((a) => a.trim()),
          improvements: improvements.filter((i) => i.trim()),
          explorations: explorations.filter((e) => e.trim()),
          insights: insights.filter((i) => i.trim()),
          performance,
          isPublic,
        },
      });
      navigate(`/journals/${journalId}`);
    } catch {
      // エラーはmutationのonErrorで処理済み
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-[var(--color-brand-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen bg-zinc-950 pb-32"
    >
      <header className="flex items-center gap-3 px-4 py-3 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50">
        <button
          onClick={() => navigate(-1)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-100"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-zinc-50">振り返りを編集</h1>
      </header>

      {journal && (
        <div className="mx-4 mt-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <p className="text-sm text-zinc-400">
            📅 {journal.date.toDate().toLocaleDateString('ja-JP')} vs {journal.opponent}
          </p>
        </div>
      )}

      <div className="px-4 py-4 space-y-6">
        {/* 自身のゴール数 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">自身のゴール数</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={myGoals}
              onChange={(e) => setMyGoals(e.target.value)}
              placeholder="0"
              className="w-24 text-center text-xl font-bold bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 text-zinc-50 focus:border-[var(--color-brand-primary)] focus:outline-none"
            />
            <span className="text-sm text-zinc-500">ゴール</span>
          </div>
        </div>

        {/* 目標の振り返り */}
        {journal?.preNote && journal.preNote.goals.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">目標の達成状況</label>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4">
              {journal.preNote.goals.map((goal) => (
                <GoalReviewItem
                  key={goal.id}
                  goal={goal}
                  review={goalReviews.find((r) => r.goalItemId === goal.id)}
                  onChange={handleGoalReviewChange}
                />
              ))}
            </div>
          </div>
        )}

        {/* できたこと */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">✅ できたこと</label>
          <BulletListInput value={achievements} onChange={setAchievements} maxItems={10} placeholder="例: 積極的にシュートを打てた" />
        </div>

        {/* できなかったこと */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">📈 できなかったこと / 課題</label>
          <BulletListInput value={improvements} onChange={setImprovements} maxItems={10} placeholder="例: 守備の切り替えが遅かった" />
        </div>

        {/* もっと探求したいこと */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">🔍 もっと探求したいこと</label>
          <BulletListInput value={explorations} onChange={setExplorations} maxItems={5} placeholder="例: 次は左足のシュートも試したい" />
        </div>

        {/* 気づき */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">💡 気づき <span className="text-zinc-500 text-xs">（気づきのかけらに自動保存）</span></label>
          <BulletListInput value={insights} onChange={setInsights} maxItems={10} placeholder="例: 体の向きを変えるとパスコースが増える" />
        </div>

        {/* 自己評価 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">自己評価</label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((star) => (
              <motion.button
                key={star}
                type="button"
                onClick={() => setPerformance(performance === star ? null : star)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`text-2xl cursor-pointer ${
                  performance !== null && star <= performance ? 'text-amber-400' : 'text-zinc-600'
                }`}
              >
                ★
              </motion.button>
            ))}
          </div>
        </div>

        {/* 公開設定 */}
        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <div>
            <p className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <span>🌏</span> 家族に公開する
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">家族グループのメンバーが見られます</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => setIsPublic(!isPublic)}
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${isPublic ? 'bg-[var(--color-brand-primary)]' : 'bg-zinc-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 px-4 py-3 flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex-1 bg-zinc-800 text-zinc-100 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-700"
        >
          キャンセル
        </button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={updateMutation.isPending}
          onClick={handleSubmit}
          className="flex-[2] bg-[var(--color-brand-primary)] text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-40"
        >
          {updateMutation.isPending ? '保存中...' : '更新する'}
        </motion.button>
      </div>
    </motion.div>
  );
}
