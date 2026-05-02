import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useCreatePreMatchNote } from '@/hooks/useMatchJournals';
import { BulletListInput } from '@/components/journals/BulletListInput';
import { preMatchSchema } from '@/lib/validations/matchJournalSchema';
import type { Sport } from '@/types/sport';
import { format } from 'date-fns';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function JournalPrePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.userProfile);
  const group = useGroupStore((s) => s.group);
  const { activeProfile } = useActiveProfile();
  const createMutation = useCreatePreMatchNote();

  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const sport = (user?.sports[0] ?? 'soccer') as Sport;
  const [opponent, setOpponent] = useState('');
  const [venue, setVenue] = useState('');
  const [goals, setGoals] = useState<string[]>(['']);
  const [challenges, setChallenges] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const formData = {
      sport,
      date,
      opponent: opponent.trim(),
      venue: venue.trim() || null,
      goals: goals.filter((g) => g.trim()),
      challenges: challenges.filter((c) => c.trim()),
      isPublic: true,
    };

    const result = preMatchSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0]?.toString() ?? 'general'] = e.message;
      });
      setErrors(fieldErrors);
      toast.error('入力内容を確認してください');
      return;
    }

    if (!activeProfile) {
      toast.error('プロフィールが選択されていません');
      return;
    }

    // グループ未参加でも個人ノートとして保存できる
    const groupId = group?.id ?? user?.groupId ?? null;

    try {
      const { journalId } = await createMutation.mutateAsync({
        userId: activeProfile.uid,
        groupId,
        data: result.data,
      });
      navigate(`/journals/${journalId}`);
    } catch (err) {
      console.error('[JournalPrePage] createPreMatchNote failed:', err);
      toast.error('保存に失敗しました。再試行してください');
    }
  };

  return (
    <>
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen bg-zinc-950 pb-32"
    >
      {/* ヘッダー */}
      <header className="sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-100"
            aria-label={t('common.back')}
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold text-zinc-50">{t('journals.preTitle')}</h1>
        </div>
        {/* ステップインジケーター */}
        <div className="flex items-center px-4 pb-3 gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center text-[11px] font-bold text-white">1</div>
            <span className="text-xs font-medium text-[var(--color-brand-primary)]">試合前の目標</span>
          </div>
          <div className="flex-1 h-px bg-zinc-700 mx-1" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[11px] font-bold text-zinc-500">2</div>
            <span className="text-xs text-zinc-600">試合後の振り返り</span>
          </div>
        </div>
      </header>

      {/* フォーム */}
      <div className="px-4 py-4 space-y-6">
        {/* 日付 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">{t('journals.date')}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none"
          />
        </div>

        {/* 対戦相手 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">{t('journals.opponent')}</label>
          <div className="relative">
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value.slice(0, 50))}
              placeholder="例: ○○FC"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none placeholder:text-zinc-600 pr-14"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
              {opponent.length}/50
            </span>
          </div>
          {errors.opponent && (
            <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.opponent}</p>
          )}
        </div>

        {/* 会場（任意） */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">{t('journals.venue')} <span className="text-zinc-500 text-xs">（任意）</span></label>
          <div className="relative">
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value.slice(0, 50))}
              placeholder="省略可"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none placeholder:text-zinc-600 pr-14"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
              {venue.length}/50
            </span>
          </div>
        </div>

        {/* 今日の目標 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">{t('journals.goals')}</label>
          <p className="text-xs text-zinc-500">{t('journals.goalsHint')}</p>
          <BulletListInput
            value={goals}
            onChange={setGoals}
            maxItems={10}
            placeholder="例: シュートを積極的に狙う"
          />
          {errors.goals && (
            <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.goals}</p>
          )}
        </div>

        {/* チャレンジしたいこと */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">
            {t('journals.challenges')} <span className="text-zinc-500 text-xs">（任意）</span>
          </label>
          <BulletListInput
            value={challenges}
            onChange={setChallenges}
            maxItems={5}
            placeholder="例: 左足でのシュートを試す"
          />
        </div>

      </div>

    </motion.div>

      {/* 固定フッター（motion.divの外に出してtransformの影響を回避） */}
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
          disabled={createMutation.isPending}
          onClick={() => handleSubmit()}
          aria-busy={createMutation.isPending}
          className="flex-[2] bg-[var(--color-brand-primary)] text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {createMutation.isPending ? t('common.saving') : t('journals.savePublic')}
        </motion.button>
      </div>
    </>
  );
}
