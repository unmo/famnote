import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { Crown, User, AlertCircle, Pencil } from 'lucide-react';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { RoleBadge } from '@/components/shared/RoleBadge';
import type { GroupMember } from '@/types/group';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { updateMemberDisplayName } from '@/lib/firebase/firestore';
import { toast } from 'sonner';
import { profileEditSchema } from '@/lib/validations/profileSchema';

const REDIRECT_KEY = 'famnote_redirect_after_profile';

function consumeRedirectPath(): string {
  try {
    const path = sessionStorage.getItem(REDIRECT_KEY);
    if (path) {
      sessionStorage.removeItem(REDIRECT_KEY);
      return path;
    }
  } catch { /* ignore */ }
  return '/dashboard';
}

// スケルトンカード（ローディング中に表示）
function SkeletonProfileCard() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-24 h-24 rounded-xl bg-zinc-800 animate-pulse" />
      <div className="w-16 h-3 rounded-full bg-zinc-800 animate-pulse" />
      <div className="w-10 h-3 rounded-full bg-zinc-800 animate-pulse" />
    </div>
  );
}

// エラー状態の表示
interface ProfileSelectErrorProps {
  onRetry: () => void;
}
function ProfileSelectError({ onRetry }: ProfileSelectErrorProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <p className="text-zinc-300 text-base font-medium">{t('profileSelect.memberFetchFailed')}</p>
      <p className="text-zinc-500 text-sm">{t('profileSelect.networkError')}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 rounded-lg bg-[var(--color-brand-primary)] text-white text-sm font-medium hover:opacity-90 active:opacity-80 transition-opacity"
      >
        {t('profileSelect.reload')}
      </button>
    </div>
  );
}

// プロフィールカードの編集ボタン（インライン編集フォーム付き）
interface ProfileSelectEditButtonProps {
  member: GroupMember;
  groupId: string;
}

function ProfileSelectEditButton({ member, groupId }: ProfileSelectEditButtonProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(member.displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 外部からの名前変更を反映
  useEffect(() => {
    if (!isEditing) {
      setValue(member.displayName);
    }
  }, [member.displayName, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleEditClick = (e: React.MouseEvent) => {
    // プロフィール選択の onClick を妨げないよう伝播を止める
    e.stopPropagation();
    setValue(member.displayName);
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = profileEditSchema.safeParse({ displayName: value });
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? t('profile.validationError'));
      return;
    }
    setIsSaving(true);
    try {
      await updateMemberDisplayName(groupId, member.uid, result.data.displayName, member.isChildProfile ?? false);
      toast.success(t('profile.updateSuccess'));
      setIsEditing(false);
    } catch {
      toast.error(t('profile.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* 鉛筆ボタン（常時表示 on モバイル、hover 時のみ on デスクトップ） */}
      {!isEditing && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleEditClick}
          aria-label={`${member.displayName}の名前を編集`}
          className="absolute bottom-1 right-1 w-7 h-7 rounded-full
                     bg-zinc-900/90 backdrop-blur-sm border border-zinc-700
                     flex items-center justify-center text-zinc-300
                     hover:text-white hover:border-[var(--color-brand-primary)] hover:bg-zinc-800
                     transition-all z-10
                     opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                     focus-visible:opacity-100 focus-visible:outline-none
                     focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
        >
          <Pencil className="w-3 h-3" />
        </motion.button>
      )}

      {/* インライン編集フォーム */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 -bottom-[90px] z-20 flex flex-col items-center gap-2 w-[96px]"
          >
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsEditing(false);
              }}
              maxLength={20}
              disabled={isSaving}
              placeholder={t('profile.namePlaceholder')}
              aria-label={t('profile.nameLabel')}
              aria-invalid={!!error}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-center bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1
                         text-zinc-50 text-xs
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]
                         placeholder:text-zinc-500"
            />
            {error && <p className="text-red-400 text-[10px]">{error}</p>}
            <div className="flex gap-1.5">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="p-1.5 rounded-md text-xs text-zinc-400 hover:bg-zinc-800 min-h-[32px] px-2"
              >
                ✕
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || value.trim().length === 0}
                className="p-1.5 rounded-md text-xs bg-[var(--color-brand-primary)] text-white hover:opacity-90 min-h-[32px] px-2 disabled:opacity-50"
              >
                {isSaving ? '...' : t('common.save')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function ProfileSelectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { members, activeProfile, setActiveProfile } = useActiveProfile();
  const isLoading = useAuthStore((s) => s.isLoading);
  const { group } = useGroupStore();
  const { firebaseUser } = useAuthStore();

  // ログインユーザーがオーナーかどうかを確認
  const selfMember = members.find((m) => m.uid === firebaseUser?.uid);
  const isOwner = selfMember?.role === 'owner';

  // セッション復元でプロフィールが自動設定された場合は保存パスへ遷移
  useEffect(() => {
    if (activeProfile) {
      navigate(consumeRedirectPath(), { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]);

  const handleSelect = (member: GroupMember) => {
    setActiveProfile(member);
    navigate(consumeRedirectPath(), { replace: true });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // isLoadingがtrueかつメンバーが0件のときスケルトンを表示
  const showSkeleton = isLoading && members.length === 0;
  // isLoadingがfalseでメンバーが0件のときエラー状態を表示
  const showError = !isLoading && members.length === 0;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 sm:px-6">
      {/* ロゴ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-10 flex items-center gap-2"
      >
        <img src="/favicon.svg" alt="FamNote" className="w-10 h-10" />
        <span className="text-2xl font-bold text-white tracking-wider">
          Fam<span className="text-[var(--color-brand-primary)]">Note</span>
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-2xl md:text-3xl font-bold text-white mb-2 text-center"
      >
        {t('profileSelect.whoUsing')}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-zinc-400 mb-10 text-center text-sm"
      >
        {t('profileSelect.selectProfile')}
      </motion.p>

      {/* スケルトンローディング */}
      {showSkeleton && (
        <div className="flex flex-wrap justify-center gap-6 max-w-2xl w-full">
          <SkeletonProfileCard />
          <SkeletonProfileCard />
          <SkeletonProfileCard />
        </div>
      )}

      {/* エラー状態 */}
      {showError && <ProfileSelectError onRetry={handleRetry} />}

      {/* プロフィールグリッド */}
      {members.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
          className="flex flex-wrap justify-center gap-6 max-w-2xl w-full"
        >
          {members.map((member, i) => (
            <motion.div
              key={member.uid}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.3, ease: 'easeOut' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(member)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(member); } }}
              aria-label={`${member.displayName}${member.role === 'owner' ? ` (${t('profile.admin')})` : ''}`}
              className="flex flex-col items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 min-w-[80px] cursor-pointer"
            >
              {/* アバター */}
              <div className="relative">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-[var(--color-brand-primary)] transition-all duration-200 bg-zinc-800">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-zinc-500" />
                    </div>
                  )}
                </div>
                {/* オーナーバッジ */}
                {member.role === 'owner' && (
                  <div className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-1 shadow-md shadow-amber-900/30">
                    <Crown className="w-3 h-3 text-amber-900" />
                  </div>
                )}
                {/* 編集ボタン（オーナーのみ表示） */}
                {isOwner && group && (
                  <ProfileSelectEditButton member={member} groupId={group.id} />
                )}
              </div>
              {/* 名前 */}
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors duration-200 text-center max-w-[96px] truncate">
                {member.displayName}
              </span>
              {/* バッジエリア: 役割バッジ・管理者バッジ */}
              <div className="flex items-center justify-center gap-1 flex-wrap -mt-2">
                <RoleBadge
                  parentRole={member.parentRole}
                  aria-label={member.parentRole ? `役割: ${member.parentRole === 'father' ? t('profile.parentRoleFather') : t('profile.parentRoleMother')}` : undefined}
                />
                {member.role === 'owner' && (
                  <span className="text-[10px] font-medium text-amber-400 tracking-wide">{t('profile.admin')}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
