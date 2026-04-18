import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Check, Lock, Copy, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useThemeContext } from '@/theme/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { doc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';
import type { GroupMember } from '@/types/group';
import { Avatar } from '@/components/shared/Avatar';
import type { Sport } from '@/types/sport';
import { SportBadge } from '@/components/shared/SportBadge';

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

// グループ管理セクション
function GroupManagement() {
  const { t } = useTranslation();
  const { userProfile } = useAuthStore();
  const groupId = userProfile?.groupId;

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

  const copyInviteCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode).then(() => {
      toast.success(t('onboarding.inviteCodeCopied'));
    }).catch(() => {
      toast.error('コピーに失敗しました');
    });
  };

  return (
    <div className="space-y-4">
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
          <p className="text-zinc-400 text-sm">{t('settings.members')} ({members.length}/10)</p>
        </div>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.uid} className="flex items-center gap-3 py-2">
              <Avatar size="sm" name={member.displayName} src={member.avatarUrl ?? undefined} />
              <div className="flex-1">
                <p className="text-zinc-200 text-sm font-medium">{member.displayName}</p>
                <div className="flex gap-1 mt-0.5">
                  {member.sports?.slice(0, 3).map((sport) => (
                    <SportBadge key={sport} sport={sport as Sport} size="sm" />
                  ))}
                </div>
              </div>
              {member.role === 'owner' && (
                <span className="text-[10px] bg-[color-mix(in_srgb,var(--color-brand-primary)_15%,transparent)] text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/30 rounded-full px-2 py-0.5">
                  オーナー
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
