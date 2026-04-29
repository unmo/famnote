import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/shared/Avatar';
import { RoleSelector } from '@/components/shared/RoleSelector';
import { profileEditSchema } from '@/lib/validations/profileSchema';
import type { GroupMember, ParentRole } from '@/types/group';

interface ProfileEditFormProps {
  member: GroupMember;
  isChildProfile: boolean;
  onSave: (displayName: string, parentRole: ParentRole) => Promise<void>;
  className?: string;
}

// プロフィール名前インライン編集フォーム
// 鉛筆ボタンで編集状態に切り替わり、保存・キャンセルが可能
export function ProfileEditForm({ member, isChildProfile, onSave, className }: ProfileEditFormProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(member.displayName);
  const [parentRole, setParentRole] = useState<ParentRole>(member.parentRole ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // メンバーの表示名が外部から変更された場合（onSnapshot 更新）に値を同期する
  useEffect(() => {
    if (!isEditing) {
      setValue(member.displayName);
      setParentRole(member.parentRole ?? null);
    }
  }, [member.displayName, member.parentRole, isEditing]);

  // 編集開始時に入力フィールドに自動フォーカス
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setValue(member.displayName);
    setParentRole(member.parentRole ?? null);
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(member.displayName);
    setParentRole(member.parentRole ?? null);
    setError(null);
  };

  const handleSave = async () => {
    // Zod バリデーション
    const result = profileEditSchema.safeParse({ displayName: value });
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? t('profile.validationError'));
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(result.data.displayName, parentRole);
      setIsEditing(false);
    } catch {
      setError(t('profile.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {!isEditing ? (
          // 表示状態: アバター + 名前テキスト + 鉛筆ボタン
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between gap-3 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar src={member.avatarUrl} name={member.displayName} size="md" />
              <span className="text-zinc-50 font-medium text-sm flex-1 truncate">
                {member.displayName || t('profile.noName')}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              aria-label={t('profile.editNameAriaLabel', { name: member.displayName })}
              aria-expanded={isEditing}
              className="p-2 rounded-md text-zinc-400 hover:text-zinc-50 hover:bg-zinc-700 transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]
                         focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900
                         min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
            >
              <Pencil className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : (
          // 編集状態: アバター + テキストフィールド + 保存/キャンセルボタン
          <motion.div
            key="editing"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3">
              {/* アバター行 */}
              <div className="flex items-center gap-3">
                <Avatar src={member.avatarUrl} name={member.displayName} size="md" />
                <span className="text-zinc-400 text-xs">{t('profile.changeName')}</span>
              </div>

              {/* 入力フィールド */}
              <div>
                <input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={20}
                  disabled={isSaving}
                  placeholder={t('profile.namePlaceholder')}
                  aria-label={t('profile.nameLabel')}
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
                    <p className="text-red-400 text-xs" role="alert" aria-live="polite">
                      {error}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-zinc-500 text-xs" aria-label={t('profile.characterCount')}>
                    {value.length}/20
                  </span>
                </div>
              </div>

              {/* 役割選択セクション（子プロフィールには非表示） */}
              {!isChildProfile && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-zinc-300">{t('profile.parentRole')}</p>
                  <p className="text-xs text-zinc-500">{t('profile.parentRoleHint')}</p>
                  <RoleSelector
                    value={parentRole}
                    onChange={setParentRole}
                    disabled={isSaving}
                  />
                </div>
              )}

              {/* ボタン行 */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-md text-zinc-400 text-sm
                             hover:text-zinc-50 hover:bg-zinc-700 transition-colors
                             min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || value.trim().length === 0}
                  aria-busy={isSaving}
                  aria-disabled={isSaving}
                  className="px-4 py-1.5 rounded-md text-white text-sm font-medium
                             bg-[var(--color-brand-primary)] hover:opacity-90 transition-opacity
                             min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-1.5">
                      {/* ローディングスピナー */}
                      <svg
                        className="animate-spin w-3.5 h-3.5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('common.saving')}
                    </span>
                  ) : (
                    t('common.save')
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
