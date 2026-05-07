import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as firestoreModule from 'firebase/firestore';

// firebase/firestore をモック
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof firestoreModule>();
  return {
    ...actual,
    doc: vi.fn(),
    getDoc: vi.fn(),
    runTransaction: vi.fn(),
    increment: vi.fn((n: number) => ({ _increment: n })),
  };
});

// Firebase config モック
vi.mock('./config', () => ({
  db: {},
}));

import {
  getNoteLimit,
  getRemainingCount,
  fetchNoteCountInfo,
  incrementNoteCount,
  decrementNoteCount,
} from './noteCountService';
import { NoteCountExceededError, FREE_NOTE_LIMIT, PACK_NOTE_COUNT } from '@/types/noteCount';

const { runTransaction, getDoc, doc } = firestoreModule;

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

describe('fetchNoteCountInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(doc).mockReturnValue({} as ReturnType<typeof firestoreModule.doc>);
  });

  it('正常系: 残数情報を返す', async () => {
    vi.mocked(getDoc)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ totalNoteCount: 8 }),
      } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ plan: 'free', purchasedCount: 0 }),
      } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>);

    const result = await fetchNoteCountInfo('group1', 'user1');

    expect(result.totalNoteCount).toBe(8);
    expect(result.limit).toBe(20);
    expect(result.remaining).toBe(12);
    expect(result.isLow).toBe(false);
    expect(result.isExceeded).toBe(false);
    expect(result.plan).toBe('free');
  });

  it('残数が5件以下のとき isLow が true になる', async () => {
    vi.mocked(getDoc)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ totalNoteCount: 17 }),
      } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ plan: 'free', purchasedCount: 0 }),
      } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>);

    const result = await fetchNoteCountInfo('group1', 'user1');

    expect(result.remaining).toBe(3);
    expect(result.isLow).toBe(true);
    expect(result.isExceeded).toBe(false);
  });

  it('残数が0件のとき isExceeded が true になる', async () => {
    vi.mocked(getDoc)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ totalNoteCount: 20 }),
      } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ plan: 'free', purchasedCount: 0 }),
      } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>);

    const result = await fetchNoteCountInfo('group1', 'user1');

    expect(result.remaining).toBe(0);
    expect(result.isExceeded).toBe(true);
  });

  it('有料プランでは上限が増加する（purchasedCount: 1 → 上限120）', async () => {
    vi.mocked(getDoc)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ totalNoteCount: 50 }),
      } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ plan: 'paid', purchasedCount: 1 }),
      } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>);

    const result = await fetchNoteCountInfo('group1', 'user1');

    expect(result.limit).toBe(FREE_NOTE_LIMIT + PACK_NOTE_COUNT);
    expect(result.remaining).toBe(FREE_NOTE_LIMIT + PACK_NOTE_COUNT - 50);
    expect(result.isExceeded).toBe(false);
  });

  it('totalNoteCount フィールドが存在しない場合は 0 として扱う', async () => {
    vi.mocked(getDoc)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({}), // totalNoteCount なし
      } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ plan: 'free', purchasedCount: 0 }),
      } as unknown as Awaited<ReturnType<typeof firestoreModule.getDoc>>);

    const result = await fetchNoteCountInfo('group1', 'user1');

    expect(result.totalNoteCount).toBe(0);
    expect(result.remaining).toBe(20);
  });
});

describe('incrementNoteCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(doc).mockReturnValue({} as ReturnType<typeof firestoreModule.doc>);
  });

  it('上限未満のとき正常にカウントアップできる（無料プラン）', async () => {
    vi.mocked(runTransaction).mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ totalNoteCount: 15 }),
          })
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ noteCount: 3 }),
          })
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ plan: 'free', purchasedCount: 0 }),
          }),
        update: vi.fn(),
      };
      await fn(mockTx as unknown as firestoreModule.Transaction);
    });

    await expect(incrementNoteCount('group1', 'member1', 'owner1')).resolves.toBeUndefined();
  });

  it('上限到達時（無料プラン）に NoteCountExceededError をスローする', async () => {
    vi.mocked(runTransaction).mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ totalNoteCount: 20 }), // 無料プラン上限到達
          })
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ noteCount: 3 }),
          })
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ plan: 'free', purchasedCount: 0 }),
          }),
        update: vi.fn(),
      };
      await fn(mockTx as unknown as firestoreModule.Transaction);
    });

    await expect(incrementNoteCount('group1', 'member1', 'owner1')).rejects.toThrow(NoteCountExceededError);
  });

  it('有料プランでは上限超過せずカウントアップできる（totalNoteCount: 50, purchasedCount: 1 → 上限120）', async () => {
    vi.mocked(runTransaction).mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ totalNoteCount: 50 }), // 有料プラン上限120以内
          })
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ noteCount: 10 }),
          })
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ plan: 'paid', purchasedCount: 1 }),
          }),
        update: vi.fn(),
      };
      await fn(mockTx as unknown as firestoreModule.Transaction);
    });

    await expect(incrementNoteCount('group1', 'member1', 'owner1')).resolves.toBeUndefined();
  });

  it('有料プランでも上限に達した場合は NoteCountExceededError をスローする', async () => {
    vi.mocked(runTransaction).mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ totalNoteCount: 120 }), // 有料プラン purchasedCount:1 の上限に到達
          })
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ noteCount: 50 }),
          })
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ plan: 'paid', purchasedCount: 1 }),
          }),
        update: vi.fn(),
      };
      await fn(mockTx as unknown as firestoreModule.Transaction);
    });

    await expect(incrementNoteCount('group1', 'member1', 'owner1')).rejects.toThrow(NoteCountExceededError);
  });
});

describe('decrementNoteCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(doc).mockReturnValue({} as ReturnType<typeof firestoreModule.doc>);
  });

  it('正常にカウントダウンできる', async () => {
    vi.mocked(runTransaction).mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ totalNoteCount: 10 }),
          })
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ noteCount: 3 }),
          }),
        update: vi.fn(),
      };
      await fn(mockTx as unknown as firestoreModule.Transaction);
    });

    await expect(decrementNoteCount('group1', 'member1')).resolves.toBeUndefined();
  });

  it('totalNoteCount が 0 のとき 0 未満にならない', async () => {
    const updateMock = vi.fn();

    vi.mocked(runTransaction).mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ totalNoteCount: 0 }), // 既に0
          })
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ noteCount: 0 }),
          }),
        update: updateMock,
      };
      await fn(mockTx as unknown as firestoreModule.Transaction);
    });

    await decrementNoteCount('group1', 'member1');
    // update が呼ばれていないことを確認（0以下にはデクリメントしない）
    expect(updateMock).not.toHaveBeenCalled();
  });
});
