import { motion } from 'motion/react';
import { AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { LOW_COUNT_THRESHOLD, type NoteCountInfo } from '@/types/noteCount';

interface NoteCountWarningProps {
  /** useNoteCount から取得した情報 */
  noteCountInfo: NoteCountInfo;
  /** 購入ページへの遷移ハンドラ（未指定時は準備中トーストを表示） */
  onPurchaseClick?: () => void;
}

export function NoteCountWarning({ noteCountInfo, onPurchaseClick }: NoteCountWarningProps) {
  // 残数が閾値を超えている場合は非表示
  if (noteCountInfo.remaining > LOW_COUNT_THRESHOLD) return null;

  const handlePurchaseClick = () => {
    if (onPurchaseClick) {
      onPurchaseClick();
    } else {
      // 現フェーズでは購入ページが未実装のため準備中トーストを表示
      toast.info('準備中です');
    }
  };

  const isExceeded = noteCountInfo.isExceeded;

  return (
    <motion.div
      role="alert"
      aria-live="polite"
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -4, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`rounded-xl p-4 flex items-start gap-3 ${
        isExceeded
          ? 'bg-red-500/10 border border-red-500/30'
          : 'bg-amber-500/10 border border-amber-500/30'
      }`}
    >
      {/* アイコン */}
      <div className={`flex-shrink-0 mt-0.5 ${isExceeded ? 'text-red-400' : 'text-amber-400'}`}>
        {isExceeded ? (
          <Lock className="w-4 h-4" aria-hidden="true" />
        ) : (
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
        )}
      </div>

      {/* テキスト群 */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isExceeded ? 'text-red-400' : 'text-amber-400'}`}>
          {isExceeded
            ? '記録の上限に達しました'
            : `あと${noteCountInfo.remaining}件で記録の上限に達します`}
        </p>
        <p className={`text-xs ${isExceeded ? 'text-red-400/70' : 'text-amber-400/70'}`}>
          {isExceeded
            ? '新しい記録を追加するには追加購入が必要です。'
            : '追加購入でいつでも記録を続けられます。'}
        </p>
        <button
          type="button"
          onClick={handlePurchaseClick}
          aria-label="ノート追加パックの購入ページへ移動"
          className={`self-start mt-1 text-xs underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 rounded min-h-[44px] py-3 ${
            isExceeded
              ? 'text-red-400 hover:text-red-300 focus-visible:ring-red-400'
              : 'text-amber-400 hover:text-amber-300 focus-visible:ring-amber-400'
          }`}
        >
          {isExceeded ? 'ノートを追加購入する →' : '追加購入を検討する →'}
        </button>
      </div>
    </motion.div>
  );
}
