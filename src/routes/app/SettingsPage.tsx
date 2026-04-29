import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { useStreak } from '@/hooks/useStreak';
import { calculateStreak } from '@/lib/utils/streak';
import { db } from '@/lib/firebase/config';
import { Avatar } from '@/components/shared/Avatar';
import { ProfileManagementSection } from '@/components/settings/ProfileManagementSection';
import type { Note } from '@/types/note';

// ─── プロフィール統計フック ───────────────────────────────
function useProfileStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['profileStats', userId],
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      if (!userId) return { totalNotes: 0, totalJournals: 0, recordDates: [] as Date[] };
      const [notesSnap, journalsSnap] = await Promise.all([
        getDocs(query(collection(db, 'notes'), where('userId', '==', userId), where('isDraft', '==', false), limit(200))),
        getDocs(query(collection(db, 'matchJournals'), where('userId', '==', userId), limit(200))),
      ]);
      const recordDates = notesSnap.docs
        .map((d) => (d.data() as Note).createdAt?.toDate() ?? new Date(0))
        .filter((d) => d.getTime() > 0);
      return { totalNotes: notesSnap.size, totalJournals: journalsSnap.size, recordDates };
    },
  });
}

// ─── メインページ ──────────────────────────────────────────
export function SettingsPage() {
  const { t } = useTranslation();
  const { userProfile } = useAuthStore();
  const { data: stats } = useProfileStats(userProfile?.uid);
  const { data: streakData } = useStreak(userProfile?.uid);

  const totalNotes    = stats?.totalNotes ?? 0;
  const totalJournals = stats?.totalJournals ?? 0;
  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = stats?.recordDates ? calculateStreak(stats.recordDates) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* ── プロフィールヘッダー ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <div className="flex items-center gap-4">
          <Avatar size="lg" name={userProfile?.displayName ?? ''} src={userProfile?.avatarUrl ?? undefined} />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-zinc-50 truncate">{userProfile?.displayName}</h1>
            <p className="text-zinc-500 text-sm truncate">{userProfile?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* ── 統計 ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <h2 className="text-base font-semibold text-zinc-50 mb-3">{t('profile.stats')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { labelKey: 'profile.totalNotes',   value: totalNotes,    emoji: '📝' },
            { labelKey: 'profile.totalMatches',  value: totalJournals, emoji: '⚽' },
            { labelKey: 'profile.currentStreak', value: `${currentStreak}${t('profile.streakDayUnit')}`, emoji: '🔥' },
            { labelKey: 'profile.longestStreak', value: `${longestStreak}${t('profile.streakDayUnit')}`, emoji: '🏆' },
          ].map(({ labelKey, value, emoji }) => (
            <motion.div key={labelKey} whileHover={{ scale: 1.02 }} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-2xl mb-1">{emoji}</p>
              <p className="text-2xl font-bold text-zinc-50">{value}</p>
              <p className="text-zinc-500 text-xs">{t(labelKey)}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── プロフィール・メンバー管理 ── */}
      <ProfileManagementSection />
    </div>
  );
}
