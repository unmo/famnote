import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ChevronLeft, Globe, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { noteSchema, type NoteSchema } from '@/lib/validations/noteSchema';
import { useAuthStore } from '@/store/authStore';
import { useCreateNote } from '@/hooks/useNotes';
import { SPORTS, SPORT_LABELS } from '@/types/sport';
import { Timestamp } from 'firebase/firestore';
import { getTodayInputValue } from '@/lib/utils/date';

// 練習ノート新規作成ページ
export function NoteNewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile, firebaseUser } = useAuthStore();
  const createNote = useCreateNote();

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
    if (!firebaseUser || !userProfile?.groupId) return;

    await createNote.mutateAsync({
      userId: firebaseUser.uid,
      groupId: userProfile.groupId,
      sport: data.sport,
      date: Timestamp.fromDate(new Date(data.date)),
      durationMinutes: data.durationMinutes ?? null,
      location: data.location ?? null,
      todayGoal: data.todayGoal ?? null,
      content: data.content,
      reflection: data.reflection ?? null,
      condition: data.condition ?? null,
      imageUrls: [],
      isDraft,
      isPublic: data.isPublic,
    });

    navigate('/notes');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-zinc-50">{t('notes.new')}</h1>
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-5">
        {/* スポーツ種目 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('notes.sport')}</label>
          <select {...register('sport')} className="input-base" aria-invalid={!!errors.sport}>
            {SPORTS.map((s) => (
              <option key={s} value={s}>{SPORT_LABELS[s]}</option>
            ))}
          </select>
          {errors.sport && <p className="text-red-500 text-xs">{errors.sport.message}</p>}
        </div>

        {/* 日付 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('notes.date')}</label>
          <input
            {...register('date')}
            type="date"
            max={getTodayInputValue()}
            className="input-base"
            aria-invalid={!!errors.date}
          />
          {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
        </div>

        {/* 練習時間・場所 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">{t('notes.duration')}</label>
            <input
              {...register('durationMinutes', { valueAsNumber: true })}
              type="number"
              min="1"
              max="600"
              placeholder="90"
              className="input-base"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">{t('notes.location')}</label>
            <input
              {...register('location')}
              type="text"
              placeholder="市営グラウンド"
              className="input-base"
            />
          </div>
        </div>

        {/* 今日の目標 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('notes.todayGoal')}</label>
          <textarea
            {...register('todayGoal')}
            placeholder="今日達成したいこと..."
            rows={2}
            className="input-base resize-none"
            maxLength={200}
          />
        </div>

        {/* 練習内容（必須） */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">
            {t('notes.content')}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            {...register('content')}
            placeholder="今日の練習内容を詳しく記録しましょう..."
            rows={5}
            className="input-base resize-none"
            maxLength={1000}
            aria-invalid={!!errors.content}
          />
          {errors.content && <p className="text-red-500 text-xs">{errors.content.message}</p>}
        </div>

        {/* 振り返り */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('notes.reflection')}</label>
          <textarea
            {...register('reflection')}
            placeholder="良かった点・改善点..."
            rows={3}
            className="input-base resize-none"
            maxLength={500}
          />
        </div>

        {/* 体調 */}
        <div className="flex flex-col gap-2">
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
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      field.value === val
                        ? 'bg-[var(--color-brand-primary)] text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {val}
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
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                {field.value ? (
                  <Globe size={20} className="text-[var(--color-brand-primary)]" />
                ) : (
                  <Lock size={20} className="text-zinc-400" />
                )}
                <div>
                  <p className="text-zinc-200 text-sm font-medium">
                    {field.value ? t('notes.isPublic') : t('notes.isPrivate')}
                  </p>
                  <p className="text-zinc-500 text-xs">
                    {field.value ? t('notes.visibility.public') : t('notes.visibility.private')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  field.value ? 'bg-[var(--color-brand-primary)]' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    field.value ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}
        />

        {/* 送信ボタン */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => handleSubmit((data) => onSubmit(data, true))()}
            disabled={isSubmitting}
            className="btn-secondary flex-1"
          >
            {t('notes.saveDraft')}
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || createNote.isPending}
            className="btn-primary flex-1"
          >
            {isSubmitting || createNote.isPending ? t('common.saving') : t('notes.save')}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
