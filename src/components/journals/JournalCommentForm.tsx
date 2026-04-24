import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { SendHorizonal } from 'lucide-react';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useAddJournalComment } from '@/hooks/useJournalComments';
import { useAuthStore } from '@/store/authStore';

interface JournalCommentFormProps {
  journalId: string;
  onSubmitSuccess?: () => void;
}

const MAX_LENGTH = 200;

/**
 * 管理者（isManager=true）専用のコメント入力フォーム
 * isManager=false の場合はレンダリングしない
 */
export function JournalCommentForm({ journalId, onSubmitSuccess }: JournalCommentFormProps) {
  const { activeProfile, isManager } = useActiveProfile();
  const user = useAuthStore((s) => s.firebaseUser);
  const addComment = useAddJournalComment();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // 管理者以外はレンダリングしない
  if (!isManager || !activeProfile || !user) return null;

  const trimmed = text.trim();
  const isDisabled = trimmed.length === 0 || text.length > MAX_LENGTH || addComment.isPending;

  // テキストエリアの高さを内容に合わせて自動調整
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isDisabled) return;

    // 送信時にフォームをスクロールして見えるようにする
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    await addComment.mutateAsync({
      journalId,
      userId: user.uid,
      displayName: activeProfile.displayName,
      avatarUrl: activeProfile.avatarUrl ?? null,
      role: 'parent',
      text: trimmed,
    });

    setText('');
    onSubmitSuccess?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter / Ctrl+Enter で送信
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    // Escape でフォーカスを外す
    if (e.key === 'Escape') {
      textareaRef.current?.blur();
    }
  };

  // 文字数カウンターの色
  const counterColor =
    text.length > MAX_LENGTH
      ? 'text-red-400'
      : text.length > 180
      ? 'text-amber-500'
      : 'text-zinc-600';

  // アバターのイニシャル
  const initial = activeProfile.displayName
    ? Array.from(activeProfile.displayName)[0]
    : '?';

  return (
    <motion.form
      ref={formRef}
      aria-label="コメントを入力"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      onSubmit={handleSubmit}
      className="px-4 py-3 flex items-start gap-3"
    >
      {/* アバター */}
      <div className="flex-shrink-0 mt-0.5">
        {activeProfile.avatarUrl ? (
          <img
            src={activeProfile.avatarUrl}
            alt={activeProfile.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center text-xs font-bold text-amber-300">
            {initial}
          </div>
        )}
      </div>

      {/* 入力エリア */}
      <div className="flex-1 min-w-0">
        <label htmlFor="comment-input" className="sr-only">
          コメントを入力
        </label>
        <textarea
          ref={textareaRef}
          id="comment-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          disabled={addComment.isPending}
          placeholder="「よくがんばったね！」など励ましのコメントを送ろう"
          aria-describedby="char-count"
          aria-required="true"
          rows={3}
          className={`w-full bg-zinc-800 border rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 resize-none min-h-[72px] max-h-[160px] overflow-y-auto focus:outline-none transition-colors duration-150 ${
            addComment.isPending ? 'opacity-50' : ''
          } ${
            trimmed.length > 0
              ? 'border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]/40'
              : 'border-zinc-700 focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]/40'
          }`}
        />

        {/* フッター行 */}
        <div className="flex items-center justify-end gap-2 mt-2">
          <span
            id="char-count"
            aria-live="polite"
            className={`text-[11px] tabular-nums ${counterColor}`}
          >
            {text.length}/{MAX_LENGTH}
          </span>

          <button
            type="submit"
            aria-disabled={isDisabled}
            disabled={isDisabled}
            className={`bg-[var(--color-brand-primary)] text-white rounded-lg px-4 h-[36px] text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
              isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            {addComment.isPending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>送信中...</span>
              </>
            ) : (
              <>
                <SendHorizonal size={14} />
                <span>送信</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
