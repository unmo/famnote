import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PlusCircle } from 'lucide-react';
import { addChildProfileSchema } from '@/lib/validations/profileSchema';

interface AddChildProfileFormProps {
  onAdd: (displayName: string) => Promise<void>;
  isAtMemberLimit: boolean;
  maxMembers: number;
}

// 子プロフィール追加フォームコンポーネント
// アコーディオン展開でフォームを表示する
export function AddChildProfileForm({ onAdd, isAtMemberLimit, maxMembers }: AddChildProfileFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // フォームが開いた時に自動フォーカス
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (isAtMemberLimit) return;
    setValue('');
    setError(null);
    setIsOpen(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setValue('');
    setError(null);
  };

  const handleSubmit = async () => {
    const result = addChildProfileSchema.safeParse({ displayName: value });
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? '入力内容を確認してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onAdd(result.data.displayName);
      setIsOpen(false);
      setValue('');
    } catch {
      setError('追加に失敗しました。もう一度お試しください');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="mt-3">
      {/* フォーム未表示時の追加ボタン */}
      {!isOpen && (
        <>
          <motion.button
            whileHover={!isAtMemberLimit ? { scale: 1.01 } : undefined}
            whileTap={!isAtMemberLimit ? { scale: 0.99 } : undefined}
            onClick={handleOpen}
            disabled={isAtMemberLimit}
            aria-label="子プロフィールを追加"
            className={`w-full flex items-center justify-center gap-2
                        px-4 py-2.5 rounded-lg
                        border border-dashed
                        text-sm font-medium transition-all duration-200 min-h-[44px]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]
                        ${isAtMemberLimit
                          ? 'border-zinc-700 text-zinc-600 opacity-40 cursor-not-allowed'
                          : 'border-[var(--color-brand-primary)]/50 text-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/5'
                        }`}
          >
            <PlusCircle className="w-4 h-4" />
            プロフィールを追加
          </motion.button>
          {isAtMemberLimit && (
            <p className="text-zinc-500 text-xs text-center mt-1">
              メンバーは最大{maxMembers}名までです
            </p>
          )}
        </>
      )}

      {/* フォーム展開状態 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-4 space-y-3">
              <h4 className="text-zinc-300 text-sm font-medium">新しいメンバーを追加</h4>

              <div>
                <input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={20}
                  disabled={isSubmitting}
                  placeholder="例: 太郎"
                  aria-label="新しいメンバーの名前"
                  aria-invalid={!!error}
                  className={`w-full bg-zinc-900 border rounded-lg px-3 py-2
                              text-zinc-50 text-sm
                              focus:outline-none focus:ring-2 focus:border-transparent
                              placeholder:text-zinc-500 transition-all duration-150
                              disabled:opacity-50 disabled:cursor-not-allowed
                              ${error
                                ? 'border-red-500/50 focus:ring-red-500'
                                : 'border-zinc-700 focus:ring-[var(--color-brand-primary)]'
                              }`}
                />
                <div className="flex justify-between mt-1">
                  {error ? (
                    <p className="text-red-400 text-xs" role="alert" aria-live="polite">{error}</p>
                  ) : (
                    <span />
                  )}
                  <span className="text-zinc-500 text-xs" aria-label="文字数">{value.length}/20</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-md text-zinc-400 text-sm
                             hover:text-zinc-50 hover:bg-zinc-700 transition-colors
                             min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  aria-disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-md text-white text-sm font-medium
                             bg-[var(--color-brand-primary)] hover:opacity-90 transition-opacity
                             min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      追加中...
                    </span>
                  ) : '追加する'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
