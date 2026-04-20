import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pin } from 'lucide-react';
import { clsx } from 'clsx';

interface BulletListInputProps {
  value: string[];
  onChange: (items: string[]) => void;
  pinnedIndices?: Set<number>;
  onPinToggle?: (index: number) => void;
  maxItems: number;
  maxLength?: number;
  placeholder?: string;
  addPlaceholder?: string;
  showPinButton?: boolean;
  disabled?: boolean;
  autoFocusIndex?: number;
}

const itemVariants = {
  initial: { opacity: 0, height: 0, y: -4 },
  animate: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.15 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.1 } },
};

export function BulletListInput({
  value,
  onChange,
  pinnedIndices = new Set(),
  onPinToggle,
  maxItems,
  maxLength = 100,
  placeholder = '入力してください',
  addPlaceholder,
  showPinButton = false,
  disabled = false,
}: BulletListInputProps) {
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // 表示用リスト（最低1行は表示）
  const items = value.length > 0 ? value : [''];

  const updateItem = useCallback(
    (index: number, text: string) => {
      const newItems = [...items];
      newItems[index] = text.slice(0, maxLength);
      onChange(newItems);
    },
    [items, maxLength, onChange]
  );

  const addItem = useCallback(
    (afterIndex: number) => {
      if (items.length >= maxItems) return;
      const newItems = [...items];
      newItems.splice(afterIndex + 1, 0, '');
      onChange(newItems);
      // 次フレームでフォーカス
      setTimeout(() => {
        inputRefs.current[afterIndex + 1]?.focus();
      }, 50);
    },
    [items, maxItems, onChange]
  );

  const removeItem = useCallback(
    (index: number) => {
      if (items.length <= 1) return;
      const newItems = items.filter((_, i) => i !== index);
      onChange(newItems);
      setTimeout(() => {
        inputRefs.current[Math.max(0, index - 1)]?.focus();
      }, 50);
    },
    [items, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(index);
    } else if (e.key === 'Backspace' && items[index] === '' && items.length > 1) {
      e.preventDefault();
      removeItem(index);
    }
  };

  return (
    <div className="space-y-1.5">
      <AnimatePresence initial={false}>
        {items.map((item, index) => {
          const isPinned = pinnedIndices.has(index);
          const remaining = maxLength - item.length;
          const isNearLimit = remaining <= 10;

          return (
            <motion.div
              key={index}
              variants={itemVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={clsx(
                'flex items-start gap-2 group rounded-lg transition-colors duration-150',
                isPinned && 'bg-amber-500/10 border-l-2 border-amber-500 pl-2'
              )}
            >
              {/* ピンボタン */}
              {showPinButton && (
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <motion.button
                    type="button"
                    onClick={() => onPinToggle?.(index)}
                    disabled={disabled}
                    aria-label={isPinned ? 'ピンを解除する' : 'この項目をピンする'}
                    aria-pressed={isPinned}
                    animate={isPinned ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center text-base transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:outline-none',
                      isPinned
                        ? 'text-amber-400 bg-amber-400/10 opacity-100'
                        : 'text-zinc-600 hover:text-amber-400 hover:bg-amber-400/10 opacity-0 group-hover:opacity-100 focus:opacity-100 md:opacity-0 max-md:opacity-100'
                    )}
                  >
                    <Pin size={14} />
                  </motion.button>
                </div>
              )}

              {/* 入力フィールド */}
              <div className="flex-1 flex items-center gap-2">
                <span className="text-zinc-500 text-sm flex-shrink-0 mt-2">•</span>
                <textarea
                  ref={(el) => { inputRefs.current[index] = el; }}
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={disabled}
                  placeholder={index === 0 ? placeholder : (addPlaceholder ?? placeholder)}
                  aria-label={`項目 ${index + 1}件目`}
                  rows={1}
                  className={clsx(
                    'flex-1 bg-transparent border-0 border-b border-zinc-700/50',
                    'focus:border-[var(--color-brand-primary)] outline-none',
                    'text-base text-zinc-50 placeholder:text-zinc-600',
                    'py-2 px-0 leading-relaxed resize-none min-h-[40px] max-md:min-h-[48px]',
                    'transition-colors duration-150',
                    disabled && 'pointer-events-none opacity-50'
                  )}
                />
              </div>

              {/* 文字数カウンター */}
              <span
                className={clsx(
                  'text-xs self-end pb-1 flex-shrink-0',
                  isNearLimit ? 'text-amber-500' : 'text-zinc-600'
                )}
              >
                {item.length}/{maxLength}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* 追加ボタン */}
      {items.length < maxItems ? (
        <button
          type="button"
          onClick={() => addItem(items.length - 1)}
          disabled={disabled}
          className="flex items-center gap-2 mt-1 text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40"
        >
          <span className="text-base leading-none">+</span>
          <span>追加</span>
        </button>
      ) : (
        <p className="text-xs text-zinc-600 mt-1">
          最大{maxItems}件まで入力できます
        </p>
      )}
    </div>
  );
}
