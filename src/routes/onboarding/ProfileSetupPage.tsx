import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { profileSchema, type ProfileSchema } from '@/lib/validations/profileSchema';
import { updateUserProfile } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import { SPORTS, SPORT_LABELS, SPORT_EMOJIS, type Sport } from '@/types/sport';
import { toast } from 'sonner';

// プロフィール設定ページ（オンボーディング 1/3）
export function ProfileSetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { firebaseUser, userProfile } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: userProfile?.displayName ?? firebaseUser?.displayName ?? '',
      sports: userProfile?.sports ?? [],
    },
  });

  const selectedSports = watch('sports') ?? [];

  const toggleSport = (sport: Sport) => {
    const current = selectedSports;
    if (current.includes(sport)) {
      setValue('sports', current.filter((s) => s !== sport), { shouldValidate: true });
    } else {
      setValue('sports', [...current, sport], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: ProfileSchema) => {
    if (!firebaseUser) return;
    try {
      await updateUserProfile(firebaseUser.uid, {
        displayName: data.displayName,
        sports: data.sports,
      });
      navigate('/onboarding/create-group');
    } catch {
      toast.error('プロフィールの保存に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* ステップインジケーター */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === 1
                  ? 'bg-[var(--color-brand-primary)] text-white'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-zinc-50 mb-2">
            {t('onboarding.profileSetup')}
          </h2>
          <p className="text-zinc-400 text-sm mb-6">あなたの情報を設定しましょう</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* 表示名 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">
                {t('auth.displayName')}
              </label>
              <input
                {...register('displayName')}
                type="text"
                placeholder="田中 太郎"
                className="input-base"
                aria-invalid={!!errors.displayName}
              />
              {errors.displayName && (
                <p className="text-red-500 text-xs">{errors.displayName.message}</p>
              )}
            </div>

            {/* スポーツ選択 */}
            <div>
              <label className="text-sm font-medium text-zinc-300 block mb-3">
                {t('onboarding.selectSports')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SPORTS.map((sport) => {
                  const isSelected = selectedSports.includes(sport);
                  return (
                    <motion.button
                      key={sport}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleSport(sport)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-[var(--color-brand-primary)] bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] text-[var(--color-brand-primary)]'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      <span className="text-xl">{SPORT_EMOJIS[sport]}</span>
                      <span className="text-sm font-medium">{SPORT_LABELS[sport]}</span>
                      {isSelected && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              {errors.sports && (
                <p className="text-red-500 text-xs mt-2">{errors.sports.message}</p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? t('common.saving') : t('onboarding.next')}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
