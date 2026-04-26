import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ChevronLeft, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { matchSchema, type MatchSchema } from '@/lib/validations/matchSchema';
import { useMatch, useUpdateMatch } from '@/hooks/useMatches';
import { useAuthStore } from '@/store/authStore';
import { SPORTS, SPORT_LABELS } from '@/types/sport';
import { Timestamp } from 'firebase/firestore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { format } from 'date-fns';
import { getTodayInputValue } from '@/lib/utils/date';

// 試合記録編集ページ
export function MatchEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const { data: match, isLoading } = useMatch(id);
  const updateMatch = useUpdateMatch();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MatchSchema>({
    resolver: zodResolver(matchSchema),
    values: match
      ? {
          sport: match.sport,
          date: format(match.date.toDate(), 'yyyy-MM-dd'),
          opponent: match.opponent,
          venue: match.venue,
          myScore: match.myScore,
          opponentScore: match.opponentScore,
          result: match.result,
          position: match.position,
          playingTimeMinutes: match.playingTimeMinutes,
          performance: match.performance,
          highlight: match.highlight,
          improvements: match.improvements,
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

  if (!match || match.userId !== userProfile?.uid) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-zinc-400">編集権限がありません</p>
      </div>
    );
  }

  const onSubmit = async (data: MatchSchema) => {
    if (!userProfile) return;
    await updateMatch.mutateAsync({
      matchId: match.id,
      userId: userProfile.uid,
      data: {
        sport: data.sport,
        date: Timestamp.fromDate(new Date(data.date)),
        opponent: data.opponent,
        venue: data.venue ?? null,
        myScore: data.myScore ?? null,
        opponentScore: data.opponentScore ?? null,
        result: data.result ?? null,
        position: data.position ?? null,
        playingTimeMinutes: data.playingTimeMinutes ?? null,
        performance: data.performance ?? null,
        highlight: data.highlight ?? null,
        improvements: data.improvements ?? null,
        isPublic: true,
      },
    });
    navigate(`/matches/${match.id}`);
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
        <h1 className="text-xl font-bold text-zinc-50">試合記録を編集</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('matches.sport')}</label>
          <select {...register('sport')} className="input-base">
            {SPORTS.map((s) => (
              <option key={s} value={s}>{SPORT_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('matches.date')}</label>
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
            {t('matches.opponent')} <span className="text-red-500">*</span>
          </label>
          <input
            {...register('opponent')}
            type="text"
            className="input-base"
            aria-invalid={!!errors.opponent}
          />
          {errors.opponent && <p className="text-red-500 text-xs">{errors.opponent.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('matches.highlight')}</label>
          <textarea
            {...register('highlight')}
            rows={3}
            className="input-base resize-none"
            maxLength={500}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('matches.improvements')}</label>
          <textarea
            {...register('improvements')}
            rows={3}
            className="input-base resize-none"
            maxLength={500}
          />
        </div>

        {/* パフォーマンス評価 */}
        <div>
          <label className="text-sm font-medium text-zinc-300 block mb-2">
            {t('matches.performance')}
          </label>
          <Controller
            name="performance"
            control={control}
            render={({ field }) => (
              <div className="flex gap-1">
                {([1, 2, 3, 4, 5] as const).map((val) => (
                  <motion.button
                    key={val}
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={() => field.onChange(field.value === val ? null : val)}
                  >
                    <Star
                      size={32}
                      className={
                        field.value != null && val <= field.value
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-700'
                      }
                    />
                  </motion.button>
                ))}
              </div>
            )}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting || updateMatch.isPending}
          className="btn-primary w-full"
        >
          {isSubmitting || updateMatch.isPending ? t('common.saving') : t('matches.save')}
        </motion.button>
      </form>
    </div>
  );
}
