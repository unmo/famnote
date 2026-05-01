import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SendHorizonal, Smile, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useAddJournalComment } from '@/hooks/useJournalComments';
import { useAuthStore } from '@/store/authStore';
import { STAMPS, STAMP_CATEGORIES, getStampById, type StampCategory } from '@/lib/stamps';

interface JournalCommentFormProps {
  journalId: string;
  onSubmitSuccess?: () => void;
}

const MAX_LENGTH = 200;

export function JournalCommentForm({ journalId, onSubmitSuccess }: JournalCommentFormProps) {
  const { t, i18n } = useTranslation();
  const { activeProfile, isManager } = useActiveProfile();
  const user = useAuthStore((s) => s.firebaseUser);
  const addComment = useAddJournalComment();
  const [text, setText] = useState('');
  const [stampId, setStampId] = useState<string | null>(null);
  const [showStampPicker, setShowStampPicker] = useState(false);
  const [stampCategory, setStampCategory] = useState<StampCategory>('cheer');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!isManager || !activeProfile || !user) return null;

  const trimmed = text.trim();
  const hasContent = trimmed.length > 0 || !!stampId;
  const isDisabled = !hasContent || text.length > MAX_LENGTH || addComment.isPending;

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => { adjustHeight(); }, [text, adjustHeight]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isDisabled) return;
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    await addComment.mutateAsync({
      journalId,
      userId: user.uid,
      displayName: activeProfile.displayName,
      avatarUrl: activeProfile.avatarUrl ?? null,
      role: 'parent',
      parentRole: activeProfile.parentRole ?? null,
      text: trimmed,
      stampId: stampId ?? undefined,
    });

    setText('');
    setStampId(null);
    setShowStampPicker(false);
    onSubmitSuccess?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
    if (e.key === 'Escape') textareaRef.current?.blur();
  };

  const counterColor =
    text.length > MAX_LENGTH ? 'text-red-400' :
    text.length > 180 ? 'text-sky-500' : 'text-zinc-600';

  const initial = activeProfile.displayName ? Array.from(activeProfile.displayName)[0] : '?';
  const isJa = i18n.language === 'ja';
  const selectedStamp = stampId ? getStampById(stampId) : null;

  return (
    <motion.form
      ref={formRef}
      aria-label={t('journals.commentInput')}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      onSubmit={handleSubmit}
      className="px-4 py-3 flex items-start gap-3"
    >
      {/* アバター */}
      <div className="flex-shrink-0 mt-0.5">
        {activeProfile.avatarUrl ? (
          <img src={activeProfile.avatarUrl} alt={activeProfile.displayName} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-sky-900/40 flex items-center justify-center text-xs font-bold text-sky-300">
            {initial}
          </div>
        )}
      </div>

      {/* 入力エリア */}
      <div className="flex-1 min-w-0">
        {/* 選択中スタンプのプレビュー */}
        <AnimatePresence>
          {selectedStamp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-2 inline-flex items-center gap-1.5 bg-sky-950/40 border border-sky-900/40 rounded-xl px-3 py-1.5"
            >
              <span className="text-2xl">{selectedStamp.emoji}</span>
              <span className="text-xs text-sky-300 font-medium">
                {isJa ? selectedStamp.label : selectedStamp.labelEn}
              </span>
              <button
                type="button"
                onClick={() => setStampId(null)}
                className="ml-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="スタンプを外す"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <label htmlFor="comment-input" className="sr-only">{t('journals.commentInput')}</label>
        <textarea
          ref={textareaRef}
          id="comment-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={addComment.isPending}
          placeholder={t('journals.encouragePlaceholder')}
          aria-describedby="char-count"
          rows={3}
          className={`w-full bg-zinc-800 border rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 resize-none min-h-[72px] max-h-[160px] overflow-y-auto focus:outline-none transition-colors duration-150 ${
            addComment.isPending ? 'opacity-50' : ''
          } ${
            trimmed.length > 0
              ? 'border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]/40'
              : 'border-zinc-700 focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]/40'
          }`}
        />

        {/* スタンプピッカー */}
        <AnimatePresence>
          {showStampPicker && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="mt-2 bg-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden"
            >
              {/* カテゴリタブ */}
              <div className="flex border-b border-zinc-700">
                {STAMP_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setStampCategory(cat.id)}
                    className={`flex-1 py-2 text-[11px] font-semibold transition-colors ${
                      stampCategory === cat.id
                        ? 'text-[var(--color-brand-primary)] border-b-2 border-[var(--color-brand-primary)] -mb-px'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {isJa ? cat.label : cat.labelEn}
                  </button>
                ))}
              </div>
              {/* スタンプグリッド */}
              <div className="p-3 grid grid-cols-8 gap-1.5">
                {STAMPS.filter((s) => s.category === stampCategory).map((stamp) => (
                  <motion.button
                    key={stamp.id}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => {
                      setStampId(stamp.id === stampId ? null : stamp.id);
                      setShowStampPicker(false);
                    }}
                    className={`flex items-center justify-center p-1.5 rounded-xl transition-colors ${
                      stampId === stamp.id
                        ? 'bg-sky-950/60 border border-sky-800/50'
                        : 'hover:bg-zinc-700'
                    }`}
                    title={isJa ? stamp.label : stamp.labelEn}
                  >
                    <span className="text-2xl leading-none">{stamp.emoji}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* フッター行 */}
        <div className="flex items-center gap-2 mt-2">
          {/* スタンプボタン */}
          <button
            type="button"
            onClick={() => setShowStampPicker((v) => !v)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              showStampPicker || stampId
                ? 'text-sky-400 bg-sky-950/40'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700'
            }`}
            aria-label="スタンプを選択"
          >
            <Smile size={16} />
          </button>

          <span id="char-count" aria-live="polite" className={`text-[11px] tabular-nums ${counterColor}`}>
            {text.length}/{MAX_LENGTH}
          </span>

          <button
            type="submit"
            aria-disabled={isDisabled}
            disabled={isDisabled}
            className={`ml-auto bg-[var(--color-brand-primary)] text-white rounded-lg px-4 h-[36px] text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
              isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            {addComment.isPending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>{t('common.sending')}</span>
              </>
            ) : (
              <>
                <SendHorizonal size={14} />
                <span>{t('common.send')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
