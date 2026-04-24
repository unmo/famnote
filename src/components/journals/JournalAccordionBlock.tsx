import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { motion } from 'motion/react';
import { ChevronDown, Pencil } from 'lucide-react';

interface JournalAccordionBlockProps {
  icon: string;
  title: string;
  defaultOpen?: boolean;
  onEdit?: () => void; // 未指定なら編集ボタン非表示
  children: React.ReactNode;
}

const contentVariants = {
  open: {
    height: 'auto' as const,
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
};

export function JournalAccordionBlock({
  icon,
  title,
  defaultOpen = true,
  onEdit,
  children,
}: JournalAccordionBlockProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const contentId = `accordion-content-${title.replace(/\s/g, '-')}`;

  return (
    <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900">
      {/* ヘッダー行: button内にbuttonをネストできないため divベースで実装しキーボード操作に対応 */}
      <div
        role="button"
        tabIndex={0}
        className="flex items-center gap-2 px-4 min-h-[44px] border-b border-zinc-800/60 cursor-pointer hover:bg-zinc-800/40 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-inset"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        aria-expanded={isOpen}
        aria-controls={contentId}
        aria-label={isOpen ? 'セクションを折りたたむ' : 'セクションを展開する'}
      >
        <div className="flex items-center gap-2 flex-1 text-sm font-semibold text-zinc-300">
          <span aria-hidden="true">{icon}</span>
          <span>{title}</span>
        </div>

        {/* 編集ボタン（onEditが渡された場合のみ表示） */}
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label={`${title}を編集する`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 hover:text-zinc-200 hover:bg-zinc-700 transition-colors duration-150 min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          >
            <Pencil size={11} aria-hidden="true" />
            編集
          </button>
        )}

        {/* トグルアイコン */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="min-w-[32px] min-h-[32px] flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors duration-150"
          aria-hidden="true"
        >
          <ChevronDown size={16} />
        </motion.div>
      </div>

      {/* コンテンツ */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            id={contentId}
            initial="closed"
            animate="open"
            exit="closed"
            variants={contentVariants}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 py-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
