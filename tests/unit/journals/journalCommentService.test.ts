import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted で変数を定義してホイスティング問題を回避
const {
  mockAddDoc,
  mockDeleteDoc,
  mockUpdateDoc,
  mockGetDoc,
  mockCollection,
  mockDoc,
  mockIncrement,
  mockServerTimestamp,
  mockQuery,
  mockOrderBy,
  mockOnSnapshot,
} = vi.hoisted(() => ({
  mockAddDoc: vi.fn().mockResolvedValue({ id: 'new-comment-id' }),
  mockDeleteDoc: vi.fn().mockResolvedValue(undefined),
  mockUpdateDoc: vi.fn().mockResolvedValue(undefined),
  mockGetDoc: vi.fn(),
  mockCollection: vi.fn((_db: unknown, ...segments: string[]) => ({ segments })),
  mockDoc: vi.fn((_db: unknown, ...segments: string[]) => ({ segments })),
  mockIncrement: vi.fn((n: number) => ({ _increment: n })),
  mockServerTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
  mockQuery: vi.fn(),
  mockOrderBy: vi.fn(),
  mockOnSnapshot: vi.fn(() => vi.fn()),
}));

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  deleteDoc: mockDeleteDoc,
  updateDoc: mockUpdateDoc,
  getDoc: mockGetDoc,
  increment: mockIncrement,
  serverTimestamp: mockServerTimestamp,
  query: mockQuery,
  orderBy: mockOrderBy,
  onSnapshot: mockOnSnapshot,
}));

vi.mock('@/lib/firebase/config', () => ({
  db: {},
}));

import { addJournalComment, deleteJournalComment, markCommentsAsRead } from '@/lib/firebase/journalCommentService';

const JOURNAL_ID = 'journal-123';
const COMMENT_ID = 'comment-456';
const USER_ID = 'user-uid-789';

const baseComment = {
  userId: USER_ID,
  displayName: 'テスト管理者',
  avatarUrl: null,
  role: 'parent' as const,
  text: 'よくがんばったね！',
};

describe('addJournalComment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddDoc.mockResolvedValue({ id: 'new-comment-id' });
    mockUpdateDoc.mockResolvedValue(undefined);
    mockIncrement.mockImplementation((n: number) => ({ _increment: n }));
  });

  it('正常系: サブコレクションに正しいフィールドでコメントを追加し、カウントをインクリメントする', async () => {
    await addJournalComment(JOURNAL_ID, baseComment);

    // addDoc が呼ばれたか
    expect(mockAddDoc).toHaveBeenCalledOnce();
    const addDocArgs = mockAddDoc.mock.calls[0];
    expect(addDocArgs[1]).toMatchObject({
      journalId: JOURNAL_ID,
      userId: USER_ID,
      displayName: 'テスト管理者',
      avatarUrl: null,
      role: 'parent',
      text: 'よくがんばったね！',
      parentCommentId: null,
      replyCount: 0,
    });

    // updateDoc でカウントインクリメントが呼ばれたか
    expect(mockUpdateDoc).toHaveBeenCalledOnce();
    const updateArgs = mockUpdateDoc.mock.calls[0];
    expect(updateArgs[1].commentCount).toMatchObject({ _increment: 1 });
    expect(updateArgs[1].unreadCommentCount).toMatchObject({ _increment: 1 });
  });

  it('異常系: text が空文字列の場合は EMPTY_COMMENT エラーをスロー', async () => {
    await expect(
      addJournalComment(JOURNAL_ID, { ...baseComment, text: '' })
    ).rejects.toThrow('EMPTY_COMMENT');
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('異常系: text がスペースのみの場合は EMPTY_COMMENT エラーをスロー', async () => {
    await expect(
      addJournalComment(JOURNAL_ID, { ...baseComment, text: '   ' })
    ).rejects.toThrow('EMPTY_COMMENT');
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('異常系: text が201文字の場合は TEXT_TOO_LONG エラーをスロー', async () => {
    const longText = 'a'.repeat(201);
    await expect(
      addJournalComment(JOURNAL_ID, { ...baseComment, text: longText })
    ).rejects.toThrow('TEXT_TOO_LONG');
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('正常系: text が200文字の場合は成功する', async () => {
    const text200 = 'a'.repeat(200);
    await expect(
      addJournalComment(JOURNAL_ID, { ...baseComment, text: text200 })
    ).resolves.not.toThrow();
    expect(mockAddDoc).toHaveBeenCalledOnce();
  });
});

describe('deleteJournalComment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  it('正常系: 投稿者本人の場合は削除成功し commentCount がデクリメントされる', async () => {
    // コメント取得: userId 一致
    mockGetDoc
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ userId: USER_ID }) })
      // ジャーナル取得: commentCount = 3
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ commentCount: 3 }) });

    await deleteJournalComment(JOURNAL_ID, COMMENT_ID, USER_ID);

    expect(mockDeleteDoc).toHaveBeenCalledOnce();
    expect(mockUpdateDoc).toHaveBeenCalledOnce();
    const updateArgs = mockUpdateDoc.mock.calls[0];
    expect(updateArgs[1]).toMatchObject({ commentCount: 2 });
  });

  it('異常系: 別ユーザーの場合は UNAUTHORIZED エラーをスロー', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ userId: 'other-user' }),
    });

    await expect(
      deleteJournalComment(JOURNAL_ID, COMMENT_ID, USER_ID)
    ).rejects.toThrow('UNAUTHORIZED');

    expect(mockDeleteDoc).not.toHaveBeenCalled();
    expect(mockUpdateDoc).not.toHaveBeenCalled();
  });

  it('異常系: コメントが存在しない場合は NOT_FOUND エラーをスロー', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false, data: () => null });

    await expect(
      deleteJournalComment(JOURNAL_ID, COMMENT_ID, USER_ID)
    ).rejects.toThrow('NOT_FOUND');
  });

  it('正常系: commentCount が 0 のときは 0 未満にならない', async () => {
    mockGetDoc
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ userId: USER_ID }) })
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ commentCount: 0 }) });

    await deleteJournalComment(JOURNAL_ID, COMMENT_ID, USER_ID);

    const updateArgs = mockUpdateDoc.mock.calls[0];
    // Math.max(0, 0-1) = 0
    expect(updateArgs[1]).toMatchObject({ commentCount: 0 });
  });
});

describe('markCommentsAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  it('正常系: unreadCommentCount が 0 に更新される', async () => {
    await markCommentsAsRead(JOURNAL_ID);

    expect(mockUpdateDoc).toHaveBeenCalledOnce();
    const updateArgs = mockUpdateDoc.mock.calls[0];
    expect(updateArgs[1]).toMatchObject({ unreadCommentCount: 0 });
  });
});
