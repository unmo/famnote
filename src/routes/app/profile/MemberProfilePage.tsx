import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Avatar } from '@/components/shared/Avatar';
import { SportBadge } from '@/components/shared/SportBadge';
import type { User } from '@/types/user';
import type { Sport } from '@/types/sport';

// 他メンバーのプロフィールページ
export function MemberProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;
      const snap = await getDoc(doc(db, 'users', userId));
      if (!snap.exists()) return null;
      return snap.data() as User;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-zinc-400">メンバーが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-zinc-50">{t('profile.title')}</h1>
      </div>

      {/* プロフィールカード */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <div className="flex items-center gap-4">
          <Avatar size="lg" name={member.displayName} src={member.avatarUrl ?? undefined} />
          <div>
            <h2 className="text-xl font-bold text-zinc-50">{member.displayName}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {member.sports?.map((sport) => (
                <SportBadge key={sport} sport={sport as Sport} size="sm" />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 統計 */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-50 mb-3">{t('profile.stats')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('profile.totalNotes'), value: member.totalNotes ?? 0, emoji: '📝' },
            { label: t('profile.totalMatches'), value: member.totalMatches ?? 0, emoji: '⚽' },
            { label: t('profile.currentStreak'), value: `${member.currentStreak ?? 0}日`, emoji: '🔥' },
            { label: t('profile.longestStreak'), value: `${member.longestStreak ?? 0}日`, emoji: '🏆' },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-2xl mb-1">{emoji}</p>
              <p className="text-2xl font-bold text-zinc-50">{value}</p>
              <p className="text-zinc-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
