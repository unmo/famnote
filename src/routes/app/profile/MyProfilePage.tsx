import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/shared/Avatar';
import { LogOut, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useStreak } from '@/hooks/useStreak';
import { calculateStreak } from '@/lib/utils/streak';
import type { Note } from '@/types/note';

// バッジ定義（条件を明示）
const BADGES = [
  { id: 'first_record',  emoji: '👟', label: '初記録',     condition: '最初の記録をする' },
  { id: 'streak_3',      emoji: '🔥', label: '3日連続',    condition: '3日連続で記録する' },
  { id: 'streak_7',      emoji: '⚔️', label: '1週間連続',  condition: '7日連続で記録する' },
  { id: 'streak_30',     emoji: '🏆', label: '1ヶ月連続',  condition: '30日連続で記録する' },
  { id: 'streak_100',    emoji: '💎', label: '100日連続',  condition: '100日連続で記録する' },
  { id: 'notes_10',      emoji: '📝', label: '10件達成',   condition: '10件以上記録する' },
  { id: 'notes_50',      emoji: '🗒️', label: '50件達成',   condition: '50件以上記録する' },
  { id: 'journals_5',    emoji: '⚽', label: '試合5試合',  condition: '試合ノートを5件記録する' },
];

// プロフィール統計を実際のFirestoreから取得するフック
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

      const recordDates = notesSnap.docs.map((d) => {
        const note = d.data() as Note;
        return note.createdAt?.toDate() ?? new Date(0);
      }).filter((d) => d.getTime() > 0);

      return {
        totalNotes: notesSnap.size,
        totalJournals: journalsSnap.size,
        recordDates,
      };
    },
  });
}

export function MyProfilePage() {
  const { t } = useTranslation();
  const { userProfile } = useAuthStore();
  const { logOut } = useAuth();
  const { data: stats } = useProfileStats(userProfile?.uid);
  const { data: streakData } = useStreak(userProfile?.uid);

  const totalNotes = stats?.totalNotes ?? 0;
  const totalJournals = stats?.totalJournals ?? 0;
  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = stats?.recordDates
    ? calculateStreak(stats.recordDates)
    : 0;

  // バッジ獲得判定
  const earnedBadgeIds = new Set<string>();
  if (totalNotes > 0 || totalJournals > 0) earnedBadgeIds.add('first_record');
  if (currentStreak >= 3) earnedBadgeIds.add('streak_3');
  if (currentStreak >= 7) earnedBadgeIds.add('streak_7');
  if (longestStreak >= 30) earnedBadgeIds.add('streak_30');
  if (longestStreak >= 100) earnedBadgeIds.add('streak_100');
  if (totalNotes >= 10) earnedBadgeIds.add('notes_10');
  if (totalNotes >= 50) earnedBadgeIds.add('notes_50');
  if (totalJournals >= 5) earnedBadgeIds.add('journals_5');

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
          </div>
        </div>
      </motion.div>

      {/* 統計カード */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-50 mb-3">{t('profile.stats')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '練習ノート', value: totalNotes, emoji: '📝' },
            { label: '試合ノート', value: totalJournals, emoji: '⚽' },
            { label: '現在のストリーク', value: `${currentStreak}日`, emoji: '🔥' },
            { label: '最長ストリーク', value: `${longestStreak}日`, emoji: '🏆' },
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
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  earned
                    ? 'bg-zinc-900 border-zinc-700'
                    : 'bg-zinc-950 border-zinc-800/50'
                }`}
              >
                <span className={`text-2xl flex-shrink-0 ${!earned ? 'grayscale opacity-30' : ''}`}>
                  {badge.emoji}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${earned ? 'text-zinc-100' : 'text-zinc-600'}`}>
                    {badge.label}
                  </p>
                  <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 flex items-center gap-1">
                    {!earned && <Lock size={9} className="flex-shrink-0" />}
                    {badge.condition}
                  </p>
                </div>
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
