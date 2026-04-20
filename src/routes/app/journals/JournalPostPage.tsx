import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useAddPostMatchNote } from '@/hooks/useMatchJournals';
import { useJournal } from '@/hooks/useMatchJournals';
import { BulletListInput } from '@/components/journals/BulletListInput';
import { GoalReviewItem } from '@/components/journals/GoalReviewItem';
import type { GoalReview } from '@/types/matchJournal';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

type MatchResult = 'win' | 'draw' | 'loss';

const RESULT_STYLES: Record<MatchResult, { label: string; selected: string }> = {
  win: { label: '勝', selected: 'bg-green-500/20 border-green-500 text-green-400' },
  draw: { label: '分', selected: 'bg-zinc-700/50 border-zinc-500 text-zinc-300' },
  loss: { label: '負', selected: 'bg-red-500/20 border-red-500 text-red-400' },
};

export function JournalPostPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: journalId } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.userProfile);
  const { data: journal } = useJournal(journalId);
  const addPostMutation = useAddPostMatchNote();

  const [result, setResult] = useState<MatchResult | null>(null);
  const [myScore, setMyScore] = useState<string>('');
  const [opponentScore, setOpponentScore] = useState<string>('');
  const [goalReviews, setGoalReviews] = useState<GoalReview[]>([]);
  const [achievements, setAchievements] = useState<string[]>(['']);
  const [improvements, setImprovements] = useState<string[]>(['']);
  const [explorations, setExplorations] = useState<string[]>(['']);
  const [performance, setPerformance] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  const handleGoalReviewChange = (review: GoalReview) => {
    setGoalReviews((prev) => {
      const existing = prev.findIndex((r) => r.goalItemId === review.goalItemId);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = review;
        return next;
      }
      return [...prev, review];
    });
  };

  const handleSubmit = async () => {
    if (!user || !journalId) {
      toast.error('ユーザー情報が取得できません');
      return;
    }

    try {
      await addPostMutation.mutateAsync({
        journalId,
        userId: user.uid,
        data: {
          result,
          myScore: myScore !== '' ? Number(myScore) : null,
          opponentScore: opponentScore !== '' ? Number(opponentScore) : null,
          goalReviews,
          achievements: achievements.filter((a) => a.trim()),
          improvements: improvements.filter((i) => i.trim()),
          explorations: explorations.filter((e) => e.trim()),
          performance,
          isPublic,
        },
      });
      navigate(`/journals/${journalId}`);
    } catch {
      // エラーはmutationのonErrorで処理済み
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen bg-zinc-950 pb-32"
    >
      {/* ヘッダー */}
      <header className="flex items-center gap-3 px-4 py-3 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50">
        <button
          onClick={() => navigate(-1)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-100"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-zinc-50">{t('journals.postTitle')}</h1>
      </header>

      {/* 試合情報サマリー */}
      {journal && (
        <div className="mx-4 mt-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <p className="text-sm text-zinc-400">
            📅 {journal.date.toDate().toLocaleDateString('ja-JP')} vs {journal.opponent}
          </p>
        </div>
      )}

      <div className="px-4 py-4 space-y-6">
        {/* 試合結果 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">{t('journals.result')}</label>
          <div className="flex gap-3">
            {(Object.keys(RESULT_STYLES) as MatchResult[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setResult(r)}
                className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all duration-150 ${
                  result === r
                    ? RESULT_STYLES[r].selected
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
              >
                {RESULT_STYLES[r].label}
              </button>
            ))}
          </div>
        </div>

        {/* スコア */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">{t('journals.score')}</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={myScore}
              onChange={(e) => setMyScore(e.target.value)}
              placeholder="0"
              className="w-24 text-center text-xl font-bold bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 text-zinc-50 focus:border-[var(--color-brand-primary)] focus:outline-none"
            />
            <span className="text-zinc-600 text-xl font-bold">-</span>
            <input
              type="number"
              min="0"
              value={opponentScore}
              onChange={(e) => setOpponentScore(e.target.value)}
              placeholder="0"
              className="w-24 text-center text-xl font-bold bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 text-zinc-50 focus:border-[var(--color-brand-primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* 目標の振り返り */}
        {journal?.preNote && journal.preNote.goals.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{t('journals.goalReview')}</label>
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
          <label className="text-sm font-medium text-zinc-300">{t('journals.achievements')}</label>
          <BulletListInput
            value={achievements}
            onChange={setAchievements}
            maxItems={10}
            placeholder="例: 積極的にシュートを打てた"
          />
        </div>

        {/* できなかったこと/課題 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">{t('journals.improvements')}</label>
          <BulletListInput
            value={improvements}
            onChange={setImprovements}
            maxItems={10}
            placeholder="例: 守備の切り替えが遅かった"
          />
        </div>

        {/* もっと探求したいこと */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">{t('journals.explorations')}</label>
          <BulletListInput
            value={explorations}
            onChange={setExplorations}
            maxItems={5}
            placeholder="例: 次は左足のシュートも試したい"
          />
        </div>

        {/* 自己評価 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">{t('journals.performance')}</label>
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
              <span>🌏</span> {t('notes.isPublic')}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">家族グループのメンバーが見られます</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label="家族に公開する"
            onClick={() => setIsPublic(!isPublic)}
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${isPublic ? 'bg-[var(--color-brand-primary)]' : 'bg-zinc-700'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </div>

      {/* 固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 px-4 py-3 flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex-1 bg-zinc-800 text-zinc-100 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-700"
        >
          {t('common.cancel')}
        </button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={addPostMutation.isPending}
          onClick={handleSubmit}
          aria-busy={addPostMutation.isPending}
          className="flex-[2] bg-[var(--color-brand-primary)] text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {addPostMutation.isPending ? t('common.saving') : t('journals.savePost')}
        </motion.button>
      </div>
    </motion.div>
  );
}
