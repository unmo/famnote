import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { goalSchema, type GoalSchema } from '@/lib/validations/groupSchema';
import { useAuthStore } from '@/store/authStore';
import { useCreateGoal } from '@/hooks/useGoals';
import { SPORTS, SPORT_LABELS } from '@/types/sport';
import { Timestamp } from 'firebase/firestore';
import { GOAL_TYPE_LABELS } from '@/types/goal';
import type { GoalType } from '@/types/goal';
import type { Sport } from '@/types/sport';

// 目標新規作成ページ
export function GoalNewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile, firebaseUser } = useAuthStore();
  const createGoal = useCreateGoal();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<GoalSchema>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      sport: userProfile?.sports?.[0] ?? 'soccer',
      goalType: 'practice_count',
      isPublic: true,
    },
  });

  const onSubmit = async (data: GoalSchema) => {
    if (!firebaseUser || !userProfile?.groupId) return;

    await createGoal.mutateAsync({
      userId: firebaseUser.uid,
      groupId: userProfile.groupId,
      title: data.title,
      description: data.description ?? null,
      sport: data.sport as Sport,
      goalType: data.goalType as GoalType,
      targetValue: data.targetValue ?? null,
      deadline: Timestamp.fromDate(new Date(data.deadline)),
      isPublic: data.isPublic,
    });

    navigate('/goals');
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
        <h1 className="text-xl font-bold text-zinc-50">{t('goals.new')}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* タイトル */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">
            {t('goals.titleField')} <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title')}
            type="text"
            placeholder="週3回練習する"
            className="input-base"
            aria-invalid={!!errors.title}
          />
          {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
        </div>

        {/* 詳細 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('goals.description')}</label>
          <textarea
            {...register('description')}
            rows={3}
            className="input-base resize-none"
            maxLength={300}
          />
        </div>

        {/* スポーツ */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('goals.sport')}</label>
          <select {...register('sport')} className="input-base">
            {SPORTS.map((s) => (
              <option key={s} value={s}>{SPORT_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* 目標タイプ */}
        <div>
          <label className="text-sm font-medium text-zinc-300 block mb-2">
            {t('goals.goalType')} <span className="text-red-500">*</span>
          </label>
          <Controller
            name="goalType"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                {Object.entries(GOAL_TYPE_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={`py-3 px-4 rounded-xl text-sm font-medium text-left transition-all border ${
                      field.value === value
                        ? 'bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* 目標値・期限 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">{t('goals.targetValue')}</label>
            <input
              {...register('targetValue', { valueAsNumber: true })}
              type="number"
              min="1"
              placeholder="12"
              className="input-base"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">
              {t('goals.deadline')} <span className="text-red-500">*</span>
            </label>
            <input
              {...register('deadline')}
              type="date"
              className="input-base"
              aria-invalid={!!errors.deadline}
            />
            {errors.deadline && (
              <p className="text-red-500 text-xs">{errors.deadline.message}</p>
            )}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting || createGoal.isPending}
          className="btn-primary w-full"
        >
          {isSubmitting || createGoal.isPending ? t('common.saving') : t('common.save')}
        </motion.button>
      </form>
    </div>
  );
}
