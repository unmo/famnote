import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { useProfileStore } from '@/store/profileStore';
import { updateMemberDisplayName, addChildProfile, deleteChildProfile } from '@/lib/firebase/firestore';
import { ProfileEditForm } from './ProfileEditForm';
import { ChildProfileList } from './ChildProfileList';
import { AddChildProfileForm } from './AddChildProfileForm';
import type { GroupMember } from '@/types/group';

// プロフィール管理セクション（SettingsPage に追加するセクション全体）
// オーナーは自分のプロフィール編集・子プロフィールの追加/編集/削除が可能
// メンバーは自分のプロフィール名の編集のみ可能
export function ProfileManagementSection() {
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

  // 自分のプロフィール名前を保存する
  const handleSaveSelf = async (displayName: string) => {
    if (!group.id) return;
    await updateMemberDisplayName(group.id, firebaseUser.uid, displayName, false);
    toast.success('プロフィールを更新しました');
  };

  // 子プロフィールの名前を編集する
  const handleEditChild = async (member: GroupMember, newName: string) => {
    if (!group.id) return;
    await updateMemberDisplayName(group.id, member.uid, newName, true);
    toast.success('プロフィールを更新しました');
  };

  // 子プロフィールを削除する
  const handleDeleteChild = async (memberUid: string) => {
    if (!group.id) return;
    await deleteChildProfile(group.id, memberUid);

    // 削除対象が現在アクティブなプロフィールだった場合、セッションをクリアして再選択を促す
    if (activeProfile?.uid === memberUid) {
      clearActiveProfile();
    }

    toast.success('メンバーを削除しました');
  };

  // 子プロフィールを追加する
  const handleAddChild = async (displayName: string) => {
    if (!group.id) return;

    // グループ上限チェック
    if (group.memberCount >= group.maxMembers) {
      toast.error('メンバーは最大10名までです');
      throw new Error('MEMBER_LIMIT_REACHED');
    }

    await addChildProfile(group.id, displayName);
    toast.success('メンバーを追加しました');
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
        プロフィール管理
      </h2>

      {/* 自分のプロフィール */}
      <h3 className="text-zinc-300 font-medium text-sm mb-3">あなたのプロフィール</h3>
      <ProfileEditForm
        member={selfMember}
        isChildProfile={false}
        onSave={handleSaveSelf}
      />

      {/* 子プロフィール管理（オーナーのみ表示） */}
      {isOwner && (
        <>
          <h3 className="text-zinc-300 font-medium text-sm mb-3 mt-5">メンバー</h3>
          <ChildProfileList
            members={childMembers}
            isLoading={isLoadingMembers}
            onEdit={handleEditChild}
            onDelete={handleDeleteChild}
          />
          <AddChildProfileForm
            onAdd={handleAddChild}
            isAtMemberLimit={group.memberCount >= group.maxMembers}
            maxMembers={group.maxMembers}
          />
        </>
      )}
    </motion.div>
  );
}
