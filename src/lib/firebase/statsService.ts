import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Note } from '@/types/note';
import type { MatchJournal } from '@/types/matchJournal';
import type {
  MonthlyPracticeStats,
  MonthlyMatchStats,
  StatsData,
} from '@/types/stats';

/**
 * 直近6ヶ月分の月キー（"YYYY-MM" 形式）を古い順で返す。
 * 現在月を含む6ヶ月分。
 */
function buildLast6MonthKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    keys.push(key);
  }
  return keys;
}

/** "YYYY-MM" から "M月" 表示用ラベルを生成する */
function toMonthLabel(monthKey: string): string {
  const month = parseInt(monthKey.split('-')[1], 10);
  return `${month}月`;
}

/**
 * 6ヶ月前の月初 Timestamp を返す（クライアント側タイムゾーン基準）。
 */
function getSixMonthsAgoTimestamp(): Timestamp {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
  return Timestamp.fromDate(start);
}

/**
 * 指定ユーザーの直近6ヶ月分の練習統計を取得する。
 * - notes コレクションから isDraft=false のドキュメントを date 降順で取得。
 * - クライアント側で月ごとにグループ化して集計する。
 */
export async function fetchPracticeStats(
  userId: string
): Promise<MonthlyPracticeStats[]> {
  const sixMonthsAgo = getSixMonthsAgoTimestamp();

  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    where('isDraft', '==', false),
    where('date', '>=', sixMonthsAgo),
    orderBy('date', 'desc'),
    limit(500)
  );

  const snap = await getDocs(q);
  const notes = snap.docs.map((d) => ({ ...(d.data() as Note), id: d.id }));

  // 月次集計マップを初期化
  const monthKeys = buildLast6MonthKeys();
  const statsMap = new Map<
    string,
    { practiceCount: number; totalMinutes: number; conditionSum: number; conditionCount: number }
  >();
  monthKeys.forEach((key) => {
    statsMap.set(key, {
      practiceCount: 0,
      totalMinutes: 0,
      conditionSum: 0,
      conditionCount: 0,
    });
  });

  // ノートを月別に集計
  for (const note of notes) {
    const noteDate = note.date?.toDate();
    if (!noteDate) continue;
    const key = `${noteDate.getFullYear()}-${String(noteDate.getMonth() + 1).padStart(2, '0')}`;
    const entry = statsMap.get(key);
    if (!entry) continue;

    entry.practiceCount += 1;
    if (note.durationMinutes != null) {
      entry.totalMinutes += note.durationMinutes;
    }
    if (note.condition != null) {
      entry.conditionSum += note.condition;
      entry.conditionCount += 1;
    }
  }

  return monthKeys.map((key) => {
    const entry = statsMap.get(key)!;
    return {
      monthKey: key,
      monthLabel: toMonthLabel(key),
      practiceCount: entry.practiceCount,
      totalMinutes: entry.totalMinutes,
      avgCondition:
        entry.conditionCount > 0
          ? Math.round((entry.conditionSum / entry.conditionCount) * 10) / 10
          : null,
    };
  });
}

/**
 * 指定ユーザーの直近6ヶ月分の試合統計を取得する。
 * - matchJournals コレクションから status='completed' のドキュメントを取得。
 */
export async function fetchMatchStats(
  userId: string
): Promise<MonthlyMatchStats[]> {
  const sixMonthsAgo = getSixMonthsAgoTimestamp();

  const q = query(
    collection(db, 'matchJournals'),
    where('userId', '==', userId),
    where('status', '==', 'completed'),
    where('date', '>=', sixMonthsAgo),
    orderBy('date', 'desc'),
    limit(500)
  );

  const snap = await getDocs(q);
  const journals = snap.docs.map((d) => ({
    ...(d.data() as MatchJournal),
    id: d.id,
  }));

  // 月次集計マップを初期化
  const monthKeys = buildLast6MonthKeys();
  const statsMap = new Map<
    string,
    { matchCount: number; winCount: number; drawCount: number; lossCount: number }
  >();
  monthKeys.forEach((key) => {
    statsMap.set(key, {
      matchCount: 0,
      winCount: 0,
      drawCount: 0,
      lossCount: 0,
    });
  });

  // ジャーナルを月別に集計
  for (const journal of journals) {
    const journalDate = journal.date?.toDate();
    if (!journalDate) continue;
    const key = `${journalDate.getFullYear()}-${String(journalDate.getMonth() + 1).padStart(2, '0')}`;
    const entry = statsMap.get(key);
    if (!entry) continue;

    entry.matchCount += 1;
    const result = journal.postNote?.result;
    if (result === 'win') entry.winCount += 1;
    else if (result === 'draw') entry.drawCount += 1;
    else if (result === 'loss') entry.lossCount += 1;
  }

  return monthKeys.map((key) => {
    const entry = statsMap.get(key)!;
    return {
      monthKey: key,
      monthLabel: toMonthLabel(key),
      matchCount: entry.matchCount,
      winCount: entry.winCount,
      drawCount: entry.drawCount,
      lossCount: entry.lossCount,
      winRate:
        entry.matchCount > 0
          ? Math.round((entry.winCount / entry.matchCount) * 1000) / 10
          : null,
    };
  });
}

/**
 * 練習・試合統計を並列取得して StatsData を返す。
 */
export async function fetchAllStats(userId: string): Promise<StatsData> {
  const [practiceStats, matchStats] = await Promise.all([
    fetchPracticeStats(userId),
    fetchMatchStats(userId),
  ]);

  const totalPracticeCount = practiceStats.reduce(
    (sum, s) => sum + s.practiceCount,
    0
  );
  const totalMinutes = practiceStats.reduce(
    (sum, s) => sum + s.totalMinutes,
    0
  );
  const totalMatchCount = matchStats.reduce(
    (sum, s) => sum + s.matchCount,
    0
  );
  const totalWins = matchStats.reduce((sum, s) => sum + s.winCount, 0);

  return {
    practiceStats,
    matchStats,
    totals: {
      practiceCount: totalPracticeCount,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      matchCount: totalMatchCount,
      winRate:
        totalMatchCount > 0
          ? Math.round((totalWins / totalMatchCount) * 1000) / 10
          : null,
    },
  };
}
