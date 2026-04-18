import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { SportBadge } from '@/components/shared/SportBadge';
import { Avatar } from '@/components/shared/Avatar';
import { LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Sport } from '@/types/sport';

// バッジ定義（ストリーク・実績バッジ）
const BADGES = [
  { id: 'first_record', emoji: '👟', nameKey: 'badges.first_record', desc: '最初の記録' },
  { id: 'streak_3', emoji: '🔥', nameKey: 'badges.streak_3', desc: '3日連続' },
  { id: 'streak_7', emoji: '⚔️', nameKey: 'badges.streak_7', desc: '7日連続' },
  { id: 'streak_30', emoji: '🏆', nameKey: 'badges.streak_30', desc: '30日連続' },
  { id: 'streak_100', emoji: '💎', nameKey: 'badges.streak_100', desc: '100日連続' },
  { id: 'notes_50', emoji: '📝', nameKey: 'badges.notes_50', desc: '50件記録' },
  { id: 'reaction_10', emoji: '🤝', nameKey: 'badges.reaction_10', desc: '10回リアクション' },
];

// 自プロフィールページ
export function MyProfilePage() {
  const { t } = useTranslation();
  const { userProfile } = useAuthStore();
  const { logOut } = useAuth();

  // 取得済みバッジを判定（ストリーク数・記録数から簡易判定）
  const earnedBadgeIds = new Set<string>();
  if (userProfile) {
    if (userProfile.totalNotes > 0 || userProfile.totalMatches > 0) earnedBadgeIds.add('first_record');
    if (userProfile.currentStreak >= 3) earnedBadgeIds.add('streak_3');
    if (userProfile.currentStreak >= 7) earnedBadgeIds.add('streak_7');
    if (userProfile.longestStreak >= 30) earnedBadgeIds.add('streak_30');
    if (userProfile.longestStreak >= 100) earnedBadgeIds.add('streak_100');
    if (userProfile.totalNotes >= 50) earnedBadgeIds.add('notes_50');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* プロフィールヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <div className="flex items-center gap-4">
          <Avatar size="lg" name={userProfile?.displayName ?? ''} src={userProfile?.avatarUrl ?? undefined} />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-zinc-50">{userProfile?.displayName}</h1>
            <p className="text-zinc-500 text-sm">{userProfile?.email}</p>
            {/* スポーツバッジ */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {userProfile?.sports?.map((sport) => (
                <SportBadge key={sport} sport={sport as Sport} size="sm" />
              ))}
            </div>
          </div>
          <Link
            to="/settings"
            className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            aria-label="設定"
          >
            <Settings size={20} />
          </Link>
        </div>
      </motion.div>

      {/* 統計カード */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-50 mb-3">{t('profile.stats')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('profile.totalNotes'), value: userProfile?.totalNotes ?? 0, emoji: '📝' },
            { label: t('profile.totalMatches'), value: userProfile?.totalMatches ?? 0, emoji: '⚽' },
            { label: t('profile.currentStreak'), value: `${userProfile?.currentStreak ?? 0}日`, emoji: '🔥' },
            { label: t('profile.longestStreak'), value: `${userProfile?.longestStreak ?? 0}日`, emoji: '🏆' },
          ].map(({ label, value, emoji }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.02 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
            >
              <p className="text-2xl mb-1">{emoji}</p>
              <p className="text-2xl font-bold text-zinc-50">{value}</p>
              <p className="text-zinc-500 text-xs">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* バッジ一覧 */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-50 mb-3">{t('profile.badges')}</h2>
        <div className="grid grid-cols-4 gap-3">
          {BADGES.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                title={badge.desc}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${
                  earned
                    ? 'bg-zinc-900 border-zinc-700'
                    : 'bg-zinc-950 border-zinc-800 opacity-40'
                }`}
              >
                <span className="text-3xl">{badge.emoji}</span>
                <span className="text-[10px] text-zinc-400 text-center leading-tight">
                  {t(badge.nameKey)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ログアウトボタン */}
      <button
        onClick={logOut}
        className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm w-full justify-center py-3"
      >
        <LogOut size={16} />
        {t('auth.logout')}
      </button>
    </div>
  );
}
