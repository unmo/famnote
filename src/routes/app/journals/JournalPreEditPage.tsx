import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useJournal, useUpdatePreMatchNote } from '@/hooks/useMatchJournals';
import { BulletListInput } from '@/components/journals/BulletListInput';
import { preMatchSchema } from '@/lib/validations/matchJournalSchema';
import type { Sport } from '@/types/sport';
import { format } from 'date-fns';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function JournalPreEditPage() {
  const navigate = useNavigate();
  const { id: journalId } = useParams<{ id: string }>();
  const { activeProfile } = useActiveProfile();
  const { data: journal, isLoading } = useJournal(journalId);
  const updateMutation = useUpdatePreMatchNote();

  const [date, setDate] = useState('');
  const [sport, setSport] = useState<Sport>('soccer');
  const [opponent, setOpponent] = useState('');
  const [venue, setVenue] = useState('');
  const [goals, setGoals] = useState<string[]>(['']);
  const [challenges, setChallenges] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ジャーナルデータを初期値に設定
  useEffect(() => {
    if (!journal) return;
    setDate(format(journal.date.toDate(), 'yyyy-MM-dd'));
    setSport(journal.sport);
    setOpponent(journal.opponent);
    setVenue(journal.venue ?? '');
    if (journal.preNote) {
      setGoals(journal.preNote.goals.map((g) => g.text) || ['']);
      setChallenges(journal.preNote.challenges.map((c) => c.text) || ['']);
    }
  }, [journal]);

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

    if (!activeProfile || !journalId) return;

    try {
      await updateMutation.mutateAsync({ journalId, userId: activeProfile.uid, data: result.data });
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
    <>
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
        <h1 className="text-lg font-semibold text-zinc-50">試合前ノートを編集</h1>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* 日付 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none"
          />
        </div>

        {/* 対戦相手 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">対戦相手</label>
          <div className="relative">
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value.slice(0, 50))}
              placeholder="例: ○○FC"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none placeholder:text-zinc-600 pr-14"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">{opponent.length}/50</span>
          </div>
          {errors.opponent && <p className="text-xs text-red-400">⚠ {errors.opponent}</p>}
        </div>

        {/* 会場 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">会場 <span className="text-zinc-500 text-xs">（任意）</span></label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value.slice(0, 50))}
            placeholder="省略可"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none placeholder:text-zinc-600"
          />
        </div>

        {/* 今日の目標 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">今日の目標</label>
          <p className="text-xs text-zinc-500">試合で達成したいことを箇条書きで入力</p>
          <BulletListInput
            value={goals}
            onChange={setGoals}
            maxItems={10}
            placeholder="例: シュートを積極的に狙う"
          />
          {errors.goals && <p className="text-xs text-red-400">⚠ {errors.goals}</p>}
        </div>

        {/* チャレンジしたいこと */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">チャレンジしたいこと <span className="text-zinc-500 text-xs">（任意）</span></label>
          <BulletListInput
            value={challenges}
            onChange={setChallenges}
            maxItems={5}
            placeholder="例: 左足でのシュートを試す"
          />
        </div>

      </div>

    </motion.div>

      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 px-4 py-3 flex gap-3">
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
    </>
  );
}
