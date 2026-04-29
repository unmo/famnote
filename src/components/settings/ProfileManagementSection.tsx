import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { useProfileStore } from '@/store/profileStore';
import { updateMemberProfile, updateMemberDisplayName, addChildProfile, deleteChildProfile } from '@/lib/firebase/firestore';
import { ProfileEditForm } from './ProfileEditForm';
import { ChildProfileList } from './ChildProfileList';
import { AddChildProfileForm } from './AddChildProfileForm';
import type { GroupMember, ParentRole } from '@/types/group';

// プロフィール管理セクション（SettingsPage に追加するセクション全体）
// オーナーは自分のプロフィール編集・子プロフィールの追加/編集/削除が可能
// メンバーは自分のプロフィール名の編集のみ可能
export function ProfileManagementSection() {
  const { t } = useTranslation();
  const { firebaseUser, userProfile } = useAuthStore();
  const { group, members } = useGroupStore();
  const { activeProfile, clearActiveProfile } = useProfileStore();

  if (!firebaseUser || !userProfile || !group) {
    return null;
  }

  // 自分自身の member ドキュメントを取得
  const selfMember = members.find((m) => m.uid === firebaseUser.uid);
  if (!selfMember) {
    return null;
  }

  const isOwner = selfMember.role === 'owner';
  // 子プロフィール一覧（isChildProfile フラグありのメンバー）
  const childMembers = members.filter((m) => m.isChildProfile === true);
  const isLoadingMembers = false; // onSnapshot でリアルタイム更新されるため常に false

  // 自分のプロフィール（名前・役割）を保存する
  const handleSaveSelf = async (displayName: string, parentRole: ParentRole) => {
    if (!group.id) return;
    await updateMemberProfile(group.id, firebaseUser.uid, { displayName, parentRole }, false);
    toast.success(t('profile.updateSuccess'));
  };

  // 子プロフィールの名前を編集する
  const handleEditChild = async (member: GroupMember, newName: string) => {
    if (!group.id) return;
    await updateMemberDisplayName(group.id, member.uid, newName, true);
    toast.success(t('profile.updateSuccess'));
  };

  // 子プロフィールを削除する
  const handleDeleteChild = async (memberUid: string) => {
    if (!group.id) return;
    await deleteChildProfile(group.id, memberUid);

    // 削除対象が現在アクティブなプロフィールだった場合、セッションをクリアして再選択を促す
    if (activeProfile?.uid === memberUid) {
      clearActiveProfile();
    }

    toast.success(t('profile.memberDeleted'));
  };

  // 子プロフィールを追加する
  const handleAddChild = async (displayName: string, parentRole: import('@/types/group').ParentRole) => {
    if (!group.id) throw new Error('NO_GROUP_ID');

    if (members.length >= group.maxMembers) {
      toast.error(t('profile.memberLimit', { max: group.maxMembers }));
      throw new Error('MEMBER_LIMIT_REACHED');
    }

    await addChildProfile(group.id, displayName, parentRole);
    toast.success(t('profile.memberAdded'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
    >
      {/* カードヘッダー */}
      <h2 className="text-zinc-50 font-semibold mb-4 flex items-center gap-2">
        <span className="text-lg">👤</span>
        {t('profile.management')}
      </h2>

      {/* 自分のプロフィール */}
      <h3 className="text-zinc-300 font-medium text-sm mb-3">{t('profile.yourProfile')}</h3>
      <ProfileEditForm
        member={selfMember}
        isChildProfile={false}
        onSave={handleSaveSelf}
      />

      {/* 子プロフィール管理（オーナーのみ表示） */}
      {isOwner && (
        <>
          <h3 className="text-zinc-300 font-medium text-sm mb-3 mt-5">{t('profile.membersSection')}</h3>
          <ChildProfileList
            members={childMembers}
            isLoading={isLoadingMembers}
            onEdit={handleEditChild}
            onDelete={handleDeleteChild}
          />
          <AddChildProfileForm
            onAdd={handleAddChild}
            isAtMemberLimit={members.length >= group.maxMembers}
            maxMembers={group.maxMembers}
          />
        </>
      )}
    </motion.div>
  );
}
