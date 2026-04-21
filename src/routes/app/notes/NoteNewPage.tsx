import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ChevronLeft, Globe, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { noteSchema, type NoteSchema } from '@/lib/validations/noteSchema';
import { useAuthStore } from '@/store/authStore';
import { useCreateNote } from '@/hooks/useNotes';
import { BulletListInput } from '@/components/journals/BulletListInput';
import { Timestamp } from 'firebase/firestore';
import { getTodayInputValue } from '@/lib/utils/date';
import { toast } from 'sonner';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function NoteNewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile, firebaseUser } = useAuthStore();
  const createNote = useCreateNote();
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [insights, setInsights] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NoteSchema>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      sport: userProfile?.sports?.[0] ?? 'soccer',
      date: getTodayInputValue(),
      durationMinutes: null,
      location: null,
      todayGoal: null,
      content: '',
      reflection: null,
      condition: null,
      isPublic: true,
    },
  });

  const onSubmit = async (data: NoteSchema, isDraft = false) => {
    if (!firebaseUser) {
      toast.error(t('common.notAuthenticated'));
      return;
    }

    await createNote.mutateAsync({
      userId: firebaseUser.uid,
      // グループ未参加でも自分のノートとして保存できる
      groupId: userProfile?.groupId ?? null,
      sport: data.sport,
      date: Timestamp.fromDate(new Date(data.date)),
      durationMinutes: data.durationMinutes ?? null,
      location: data.location ?? null,
      todayGoal: data.todayGoal ?? null,
      content: data.content,
      reflection: data.reflection ?? null,
      insights: insights.filter((i) => i.trim()),
      condition: data.condition ?? null,
      imageUrls: [],
      isDraft,
      isPublic: data.isPublic,
    });

    navigate('/notes');
  };

  const handleDraftSave = async () => {
    setIsDraftSaving(true);
    await handleSubmit((data) => onSubmit(data, true))();
    setIsDraftSaving(false);
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
      {/* ヘッダー（JournalPrePageと同構造） */}
      <header className="flex items-center gap-3 px-4 py-3 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50">
        <button
          onClick={() => navigate(-1)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-100"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-zinc-50">{t('notes.new')}</h1>
      </header>

      {/* フォーム */}
      <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="px-4 py-4 space-y-6">

        {/* 日付 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">{t('notes.date')}</label>
          <input
            {...register('date')}
            type="date"
            max={getTodayInputValue()}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none"
          />
          {errors.date && <p className="text-xs text-red-400">⚠ {errors.date.message}</p>}
        </div>

        {/* 練習時間・場所 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{t('notes.duration')} <span className="text-zinc-500 text-xs">（任意）</span></label>
            <input
              {...register('durationMinutes', { valueAsNumber: true })}
              type="number"
              min="1"
              max="600"
              placeholder="90"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none placeholder:text-zinc-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{t('notes.location')} <span className="text-zinc-500 text-xs">（任意）</span></label>
            <input
              {...register('location')}
              type="text"
              placeholder="市営グラウンド"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* 今日の目標 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">{t('notes.todayGoal')} <span className="text-zinc-500 text-xs">（任意）</span></label>
          <textarea
            {...register('todayGoal')}
            placeholder="今日達成したいこと..."
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none placeholder:text-zinc-600 resize-none"
            maxLength={200}
          />
        </div>

        {/* 練習内容（必須） */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">
            {t('notes.content')} <span className="text-red-400 text-xs">*</span>
          </label>
          <textarea
            {...register('content')}
            placeholder="今日の練習内容を記録しましょう..."
            rows={5}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none placeholder:text-zinc-600 resize-none"
            maxLength={1000}
            aria-invalid={!!errors.content}
          />
          {errors.content && <p className="text-xs text-red-400">⚠ {errors.content.message}</p>}
        </div>

        {/* 振り返り */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">{t('notes.reflection')} <span className="text-zinc-500 text-xs">（任意）</span></label>
          <textarea
            {...register('reflection')}
            placeholder="良かった点・改善点..."
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base focus:border-[var(--color-brand-primary)] focus:outline-none placeholder:text-zinc-600 resize-none"
            maxLength={500}
          />
        </div>

        {/* 気づき */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">💡 気づき <span className="text-zinc-500 text-xs">（任意・気づきのかけらに自動保存）</span></label>
          <BulletListInput
            value={insights}
            onChange={setInsights}
            maxItems={10}
            placeholder="例: フォームを意識したら安定した"
          />
        </div>

        {/* 体調 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">{t('notes.condition')}</label>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => field.onChange(field.value === val ? null : val)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      field.value === val
                        ? 'bg-[var(--color-brand-primary)] text-white'
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {t(`notes.conditionLabels.${val}`)}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* 公開設定 */}
        <Controller
          name="isPublic"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
              <div className="flex items-center gap-3">
                {field.value ? (
                  <Globe size={20} className="text-[var(--color-brand-primary)]" />
                ) : (
                  <Lock size={20} className="text-zinc-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {field.value ? t('notes.isPublic') : t('notes.isPrivate')}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {field.value ? t('notes.visibility.public') : t('notes.visibility.private')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${field.value ? 'bg-[var(--color-brand-primary)]' : 'bg-zinc-700'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${field.value ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          )}
        />
      </form>

      {/* 固定フッター（JournalPrePageと同構造） */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 px-4 py-3 flex gap-3">
        <button
          type="button"
          onClick={handleDraftSave}
          disabled={isDraftSaving || isSubmitting}
          className="flex-1 bg-zinc-800 text-zinc-100 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-700 disabled:opacity-40"
        >
          {isDraftSaving ? t('common.saving') : t('notes.saveDraft')}
        </button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => handleSubmit((data) => onSubmit(data, false))()}
          disabled={isSubmitting || createNote.isPending}
          className="flex-[2] bg-[var(--color-brand-primary)] text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-40"
        >
          {isSubmitting || createNote.isPending ? t('common.saving') : t('notes.save')}
        </motion.button>
      </div>
    </motion.div>
  );
}
