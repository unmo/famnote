import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ChevronLeft, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { matchSchema, type MatchSchema } from '@/lib/validations/matchSchema';
import { useAuthStore } from '@/store/authStore';
import { useCreateMatch } from '@/hooks/useMatches';
import { SPORTS, SPORT_LABELS } from '@/types/sport';
import { Timestamp } from 'firebase/firestore';
import { getTodayInputValue } from '@/lib/utils/date';
import type { MatchResult } from '@/types/match';

// 試合記録新規作成ページ
export function MatchNewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile, firebaseUser } = useAuthStore();
  const createMatch = useCreateMatch();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MatchSchema>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      sport: userProfile?.sports?.[0] ?? 'soccer',
      date: getTodayInputValue(),
      opponent: '',
      venue: null,
      myScore: null,
      opponentScore: null,
      result: null,
      position: null,
      playingTimeMinutes: null,
      performance: null,
      highlight: null,
      improvements: null,
      isPublic: true,
    },
  });

  const myScore = watch('myScore');
  const opponentScore = watch('opponentScore');

  // スコアから勝敗を自動判定
  const autoDetectResult = (): MatchResult => {
    if (myScore == null || opponentScore == null) return null;
    if (myScore > opponentScore) return 'win';
    if (myScore < opponentScore) return 'loss';
    return 'draw';
  };

  const onSubmit = async (data: MatchSchema) => {
    if (!firebaseUser || !userProfile?.groupId) return;

    // スコアが両方入力されている場合は結果を自動判定
    const result = data.result ?? autoDetectResult();

    await createMatch.mutateAsync({
      userId: firebaseUser.uid,
      groupId: userProfile.groupId,
      sport: data.sport,
      date: Timestamp.fromDate(new Date(data.date)),
      opponent: data.opponent,
      venue: data.venue ?? null,
      myScore: data.myScore ?? null,
      opponentScore: data.opponentScore ?? null,
      result,
      position: data.position ?? null,
      playingTimeMinutes: data.playingTimeMinutes ?? null,
      performance: data.performance ?? null,
      highlight: data.highlight ?? null,
      improvements: data.improvements ?? null,
      imageUrls: [],
      isDraft: false,
      isPublic: data.isPublic,
    });

    navigate('/matches');
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
        <h1 className="text-xl font-bold text-zinc-50">{t('matches.new')}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* スポーツ */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('matches.sport')}</label>
          <select {...register('sport')} className="input-base">
            {SPORTS.map((s) => (
              <option key={s} value={s}>{SPORT_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* 日付 */}
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

        {/* 対戦相手 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">
            {t('matches.opponent')} <span className="text-red-500">*</span>
          </label>
          <input
            {...register('opponent')}
            type="text"
            placeholder="○○FC"
            className="input-base"
            aria-invalid={!!errors.opponent}
          />
          {errors.opponent && <p className="text-red-500 text-xs">{errors.opponent.message}</p>}
        </div>

        {/* 会場 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('matches.venue')}</label>
          <input
            {...register('venue')}
            type="text"
            placeholder="市営スタジアム"
            className="input-base"
          />
        </div>

        {/* スコア */}
        <div>
          <label className="text-sm font-medium text-zinc-300 block mb-2">{t('matches.score')}</label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-zinc-500 mb-1 block">{t('matches.myScore')}</label>
              <input
                {...register('myScore', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="0"
                className="input-base text-center"
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  setValue('myScore', val as number | null);
                  // スコアから勝敗を自動判定してセット
                  if (val != null && opponentScore != null) {
                    if (val > opponentScore) setValue('result', 'win');
                    else if (val < opponentScore) setValue('result', 'loss');
                    else setValue('result', 'draw');
                  }
                }}
              />
            </div>
            <span className="text-2xl font-bold text-zinc-500 pt-5">-</span>
            <div className="flex-1">
              <label className="text-xs text-zinc-500 mb-1 block">{t('matches.opponentScore')}</label>
              <input
                {...register('opponentScore', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="0"
                className="input-base text-center"
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  setValue('opponentScore', val as number | null);
                  if (val != null && myScore != null) {
                    if (myScore > val) setValue('result', 'win');
                    else if (myScore < val) setValue('result', 'loss');
                    else setValue('result', 'draw');
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* 勝敗 */}
        <div>
          <label className="text-sm font-medium text-zinc-300 block mb-2">{t('matches.result')}</label>
          <Controller
            name="result"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                {([
                  { value: 'win', label: t('matches.win'), color: 'border-green-600 text-green-400 bg-green-950/50' },
                  { value: 'draw', label: t('matches.draw'), color: 'border-amber-600 text-amber-400 bg-amber-950/50' },
                  { value: 'loss', label: t('matches.loss'), color: 'border-red-600 text-red-400 bg-red-950/50' },
                ] as const).map(({ value, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(field.value === value ? null : value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      field.value === value ? color : 'border-zinc-700 text-zinc-500 bg-zinc-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* ポジション・出場時間 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">{t('matches.position')}</label>
            <input
              {...register('position')}
              type="text"
              placeholder="FW"
              className="input-base"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">{t('matches.playingTime')}</label>
            <input
              {...register('playingTimeMinutes', { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="90"
              className="input-base"
            />
          </div>
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
                    className="p-1"
                    aria-label={`${val}星`}
                  >
                    <Star
                      size={32}
                      className={`transition-colors ${
                        field.value != null && val <= field.value
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-700'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          />
        </div>

        {/* ハイライト */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('matches.highlight')}</label>
          <textarea
            {...register('highlight')}
            rows={3}
            placeholder="今日のプレーのハイライト..."
            className="input-base resize-none"
            maxLength={500}
          />
        </div>

        {/* 改善点 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{t('matches.improvements')}</label>
          <textarea
            {...register('improvements')}
            rows={3}
            placeholder="次回改善したいこと..."
            className="input-base resize-none"
            maxLength={500}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting || createMatch.isPending}
          className="btn-primary w-full"
        >
          {isSubmitting || createMatch.isPending ? t('common.saving') : t('matches.save')}
        </motion.button>
      </form>
    </div>
  );
}
