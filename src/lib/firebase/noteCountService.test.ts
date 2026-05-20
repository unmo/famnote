import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as firestoreModule from 'firebase/firestore';

// firebase/firestore をモック
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof firestoreModule>();
  return {
    ...actual,
    doc: vi.fn(),
    getDoc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getCountFromServer: vi.fn(),
  };
});

// Firebase config モック
vi.mock('./config', () => ({
  db: {},
}));

import {
  getNoteLimit,
  getRemainingCount,
  fetchTotalNoteCount,
  fetchNoteCountInfo,
} from './noteCountService';
import { FREE_NOTE_LIMIT, PACK_NOTE_COUNT } from '@/types/noteCount';

const { getDoc, doc, collection, query, where, getCountFromServer } = firestoreModule;

describe('getNoteLimit', () => {
  it('無料プランは FREE_NOTE_LIMIT を返す', () => {
    expect(getNoteLimit('free', 0)).toBe(FREE_NOTE_LIMIT);
  });

  it('有料プランは FREE_NOTE_LIMIT + purchasedCount * PACK_NOTE_COUNT を返す', () => {
    expect(getNoteLimit('paid', 1)).toBe(FREE_NOTE_LIMIT + 1 * PACK_NOTE_COUNT);
    expect(getNoteLimit('paid', 3)).toBe(FREE_NOTE_LIMIT + 3 * PACK_NOTE_COUNT);
  });
});

describe('getRemainingCount', () => {
  it('残数を正しく計算する', () => {
    expect(getRemainingCount(8, 20)).toBe(12);
    expect(getRemainingCount(19, 20)).toBe(1);
  });

  it('残数は0未満にならない', () => {
    expect(getRemainingCount(25, 20)).toBe(0);
    expect(getRemainingCount(20, 20)).toBe(0);
  });
});

/**
 * getCountFromServer の戻り値モックを生成するヘルパー。
 * 集計クエリのスナップショットを擬似的に返す。
 */
function mockCountSnap(count: number) {
  return { data: () => ({ count }) } as unknown as Awaited<
    ReturnType<typeof firestoreModule.getCountFromServer>
  >;
}

describe('fetchTotalNoteCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(collection).mockReturnValue({} as ReturnType<typeof firestoreModule.collection>);
    vi.mocked(query).mockReturnValue({} as ReturnType<typeof firestoreModule.query>);
    vi.mocked(where).mockReturnValue({} as ReturnType<typeof firestoreModule.where>);
  });

  it('notes / matchJournals / matches の集計結果を合算する', async () => {
    vi.mocked(getCountFromServer)
      .mockResolvedValueOnce(mockCountSnap(5))
      .mockResolvedValueOnce(mockCountSnap(2))
      .mockResolvedValueOnce(mockCountSnap(1));

    const total = await fetchTotalNoteCount('group1');
    expect(total).toBe(8);
    expect(getCountFromServer).toHaveBeenCalledTimes(3);
  });

  it('全コレクションが0件のとき0を返す', async () => {
    vi.mocked(getCountFromServer)
      .mockResolvedValueOnce(mockCountSnap(0))
      .mockResolvedValueOnce(mockCountSnap(0))
      .mockResolvedValueOnce(mockCountSnap(0));

    const total = await fetchTotalNoteCount('group1');
    expect(total).toBe(0);
  });
});

describe('fetchNoteCountInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(doc).mockReturnValue({} as ReturnType<typeof firestoreModule.doc>);
    vi.mocked(collection).mockReturnValue({} as ReturnType<typeof firestoreModule.collection>);
    vi.mocked(query).mockReturnValue({} as ReturnType<typeof firestoreModule.query>);
    vi.mocked(where).mockReturnValue({} as ReturnType<typeof firestoreModule.where>);
  });

  it('正常系: 残数情報を返す（無料プラン・totalCount=8）', async () => {
    // notes:5, matchJournals:2, matches:1 → 8
    vi.mocked(getCountFromServer)
      .mockResolvedValueOnce(mockCountSnap(5))
      .mockResolvedValueOnce(mockCountSnap(2))
      .mockResolvedValueOnce(mockCountSnap(1));
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ plan: 'free', purchasedCount: 0 }),
    } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>);

    const result = await fetchNoteCountInfo('group1', 'user1');

    expect(result.totalCount).toBe(8);
    expect(result.limit).toBe(20);
    expect(result.remaining).toBe(12);
    expect(result.isOverLimit).toBe(false);
    expect(result.isLow).toBe(false);
    expect(result.plan).toBe('free');
  });

  it('残数が5件以下のとき isLow が true になる', async () => {
    // 合計17
    vi.mocked(getCountFromServer)
      .mockResolvedValueOnce(mockCountSnap(10))
      .mockResolvedValueOnce(mockCountSnap(5))
      .mockResolvedValueOnce(mockCountSnap(2));
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ plan: 'free', purchasedCount: 0 }),
    } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>);

    const result = await fetchNoteCountInfo('group1', 'user1');

    expect(result.totalCount).toBe(17);
    expect(result.remaining).toBe(3);
    expect(result.isLow).toBe(true);
    expect(result.isOverLimit).toBe(false);
  });

  it('totalCount が limit 以上のとき isOverLimit が true になる', async () => {
    // 合計20
    vi.mocked(getCountFromServer)
      .mockResolvedValueOnce(mockCountSnap(10))
      .mockResolvedValueOnce(mockCountSnap(7))
      .mockResolvedValueOnce(mockCountSnap(3));
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ plan: 'free', purchasedCount: 0 }),
    } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>);

    const result = await fetchNoteCountInfo('group1', 'user1');

    expect(result.totalCount).toBe(20);
    expect(result.remaining).toBe(0);
    expect(result.isOverLimit).toBe(true);
  });

  it('有料プランでは上限が増加する（purchasedCount: 1 → 上限120）', async () => {
    // 合計50
    vi.mocked(getCountFromServer)
      .mockResolvedValueOnce(mockCountSnap(30))
      .mockResolvedValueOnce(mockCountSnap(15))
      .mockResolvedValueOnce(mockCountSnap(5));
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ plan: 'paid', purchasedCount: 1 }),
    } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>);

    const result = await fetchNoteCountInfo('group1', 'user1');

    expect(result.limit).toBe(FREE_NOTE_LIMIT + PACK_NOTE_COUNT);
    expect(result.remaining).toBe(FREE_NOTE_LIMIT + PACK_NOTE_COUNT - 50);
    expect(result.isOverLimit).toBe(false);
    expect(result.plan).toBe('paid');
  });

  it('users ドキュメントが存在しない場合は free / 0 として扱う', async () => {
    vi.mocked(getCountFromServer)
      .mockResolvedValueOnce(mockCountSnap(0))
      .mockResolvedValueOnce(mockCountSnap(0))
      .mockResolvedValueOnce(mockCountSnap(0));
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
    } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>);

    const result = await fetchNoteCountInfo('group1', 'user1');

    expect(result.totalCount).toBe(0);
    expect(result.limit).toBe(FREE_NOTE_LIMIT);
    expect(result.remaining).toBe(FREE_NOTE_LIMIT);
    expect(result.plan).toBe('free');
  });
});
