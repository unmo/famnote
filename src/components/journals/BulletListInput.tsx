import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pin, Plus, Trash2 } from 'lucide-react';
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
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { duration: 0.15 } },
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
    <div className="space-y-2">
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
            >
              <div
                className={clsx(
                  'flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2.5 border transition-colors duration-150',
                  isPinned
                    ? 'border-amber-500/60 bg-amber-500/5'
                    : 'border-zinc-700/60 focus-within:border-[var(--color-brand-primary)]/60'
                )}
              >
                {/* 番号バッジ */}
                <span className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400 flex-shrink-0">
                  {index + 1}
                </span>

                {/* 入力フィールド */}
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
                    'flex-1 bg-transparent border-0 outline-none',
                    'text-sm text-zinc-100 placeholder:text-zinc-600',
                    'py-0.5 leading-relaxed resize-none',
                    disabled && 'pointer-events-none opacity-50'
                  )}
                />

                {/* 文字数（上限付近のみ表示） */}
                {isNearLimit && (
                  <span className="text-[10px] text-amber-500 flex-shrink-0">
                    {remaining}
                  </span>
                )}

                {/* ピンボタン */}
                {showPinButton && (
                  <motion.button
                    type="button"
                    onClick={() => onPinToggle?.(index)}
                    disabled={disabled}
                    aria-label={isPinned ? 'ピンを解除する' : 'この項目をピンする'}
                    aria-pressed={isPinned}
                    whileTap={{ scale: 0.85 }}
                    className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-150',
                      isPinned
                        ? 'text-amber-400 bg-amber-400/10'
                        : 'text-zinc-600 hover:text-amber-400 hover:bg-amber-400/10'
                    )}
                  >
                    <Pin size={13} />
                  </motion.button>
                )}

                {/* 削除ボタン */}
                {items.length > 1 && (
                  <motion.button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={disabled}
                    aria-label={`項目 ${index + 1} を削除`}
                    whileTap={{ scale: 0.85 }}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors duration-150"
                  >
                    <Trash2 size={13} />
                  </motion.button>
                )}
              </div>
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
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-zinc-700 text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/40 transition-all duration-150 disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus size={15} />
          <span>追加する</span>
        </button>
      ) : (
        <p className="text-xs text-zinc-600 text-center py-1">
          最大{maxItems}件まで入力できます
        </p>
      )}
    </div>
  );
}
