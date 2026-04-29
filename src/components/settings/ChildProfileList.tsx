import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/shared/Avatar';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { profileEditSchema } from '@/lib/validations/profileSchema';
import type { GroupMember } from '@/types/group';

// スケルトンローディング（3件分）
function ChildProfileListSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="読み込み中">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-700 animate-pulse shrink-0" />
          <div className="w-24 h-3 rounded-full bg-zinc-700 animate-pulse flex-1" />
          <div className="w-16 h-6 rounded-md bg-zinc-700/50 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

interface ChildProfileCardProps {
  member: GroupMember;
  onEdit: (member: GroupMember, newName: string) => Promise<void>;
  onDelete: (memberUid: string) => Promise<void>;
}

// 子プロフィール 1件分のカードコンポーネント
function ChildProfileCard({ member, onEdit, onDelete }: ChildProfileCardProps) {
  const [state, setState] = useState<'display' | 'editing' | 'confirming'>('display');
  const [editValue, setEditValue] = useState(member.displayName);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 外部からの名前変更を反映（編集中は上書きしない）
  useEffect(() => {
    if (state === 'display') {
      setEditValue(member.displayName);
    }
  }, [member.displayName, state]);

  // 編集開始時に自動フォーカス
  useEffect(() => {
    if (state === 'editing') {
      inputRef.current?.focus();
    }
  }, [state]);

  const handleEditStart = () => {
    setEditValue(member.displayName);
    setEditError(null);
    setState('editing');
  };

  const handleEditCancel = () => {
    setState('display');
    setEditValue(member.displayName);
    setEditError(null);
  };

  const handleEditSave = async () => {
    const result = profileEditSchema.safeParse({ displayName: editValue });
    if (!result.success) {
      setEditError(result.error.errors[0]?.message ?? '入力内容を確認してください');
      return;
    }
    setIsSaving(true);
    setEditError(null);
    try {
      await onEdit(member, result.data.displayName);
      setState('display');
    } catch {
      setEditError('保存に失敗しました。もう一度お試しください');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleDeleteStart = () => {
    setState('confirming');
  };

  const handleDeleteCancel = () => {
    setState('display');
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(member.uid);
      // 削除後はアニメーションで消えるため setState 不要
    } catch {
      setState('display');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {state === 'display' && (
        // 通常表示状態
        <motion.div
          key="display"
          variants={{
            hidden: { opacity: 0, x: -8 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
          }}
          exit={{ opacity: 0, x: 8, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3"
        >
          <Avatar src={member.avatarUrl} name={member.displayName} size="sm" />
          <span className="text-zinc-50 text-sm font-medium flex-1 truncate">
            {member.displayName || '（名前未設定）'}
          </span>
          <RoleBadge parentRole={member.parentRole} />
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEditStart}
              aria-label={`${member.displayName}の名前を編集`}
              className="p-2 rounded-md text-zinc-400 hover:text-zinc-50 hover:bg-zinc-700
                         transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
            >
              <Pencil className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteStart}
              aria-label={`${member.displayName}を削除`}
              className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10
                         transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {state === 'editing' && (
        // 編集フォーム
        <motion.div
          key="editing"
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="flex flex-col gap-3 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar src={member.avatarUrl} name={member.displayName} size="sm" />
              <span className="text-zinc-400 text-xs">名前を変更</span>
            </div>
            <div>
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleEditKeyDown}
                maxLength={20}
                disabled={isSaving}
                placeholder="名前を入力"
                aria-label="名前"
                aria-invalid={!!editError}
                className={`w-full bg-zinc-900 border rounded-lg px-3 py-2
                            text-zinc-50 text-sm
                            focus:outline-none focus:ring-2 focus:border-transparent
                            placeholder:text-zinc-500 transition-all duration-150
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${editError
                              ? 'border-red-500/50 focus:ring-red-500'
                              : 'border-zinc-700 focus:ring-[var(--color-brand-primary)]'
                            }`}
              />
              <div className="flex justify-between mt-1">
                {editError ? (
                  <p className="text-red-400 text-xs" role="alert" aria-live="polite">{editError}</p>
                ) : (
                  <span />
                )}
                <span className="text-zinc-500 text-xs" aria-label="文字数">{editValue.length}/20</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleEditCancel}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-md text-zinc-400 text-sm
                           hover:text-zinc-50 hover:bg-zinc-700 transition-colors
                           min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                キャンセル
              </button>
              <button
                onClick={handleEditSave}
                disabled={isSaving || editValue.trim().length === 0}
                aria-busy={isSaving}
                aria-disabled={isSaving}
                className="px-4 py-1.5 rounded-md text-white text-sm font-medium
                           bg-[var(--color-brand-primary)] hover:opacity-90 transition-opacity
                           min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    保存中...
                  </span>
                ) : '保存'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {state === 'confirming' && (
        // 削除確認状態（インラインで表示）
        <motion.div
          key="confirming"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          role="region"
          aria-label="削除確認"
          className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 flex flex-col gap-3"
        >
          <p className="text-zinc-300 text-sm">
            本当に「<span className="font-semibold text-zinc-50">{member.displayName}</span>」を削除しますか？
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded-md text-zinc-400 text-sm
                         hover:text-zinc-50 hover:bg-zinc-700 transition-colors
                         min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              aria-busy={isDeleting}
              className="px-4 py-1.5 rounded-md text-white text-sm font-medium
                         bg-red-500 hover:bg-red-600 transition-colors
                         min-h-[36px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  削除中...
                </span>
              ) : '削除する'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ChildProfileListProps {
  members: GroupMember[];
  isLoading: boolean;
  onEdit: (member: GroupMember, newName: string) => Promise<void>;
  onDelete: (memberUid: string) => Promise<void>;
}

// 子プロフィール一覧コンポーネント
// スケルトン・空状態・通常表示の3つの状態を持つ
export function ChildProfileList({ members, isLoading, onEdit, onDelete }: ChildProfileListProps) {
  if (isLoading) {
    return <ChildProfileListSkeleton />;
  }

  if (members.length === 0) {
    // 空状態
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <span className="text-3xl">👶</span>
        <p className="text-zinc-400 text-sm font-medium">まだ子プロフィールがありません</p>
        <p className="text-zinc-500 text-xs">追加して家族みんなで使いましょう</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-2 max-h-[320px] overflow-y-auto pr-1"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {members.map((member) => (
          <ChildProfileCard
            key={member.uid}
            member={member}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
