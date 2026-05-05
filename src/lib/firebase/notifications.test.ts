import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as firestoreModule from 'firebase/firestore';

// firebase/firestore をモック
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof firestoreModule>();
  return {
    ...actual,
    getFirestore: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    doc: vi.fn(),
    serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
    onSnapshot: vi.fn(),
    writeBatch: vi.fn(),
    getCountFromServer: vi.fn(),
  };
});

// Firebase config モック
vi.mock('./config', () => ({
  db: {},
}));

describe('notifications service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createNotification で groupId が空文字の場合エラーを投げること', async () => {
    const { createNotification } = await import('./notifications');
    await expect(
      createNotification({
        groupId: '',
        senderProfileUid: 'sender-uid',
        senderDisplayName: 'テスト太郎',
        senderAvatarUrl: null,
        recipientProfileUids: ['recipient-uid'],
        contentType: 'note',
        contentId: 'content-id',
        contentTitle: 'テストノート',
        actionType: 'created',
      }),
    ).rejects.toThrow();
  });

  it('createNotification で recipientProfileUids が空配列の場合は何もしないこと', async () => {
    const { createNotification } = await import('./notifications');
    // Zodバリデーションで min(1) に引っかかるため throw される
    await expect(
      createNotification({
        groupId: 'group-id',
        senderProfileUid: 'sender-uid',
        senderDisplayName: 'テスト太郎',
        senderAvatarUrl: null,
        recipientProfileUids: [],
        contentType: 'note',
        contentId: 'content-id',
        contentTitle: 'テストノート',
        actionType: 'created',
      }),
    ).rejects.toThrow();
  });

  it('createNotification で contentTitle が51文字以上の場合エラーを投げること', async () => {
    const { createNotification } = await import('./notifications');
    await expect(
      createNotification({
        groupId: 'group-id',
        senderProfileUid: 'sender-uid',
        senderDisplayName: 'テスト太郎',
        senderAvatarUrl: null,
        recipientProfileUids: ['recipient-uid'],
        contentType: 'note',
        contentId: 'content-id',
        contentTitle: 'a'.repeat(51),
        actionType: 'created',
      }),
    ).rejects.toThrow();
  });

  it('createNotification でバッチ書き込みが呼ばれること', async () => {
    const mockSet = vi.fn();
    const mockCommit = vi.fn().mockResolvedValue(undefined);
    const mockBatch = { set: mockSet, commit: mockCommit };
    vi.mocked(firestoreModule.writeBatch).mockReturnValue(mockBatch as unknown as ReturnType<typeof firestoreModule.writeBatch>);
    vi.mocked(firestoreModule.collection).mockReturnValue({} as ReturnType<typeof firestoreModule.collection>);
    vi.mocked(firestoreModule.doc).mockReturnValue({ id: 'new-id' } as unknown as ReturnType<typeof firestoreModule.doc>);

    const { createNotification } = await import('./notifications');
    await createNotification({
      groupId: 'group-id',
      senderProfileUid: 'sender-uid',
      senderDisplayName: 'テスト太郎',
      senderAvatarUrl: null,
      recipientProfileUids: ['recipient-1', 'recipient-2'],
      contentType: 'note',
      contentId: 'content-id',
      contentTitle: 'テストノート',
      actionType: 'created',
    });

    // 2人の受信者に対してsetが2回呼ばれること
    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockCommit).toHaveBeenCalledOnce();
  });

  it('markAsRead が isRead: true と readAt を設定すること', async () => {
    vi.mocked(firestoreModule.doc).mockReturnValue({} as ReturnType<typeof firestoreModule.doc>);
    vi.mocked(firestoreModule.updateDoc).mockResolvedValue(undefined);

    const { markAsRead } = await import('./notifications');
    await markAsRead('notification-id');

    expect(firestoreModule.updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      { isRead: true, readAt: 'SERVER_TIMESTAMP' },
    );
  });

  it('getUnreadCount が数値を返すこと', async () => {
    vi.mocked(firestoreModule.getCountFromServer).mockResolvedValue({
      data: () => ({ count: 7 }),
    } as unknown as Awaited<ReturnType<typeof firestoreModule.getCountFromServer>>);
    vi.mocked(firestoreModule.query).mockReturnValue({} as ReturnType<typeof firestoreModule.query>);
    vi.mocked(firestoreModule.where).mockReturnValue({} as ReturnType<typeof firestoreModule.where>);
    vi.mocked(firestoreModule.collection).mockReturnValue({} as ReturnType<typeof firestoreModule.collection>);

    const { getUnreadCount } = await import('./notifications');
    const count = await getUnreadCount('recipient-uid');
    expect(count).toBe(7);
  });
});
