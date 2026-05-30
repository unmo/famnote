import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Timestamp } from 'firebase/firestore';

// firebase/firestore をモック
vi.mock('firebase/firestore', async () => {
  return {
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(),
    Timestamp: {
      fromDate: (d: Date) => ({
        toDate: () => d,
        toMillis: () => d.getTime(),
        seconds: Math.floor(d.getTime() / 1000),
        nanoseconds: 0,
      }),
    },
  };
});

// Firebase config モック
vi.mock('./config', () => ({
  db: {},
}));

import { fetchPracticeStats, fetchMatchStats } from './statsService';
import * as firestoreModule from 'firebase/firestore';

/** Timestamp モックヘルパー */
function makeTimestamp(dateStr: string) {
  const d = new Date(dateStr);
  return {
    toDate: () => d,
    toMillis: () => d.getTime(),
    seconds: Math.floor(d.getTime() / 1000),
    nanoseconds: 0,
  };
}

function makeNoteDocs(notes: Array<{
  date: string;
  durationMinutes?: number | null;
  condition?: 1 | 2 | 3 | 4 | 5 | null;
  isDraft?: boolean;
}>) {
  return {
    docs: notes.map((n) => ({
      id: Math.random().toString(),
      data: () => ({
        userId: 'user1',
        date: makeTimestamp(n.date),
        durationMinutes: n.durationMinutes ?? null,
        condition: n.condition ?? null,
        isDraft: n.isDraft ?? false,
      }),
    })),
  };
}

function makeJournalDocs(journals: Array<{
  date: string;
  status?: string;
  result?: 'win' | 'draw' | 'loss' | null;
}>) {
  return {
    docs: journals.map((j) => ({
      id: Math.random().toString(),
      data: () => ({
        userId: 'user1',
        date: makeTimestamp(j.date),
        status: j.status ?? 'completed',
        postNote: j.result !== undefined ? { result: j.result } : null,
      }),
    })),
  };
}

describe('fetchPracticeStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('直近6ヶ月のデータが正しく月次集計される', async () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dateStr = `${currentMonth}-10`;

    vi.mocked(firestoreModule.getDocs).mockResolvedValueOnce(
      makeNoteDocs([
        { date: dateStr, durationMinutes: 60, condition: 4 },
        { date: dateStr, durationMinutes: 30, condition: 3 },
      ]) as never
    );

    const result = await fetchPracticeStats('user1');

    expect(result).toHaveLength(6);
    const currentStat = result.find((s) => s.monthKey === currentMonth);
    expect(currentStat).toBeDefined();
    expect(currentStat!.practiceCount).toBe(2);
    expect(currentStat!.totalMinutes).toBe(90);
    expect(currentStat!.avgCondition).toBe(3.5);
  });

  it('durationMinutes が null のノートは時間集計に含まれない', async () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dateStr = `${currentMonth}-10`;

    vi.mocked(firestoreModule.getDocs).mockResolvedValueOnce(
      makeNoteDocs([
        { date: dateStr, durationMinutes: null, condition: 3 },
        { date: dateStr, durationMinutes: 45, condition: null },
      ]) as never
    );

    const result = await fetchPracticeStats('user1');
    const currentStat = result.find((s) => s.monthKey === currentMonth);
    expect(currentStat!.totalMinutes).toBe(45);
    expect(currentStat!.practiceCount).toBe(2);
  });

  it('condition が null のノートは avgCondition 計算から除外される', async () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dateStr = `${currentMonth}-10`;

    vi.mocked(firestoreModule.getDocs).mockResolvedValueOnce(
      makeNoteDocs([
        { date: dateStr, condition: null },
        { date: dateStr, condition: null },
      ]) as never
    );

    const result = await fetchPracticeStats('user1');
    const currentStat = result.find((s) => s.monthKey === currentMonth);
    expect(currentStat!.avgCondition).toBeNull();
  });

  it('ノートが0件の月は practiceCount=0 の MonthlyPracticeStats が生成される', async () => {
    vi.mocked(firestoreModule.getDocs).mockResolvedValueOnce(
      makeNoteDocs([]) as never
    );

    const result = await fetchPracticeStats('user1');

    expect(result).toHaveLength(6);
    result.forEach((s) => {
      expect(s.practiceCount).toBe(0);
      expect(s.totalMinutes).toBe(0);
      expect(s.avgCondition).toBeNull();
    });
  });

  it('Firestore エラー発生時は例外をスロー', async () => {
    vi.mocked(firestoreModule.getDocs).mockRejectedValueOnce(
      new Error('Firestore error') as never
    );

    await expect(fetchPracticeStats('user1')).rejects.toThrow('Firestore error');
  });
});

describe('fetchMatchStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('win/draw/loss が正しくカウントされる', async () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dateStr = `${currentMonth}-15`;

    vi.mocked(firestoreModule.getDocs).mockResolvedValueOnce(
      makeJournalDocs([
        { date: dateStr, result: 'win' },
        { date: dateStr, result: 'win' },
        { date: dateStr, result: 'draw' },
        { date: dateStr, result: 'loss' },
      ]) as never
    );

    const result = await fetchMatchStats('user1');
    const currentStat = result.find((s) => s.monthKey === currentMonth);

    expect(currentStat!.matchCount).toBe(4);
    expect(currentStat!.winCount).toBe(2);
    expect(currentStat!.drawCount).toBe(1);
    expect(currentStat!.lossCount).toBe(1);
    expect(currentStat!.winRate).toBe(50);
  });

  it('matchCount=0 の月は winRate=null になる', async () => {
    vi.mocked(firestoreModule.getDocs).mockResolvedValueOnce(
      makeJournalDocs([]) as never
    );

    const result = await fetchMatchStats('user1');

    result.forEach((s) => {
      expect(s.matchCount).toBe(0);
      expect(s.winRate).toBeNull();
    });
  });

  it('Firestore エラー発生時は例外をスロー', async () => {
    vi.mocked(firestoreModule.getDocs).mockRejectedValueOnce(
      new Error('Firestore error') as never
    );

    await expect(fetchMatchStats('user1')).rejects.toThrow('Firestore error');
  });
});

// Timestamp は実際の型に依存しないためここではモックで対応済み
export { Timestamp };
