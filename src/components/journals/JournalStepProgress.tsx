import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';

interface JournalStepProgressProps {
  hasPreNote: boolean;
  hasPostNote: boolean;
  isOwner: boolean;
  journalId: string;
  onPostCta: () => void;
}

export function JournalStepProgress({
  hasPreNote,
  hasPostNote,
  isOwner,
  onPostCta,
}: JournalStepProgressProps) {
  const step1Complete = hasPreNote;
  const step2Complete = hasPostNote;
  // ステップ2がアクティブ: 試合前記録済みで試合後未記録の状態
  const step2Active = hasPreNote && !hasPostNote;

  const connectorClass = step1Complete
    ? 'flex-1 h-px bg-[var(--color-brand-primary)]/40 mx-1'
    : 'flex-1 h-px bg-zinc-800 mx-1';

  return (
    <div className="space-y-3">
      {/* ステッパー行 */}
      <div className="flex items-center gap-2">
        {/* ステップ1 */}
        <div className="flex items-center gap-1.5">
          {step1Complete ? (
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-[11px]">
              <CheckCircle size={14} aria-hidden="true" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400 text-[11px] font-bold">
              1
            </div>
          )}
          <span
            className={
              step1Complete
                ? 'text-xs text-zinc-600 line-through'
                : 'text-xs text-zinc-500'
            }
          >
            試合前の目標
          </span>
        </div>

        {/* コネクター */}
        <div className={connectorClass} aria-hidden="true" />

        {/* ステップ2 */}
        <div className="flex items-center gap-1.5">
          {step2Complete ? (
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-[11px]">
              <CheckCircle size={14} aria-hidden="true" />
            </div>
          ) : step2Active ? (
            <div className="w-6 h-6 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center text-white text-[11px] font-bold animate-pulse">
              2
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400 text-[11px] font-bold">
              2
            </div>
          )}
          <span
            className={
              step2Complete
                ? 'text-xs text-zinc-600 line-through'
                : step2Active
                  ? 'text-xs font-medium text-[var(--color-brand-primary)]'
                  : 'text-xs text-zinc-500'
            }
          >
            試合後の振り返り
          </span>
        </div>
      </div>

      {/* CTAボタン: オーナーかつ試合後未記録の場合のみ */}
      {isOwner && step2Active && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.15 }}
          onClick={onPostCta}
          aria-label="試合後の振り返りを記録する"
          className="w-full bg-[var(--color-brand-primary)] text-white rounded-xl px-5 py-4 text-sm font-semibold flex items-center justify-between min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-primary)]"
        >
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-base font-bold">試合の振り返りを記録</span>
            <span className="text-xs text-white/70">気づき・できたこと・課題を入力</span>
          </div>
          <span className="text-xl" aria-hidden="true">→</span>
        </motion.button>
      )}
    </div>
  );
}
