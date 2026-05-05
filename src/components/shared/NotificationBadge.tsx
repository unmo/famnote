import { AnimatePresence, motion } from 'motion/react';

interface NotificationBadgeProps {
  /** 未読件数（0の場合は非表示） */
  count: number;
  /** バッジの位置調整クラス（デフォルト: "absolute -top-1.5 -right-1.5"） */
  positionClassName?: string;
  /** アニメーション無効化フラグ（パフォーマンス最適化用） */
  disableAnimation?: boolean;
  /** アクセシビリティ用ラベル */
  'aria-label'?: string;
}

/**
 * 未読件数を表示する汎用バッジコンポーネント。
 * count=0 の場合はレンダリングしない。
 * 件数変化時に key={count} によるremountでポップアニメーションを再生する。
 */
export function NotificationBadge({
  count,
  positionClassName = 'absolute -top-1.5 -right-1.5',
  disableAnimation = false,
  'aria-label': ariaLabel,
}: NotificationBadgeProps) {
  const displayText = count > 99 ? '99+' : String(count);
  // 5件以上はアンバーカラーに変化（多い通知の注意喚起）
  const colorClass = count >= 5 ? 'bg-amber-500' : 'bg-sky-500';
  const label = ariaLabel ?? `${Math.min(count, 99)}${count > 99 ? '+' : ''}件の未読通知`;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          // count変化時にremountしてアニメーションを再生する意図的な設計
          key={count}
          role="status"
          aria-label={label}
          aria-live="polite"
          className={`
            ${positionClassName} z-10
            ${colorClass} text-white
            flex items-center justify-center
            min-w-[18px] h-[18px]
            rounded-full px-1
            text-[10px] font-bold leading-none
            shadow-sm shadow-black/30
            pointer-events-none
          `}
          initial={disableAnimation ? false : { opacity: 0, scale: 0.8 }}
          animate={
            disableAnimation ? {} : { opacity: 1, scale: [0.8, 1.2, 1.0] }
          }
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, times: [0, 0.5, 1], ease: 'easeOut' }}
        >
          {displayText}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
