import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { calculateStreak, getWeeklyStreakStatus } from '@/lib/utils/streak';
import type { Note } from '@/types/note';
import type { Match } from '@/types/match';

// ストリーク計算のカスタムフック
export function useStreak(userId: string | undefined) {
  return useQuery({
    queryKey: ['streak', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return { currentStreak: 0, weeklyStatus: Array(7).fill(false) };

      // 過去100日分の記録日付を取得（ストリーク計算に十分な数）
      const [notesSnap, matchesSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, 'notes'),
            where('userId', '==', userId),
            where('isDraft', '==', false),
            orderBy('createdAt', 'desc'),
            limit(100)
          )
        ),
        getDocs(
          query(
            collection(db, 'matches'),
            where('userId', '==', userId),
            where('isDraft', '==', false),
            orderBy('createdAt', 'desc'),
            limit(100)
          )
        ),
      ]);

      // 記録日付を収集
      const recordDates: Date[] = [
        ...notesSnap.docs.map((d) => {
          const note = d.data() as Note;
          return note.createdAt?.toDate() ?? new Date(0);
        }),
        ...matchesSnap.docs.map((d) => {
          const match = d.data() as Match;
          return match.createdAt?.toDate() ?? new Date(0);
        }),
      ].filter((d) => d.getTime() > 0);

      const currentStreak = calculateStreak(recordDates);
      const weeklyStatus = getWeeklyStreakStatus(recordDates);

      return { currentStreak, weeklyStatus, recordDates };
    },
    // ストリークは5分キャッシュ
    staleTime: 5 * 60 * 1000,
  });
}
