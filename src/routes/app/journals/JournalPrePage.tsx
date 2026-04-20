import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { useCreatePreMatchNote } from '@/hooks/useMatchJournals';
import { BulletListInput } from '@/components/journals/BulletListInput';
import { preMatchSchema } from '@/lib/validations/matchJournalSchema';
import { SPORTS, SPORT_LABELS } from '@/types/sport';
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
  const createMutation = useCreatePreMatchNote();

  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [sport, setSport] = useState<string>(user?.sports[0] ?? 'soccer');
  const [opponent, setOpponent] = useState('');
  const [venue, setVenue] = useState('');
  const [goals, setGoals] = useState<string[]>(['']);
  const [challenges, setChallenges] = useState<string[]>(['']);
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const formData = {
      sport: sport as typeof SPORTS[number],
      date,
      opponent: opponent.trim(),
      venue: venue.trim() || null,
      goals: goals.filter((g) => g.trim()),
      challenges: challenges.filter((c) => c.trim()),
      isPublic,
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

    if (!user || !group) {
      toast.error('ユーザー情報が取得できません');
      return;
    }

    try {
      const { journalId } = await createMutation.mutateAsync({
        userId: user.uid,
        groupId: group.id,
        data: result.data,
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
        <h1 className="text-lg font-semibold text-zinc-50">{t('journals.preTitle')}</h1>
      </header>

      {/* フォーム */}
      <div className="px-4 py-4 space-y-6">
        {/* 日付・スポーツ */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{t('journals.date')}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{t('journals.sport')}</label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none appearance-none"
            >
              {SPORTS.map((s) => (
                <option key={s} value={s}>{SPORT_LABELS[s]}</option>
              ))}
            </select>
          </div>
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
          disabled={createMutation.isPending}
          onClick={() => handleSubmit()}
          aria-busy={createMutation.isPending}
          className="flex-[2] bg-[var(--color-brand-primary)] text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {createMutation.isPending ? t('common.saving') : t('journals.savePublic')}
        </motion.button>
      </div>
    </motion.div>
  );
}
