import { clsx } from 'clsx';
import type { BulletItem, GoalReview, GoalAchievement } from '@/types/matchJournal';

interface GoalReviewItemProps {
  goal: BulletItem;
  review?: GoalReview;
  onChange?: (review: GoalReview) => void;
  readonly?: boolean;
}

const ACHIEVEMENT_MAP: Record<GoalAchievement, { label: string; selected: string; icon: string }> = {
  achieved: {
    label: 'できた',
    selected: 'bg-green-500/20 border-green-500/50 text-green-400',
    icon: '○',
  },
  partial: {
    label: '部分的に',
    selected: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
    icon: '△',
  },
  not_achieved: {
    label: 'できなかった',
    selected: 'bg-red-500/20 border-red-500/50 text-red-400',
    icon: '×',
  },
};

const ACHIEVEMENT_VIEW_MAP: Record<GoalAchievement, { bg: string; text: string }> = {
  achieved: { bg: 'bg-green-500/20', text: 'text-green-400' },
  partial: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  not_achieved: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

export function GoalReviewItem({ goal, review, onChange, readonly = false }: GoalReviewItemProps) {
  const handleAchievementChange = (achievement: GoalAchievement) => {
    onChange?.({
      goalItemId: goal.id,
      achievement,
      comment: review?.comment ?? null,
    });
  };

  const handleCommentChange = (comment: string) => {
    onChange?.({
      goalItemId: goal.id,
      achievement: review?.achievement ?? 'not_achieved',
      comment: comment.slice(0, 50) || null,
    });
  };

  if (readonly) {
    return (
      <div className="space-y-2 py-3 border-b border-zinc-800 last:border-0">
        <div className="flex items-start gap-2.5">
          {review && (
            <span
              className={clsx(
                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                ACHIEVEMENT_VIEW_MAP[review.achievement].bg,
                ACHIEVEMENT_VIEW_MAP[review.achievement].text
              )}
            >
              {ACHIEVEMENT_MAP[review.achievement].icon}
            </span>
          )}
          <p className={clsx('text-sm leading-relaxed', goal.isPinned ? 'text-amber-300' : 'text-zinc-300')}>
            {goal.isPinned && <span className="mr-1">📌</span>}
            {goal.text}
          </p>
        </div>
        {review?.comment && (
          <p className="text-xs text-zinc-500 ml-7 italic">"{review.comment}"</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 py-3 border-b border-zinc-800 last:border-0">
      <p className="text-sm text-zinc-300 leading-relaxed">• {goal.text}</p>

      {/* 達成状況ボタン群 */}
      <div className="flex gap-2 mt-2 flex-wrap">
        {(Object.keys(ACHIEVEMENT_MAP) as GoalAchievement[]).map((achievement) => (
          <button
            key={achievement}
            type="button"
            onClick={() => handleAchievementChange(achievement)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              review?.achievement === achievement
                ? ACHIEVEMENT_MAP[achievement].selected
                : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'
            )}
          >
            {ACHIEVEMENT_MAP[achievement].icon} {ACHIEVEMENT_MAP[achievement].label}
          </button>
        ))}
      </div>

      {/* コメント入力 */}
      {review?.achievement && (
        <div className="relative mt-2">
          <input
            type="text"
            value={review.comment ?? ''}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder="コメント（任意）"
            maxLength={50}
            className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-50 border border-zinc-700 focus:border-[var(--color-brand-primary)] focus:outline-none placeholder:text-zinc-600 pr-12"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
            {(review.comment ?? '').length}/50
          </span>
        </div>
      )}
    </div>
  );
}
