import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, AlertTriangle, Lock, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import type { NoteCountInfo } from '@/types/noteCount';

interface NoteCountBarProps {
  /** useNoteCount から取得した情報。undefined はローディング中を示す */
  noteCountInfo: NoteCountInfo | undefined;
  /** Firestoreエラー時 true。true の場合はコンポーネント自体を非表示 */
  isError: boolean;
  /** グループ参加済みかどうか。false の場合はコンポーネント自体を非表示 */
  isGroupMember: boolean;
}

/** プログレスバーの色を使用率から決定する */
function getBarColor(percentage: number): string {
  if (percentage < 60) return 'bg-sky-500';
  if (percentage < 80) return 'bg-amber-500';
  return 'bg-red-500';
}

/** 残数テキストの色を決定する */
function getCountColor(isExceeded: boolean, isLow: boolean): string {
  if (isExceeded) return 'text-red-400';
  if (isLow) return 'text-amber-400';
  return 'text-zinc-200';
}

export function NoteCountBar({ noteCountInfo, isError, isGroupMember }: NoteCountBarProps) {
  // エラーまたはグループ未参加の場合は非表示
  if (isError || !isGroupMember) return null;

  const percentage = noteCountInfo
    ? Math.min(100, Math.round((noteCountInfo.totalNoteCount / noteCountInfo.limit) * 100))
    : 0;

  const barColor = getBarColor(percentage);

  const handlePurchaseClick = () => {
    // 現フェーズでは購入ページが未実装のため準備中トーストを表示
    toast.info('準備中です');
  };

  return (
    <motion.section
      aria-label="グループの記録残数"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5"
    >
      {/* ヘッダー行 */}
      <div className="flex items-center justify-between mb-3">
        {noteCountInfo ? (
          <>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-zinc-400" aria-hidden="true" />
              <span className="text-sm font-medium text-zinc-300">グループの記録残数</span>
            </div>
            <span className={`text-sm font-bold ${getCountColor(noteCountInfo.isExceeded, noteCountInfo.isLow)}`}>
              残り {noteCountInfo.remaining} 件 / {noteCountInfo.limit}件
            </span>
          </>
        ) : (
          // スケルトンローディング
          <>
            <div className="h-4 w-32 bg-zinc-800 rounded-full animate-pulse" aria-hidden="true" />
            <div className="h-4 w-16 bg-zinc-800 rounded-full animate-pulse" aria-hidden="true" />
          </>
        )}
      </div>

      {/* プログレスバー */}
      {noteCountInfo ? (
        <div
          className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`グループ記録使用率 ${percentage}%`}
        >
          <motion.div
            className={`h-full rounded-full transition-colors duration-300 ${barColor}`}
            initial={{ width: '0%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.1 }}
          />
        </div>
      ) : (
        <div className="h-2 w-full bg-zinc-800 rounded-full animate-pulse" aria-hidden="true" />
      )}

      {/* 警告・上限到達メッセージ */}
      <AnimatePresence>
        {noteCountInfo?.isExceeded && (
          <motion.div
            key="exceeded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-1.5 mt-2">
              <Lock className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
              <span className="text-xs text-red-400">上限に達しました</span>
            </div>
            <div className="mt-3 w-full">
              <button
                type="button"
                onClick={handlePurchaseClick}
                aria-label="ノート追加パックを購入する"
                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 text-sm font-medium hover:bg-sky-500/25 hover:border-sky-500/50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 min-h-[44px]"
              >
                <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                ノートを追加購入する
              </button>
            </div>
          </motion.div>
        )}

        {noteCountInfo?.isLow && !noteCountInfo.isExceeded && (
          <motion.div
            key="low"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-1.5 mt-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span className="text-xs text-amber-400">
                あと{noteCountInfo.remaining}件で記録できなくなります
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
