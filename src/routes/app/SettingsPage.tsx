import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Check, Lock, Copy, Users, UserPlus, Crown, X } from 'lucide-react';
import { toast } from 'sonner';
import { useThemeContext } from '@/theme/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { doc, collection, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { GroupMember } from '@/types/group';
import { Avatar } from '@/components/shared/Avatar';

// テーマ選択UIコンポーネント
function ThemeSelector() {
  const { t } = useTranslation();
  const { currentTheme, setTheme, themes } = useThemeContext();
  const { userProfile } = useAuthStore();
  const isPremium = userProfile?.subscriptionStatus !== 'free';
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleThemeClick = (themeId: string, isPremiumTheme: boolean) => {
    if (isPremiumTheme && !isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    setTheme(themeId);
  };

  return (
    <div>
      <h3 className="text-zinc-300 font-medium mb-3">{t('settings.themeSelect')}</h3>
      <div className="grid grid-cols-5 gap-3">
        {themes.map((theme) => {
          const isSelected = currentTheme.id === theme.id;
          const isLocked = theme.isPremium && !isPremium;
          return (
            <motion.button
              key={theme.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleThemeClick(theme.id, theme.isPremium)}
              title={theme.name}
              aria-label={`テーマ: ${theme.name}${isLocked ? '（プレミアム）' : ''}`}
              className="relative flex flex-col items-center gap-1.5"
            >
              {/* カラーチップ */}
              <div
                className={`w-10 h-10 rounded-full transition-all ${
                  isSelected ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: theme.primary }}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check size={16} className="text-white drop-shadow" />
                  </div>
                )}
                {/* ロックアイコン */}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <Lock size={12} className="text-white" />
                  </div>
                )}
              </div>
              <span className="text-[9px] text-zinc-500 truncate w-full text-center">
                {theme.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* アップグレード誘導モーダル */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <p className="text-2xl text-center mb-3">🔒</p>
            <h3 className="text-zinc-50 font-bold text-center mb-2">{t('settings.premiumRequired')}</h3>
            <p className="text-zinc-400 text-sm text-center mb-6">
              プレミアムプランにアップグレードすると全20種類のテーマが使えます
            </p>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="btn-secondary w-full"
            >
              {t('common.close')}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// 役割説明カード
function RoleGuide() {
  return (
    <div className="bg-zinc-800/40 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">役割と機能</p>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Crown size={14} className="text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-200">管理者（オーナー）</p>
          <p className="text-xs text-zinc-500 mt-0.5">全メンバーの記録を閲覧・試合振り返りにコメントできる。グループ設定の変更・メンバー追加が可能。</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-zinc-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Users size={14} className="text-zinc-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-200">メンバー（子供）</p>
          <p className="text-xs text-zinc-500 mt-0.5">練習・試合記録をつけられる。目標設定・振り返りが可能。管理者のコメントを受け取れる。</p>
        </div>
      </div>
    </div>
  );
}

// 子プロフィール追加フォーム
interface AddMemberFormProps {
  groupId: string;
  onSuccess: () => void;
  onCancel: () => void;
}
function AddMemberForm({ groupId, onSuccess, onCancel }: AddMemberFormProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      // ランダムなUIDを生成して子プロフィールを作成
      const uid = crypto.randomUUID();
      await setDoc(doc(db, 'groups', groupId, 'members', uid), {
        uid,
        displayName: trimmed,
        avatarUrl: null,
        sports: [],
        role: 'member',
        joinedAt: serverTimestamp(),
        lastActiveAt: null,
      });
      toast.success(`${trimmed} を追加しました`);
      onSuccess();
    } catch {
      toast.error('追加に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-zinc-800/60 rounded-xl p-4 space-y-3"
    >
      <p className="text-sm font-medium text-zinc-200">新しいメンバーを追加</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="名前（例: 太郎）"
        maxLength={20}
        autoFocus
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-brand-primary)]"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-medium"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={!name.trim() || isSubmitting}
          className="flex-1 py-2 rounded-lg bg-[var(--color-brand-primary)] text-white text-sm font-medium disabled:opacity-40"
        >
          {isSubmitting ? '追加中...' : '追加'}
        </button>
      </div>
    </motion.form>
  );
}

// グループ管理セクション
function GroupManagement() {
  const { t } = useTranslation();
  const { userProfile } = useAuthStore();
  const groupId = userProfile?.groupId;
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: members = [] } = useQuery({
    queryKey: ['groupMembers', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      if (!groupId) return [];
      const snap = await getDocs(collection(db, 'groups', groupId, 'members'));
      return snap.docs.map((d) => d.data() as GroupMember);
    },
  });

  const { data: groupDoc } = useQuery({
    queryKey: ['group', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      if (!groupId) return null;
      const { getDoc } = await import('firebase/firestore');
      const snap = await getDoc(doc(db, 'groups', groupId));
      return snap.exists() ? snap.data() : null;
    },
  });

  const inviteCode = (groupDoc as { inviteCode?: string } | null)?.inviteCode ?? '';
  const isOwner = members.find((m) => m.uid === userProfile?.uid)?.role === 'owner';
  const canAddMore = members.length < 10;

  const copyInviteCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode).then(() => {
      toast.success(t('onboarding.inviteCodeCopied'));
    }).catch(() => {
      toast.error('コピーに失敗しました');
    });
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
  };

  return (
    <div className="space-y-4">
      {/* 役割説明 */}
      <RoleGuide />

      {/* 招待コード */}
      {inviteCode && (
        <div className="bg-zinc-800/60 rounded-xl p-4">
          <p className="text-zinc-400 text-sm mb-2">{t('settings.inviteCode')}</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono font-bold text-zinc-50 tracking-widest">
              {inviteCode}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyInviteCode}
              className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label="招待コードをコピー"
            >
              <Copy size={18} />
            </motion.button>
          </div>
        </div>
      )}

      {/* メンバー一覧 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-zinc-400" />
          <p className="text-zinc-400 text-sm flex-1">{t('settings.members')} ({members.length}/10)</p>
          {isOwner && canAddMore && !showAddForm && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary)] text-xs font-medium border border-[var(--color-brand-primary)]/30"
            >
              <UserPlus size={13} />
              メンバーを追加
            </motion.button>
          )}
          {showAddForm && (
            <button onClick={() => setShowAddForm(false)} className="text-zinc-400 p-1">
              <X size={16} />
            </button>
          )}
        </div>

        {showAddForm && groupId && (
          <div className="mb-3">
            <AddMemberForm
              groupId={groupId}
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.uid} className="flex items-center gap-3 py-2">
              <Avatar size="sm" name={member.displayName} src={member.avatarUrl ?? undefined} />
              <div className="flex-1">
                <p className="text-zinc-200 text-sm font-medium">{member.displayName}</p>
              </div>
              {member.role === 'owner' ? (
                <span className="flex items-center gap-1 text-[10px] bg-amber-900/20 text-amber-400 border border-amber-800/30 rounded-full px-2 py-0.5">
                  <Crown size={9} />管理者
                </span>
              ) : (
                <span className="text-[10px] bg-zinc-800 text-zinc-500 border border-zinc-700 rounded-full px-2 py-0.5">
                  メンバー
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 設定ページ
export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-zinc-50">{t('settings.title')}</h1>

      {/* テーマ設定 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <h2 className="text-zinc-50 font-semibold mb-4 flex items-center gap-2">
          <span className="text-lg">🎨</span>
          {t('settings.theme')}
        </h2>
        <ThemeSelector />
      </motion.div>

      {/* グループ管理 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <h2 className="text-zinc-50 font-semibold mb-4 flex items-center gap-2">
          <span className="text-lg">👨‍👩‍👧‍👦</span>
          {t('settings.group')}
        </h2>
        <GroupManagement />
      </motion.div>
    </div>
  );
}
