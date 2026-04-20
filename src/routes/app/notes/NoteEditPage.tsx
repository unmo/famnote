import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ChevronLeft, Globe, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { noteSchema, type NoteSchema } from '@/lib/validations/noteSchema';
import { useNote, useUpdateNote } from '@/hooks/useNotes';
import { useAuthStore } from '@/store/authStore';
import { SPORTS, SPORT_LABELS } from '@/types/sport';
import { Timestamp } from 'firebase/firestore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { format } from 'date-fns';
import { getTodayInputValue } from '@/lib/utils/date';

// ノート編集ページ
export function NoteEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const { data: note, isLoading } = useNote(id);
  const updateNote = useUpdateNote();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NoteSchema>({
    resolver: zodResolver(noteSchema),
    values: note
      ? {
          sport: note.sport,
          date: format(note.date.toDate(), 'yyyy-MM-dd'),
          durationMinutes: note.durationMinutes,
          location: note.location,
          todayGoal: note.todayGoal,
          content: note.content,
          reflection: note.reflection,
          condition: note.condition,
          isPublic: note.isPublic,
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!note || note.userId !== userProfile?.uid) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-zinc-400">編集権限がありません</p>
      </div>
    );
  }

  const onSubmit = async (data: NoteSchema) => {
    if (!userProfile) return;
    await updateNote.mutateAsync({
      noteId: note.id,
      userId: userProfile.uid,
      data: {
        sport: data.sport,
        date: Timestamp.fromDate(new Date(data.date)),
        durationMinutes: data.durationMinutes ?? null,
        location: data.location ?? null,
        todayGoal: data.todayGoal ?? null,
        content: data.content,
        reflection: data.reflection ?? null,
        condition: data.condition ?? null,
        isPublic: data.isPublic,
      },
    });
    navigate(`/notes/${note.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-zinc-50">ノートを編集</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('notes.sport')}</label>
          <select {...register('sport')} className="input-base">
            {SPORTS.map((s) => (
              <option key={s} value={s}>{SPORT_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('notes.date')}</label>
          <input
            {...register('date')}
            type="date"
            max={getTodayInputValue()}
            className="input-base"
          />
          {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">
            {t('notes.content')} <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('content')}
            rows={6}
            className="input-base resize-none"
            maxLength={1000}
            aria-invalid={!!errors.content}
          />
          {errors.content && <p className="text-red-500 text-xs">{errors.content.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('notes.reflection')}</label>
          <textarea
            {...register('reflection')}
            rows={3}
            className="input-base resize-none"
            maxLength={500}
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
                <span className="text-zinc-200 text-sm font-medium">
                  {field.value ? t('notes.isPublic') : t('notes.isPrivate')}
                </span>
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
                  className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white transition-transform ${
                    field.value ? 'translate-x-[22px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}
        />

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting || updateNote.isPending}
          className="btn-primary w-full"
        >
          {isSubmitting || updateNote.isPending ? t('common.saving') : t('notes.save')}
        </motion.button>
      </form>
    </div>
  );
}
