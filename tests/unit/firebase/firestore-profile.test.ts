import { describe, it, expect, vi, beforeEach } from 'vitest';

// Firestore Timestamp のモック
vi.mock('firebase/firestore', () => {
  const mockBatch = {
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  };
  return {
    collection: vi.fn(),
    doc: vi.fn((_db: unknown, ...segments: string[]) => ({ path: segments.join('/') })),
    updateDoc: vi.fn().mockResolvedValue(undefined),
    deleteDoc: vi.fn().mockResolvedValue(undefined),
    getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
    getDocs: vi.fn().mockResolvedValue({ docs: [] }),
    addDoc: vi.fn().mockResolvedValue({ id: 'new-doc-id' }),
    setDoc: vi.fn().mockResolvedValue(undefined),
    writeBatch: vi.fn(() => mockBatch),
    runTransaction: vi.fn(),
    serverTimestamp: vi.fn(() => ({ __type: 'serverTimestamp' })),
    increment: vi.fn((n: number) => ({ __type: 'increment', value: n })),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
    onSnapshot: vi.fn(),
  };
});

vi.mock('@/lib/firebase/config', () => ({
  db: {},
}));

vi.mock('@/lib/firebase/highlightService', () => ({
  replaceInsightHighlights: vi.fn(),
}));

vi.mock('@/lib/utils/inviteCode', () => ({
  generateInviteCode: vi.fn(() => 'ABC123'),
}));

describe('updateMemberDisplayName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系（非子プロフィール）: members と users の両方が更新される', async () => {
    const { updateMemberDisplayName } = await import('@/lib/firebase/firestore');
    const { updateDoc } = await import('firebase/firestore');

    await updateMemberDisplayName('group-1', 'user-1', '山田太郎', false);

    expect(updateDoc).toHaveBeenCalledTimes(2);
  });

  it('正常系（子プロフィール）: members のみ更新され users は更新されない', async () => {
    const { updateMemberDisplayName } = await import('@/lib/firebase/firestore');
    const { updateDoc } = await import('firebase/firestore');

    vi.mocked(updateDoc).mockClear();
    await updateMemberDisplayName('group-1', 'child_abc123', '花子', true);

    expect(updateDoc).toHaveBeenCalledTimes(1);
  });
});

describe('addChildProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: 作成された uid が child_ プレフィックスで始まる', async () => {
    const { addChildProfile } = await import('@/lib/firebase/firestore');
    const uid = await addChildProfile('group-1', '太郎');
    expect(uid).toMatch(/^child_/);
  });

  it('正常系: writeBatch の set が 1 回呼ばれる', async () => {
    const { addChildProfile } = await import('@/lib/firebase/firestore');
    const { writeBatch } = await import('firebase/firestore');
    vi.mocked(writeBatch).mockClear();

    await addChildProfile('group-1', '太郎');

    const batch = vi.mocked(writeBatch).mock.results[0]?.value;
    expect(batch?.set).toHaveBeenCalledTimes(1);
  });

  it('正常系: memberCount のインクリメントが batch.update で呼ばれる', async () => {
    const { addChildProfile } = await import('@/lib/firebase/firestore');
    const { writeBatch, increment } = await import('firebase/firestore');
    vi.mocked(writeBatch).mockClear();

    await addChildProfile('group-1', '太郎');

    const batch = vi.mocked(writeBatch).mock.results[0]?.value;
    expect(batch?.update).toHaveBeenCalledTimes(1);
    expect(increment).toHaveBeenCalledWith(1);
  });

  it('正常系: batch.set に isChildProfile: true が含まれる', async () => {
    const { addChildProfile } = await import('@/lib/firebase/firestore');
    const { writeBatch } = await import('firebase/firestore');
    vi.mocked(writeBatch).mockClear();

    await addChildProfile('group-1', '太郎');

    const batch = vi.mocked(writeBatch).mock.results[0]?.value;
    const setCall = vi.mocked(batch?.set).mock.calls[0];
    expect(setCall?.[1]).toMatchObject({ isChildProfile: true });
  });
});

describe('deleteChildProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: batch.delete が 1 回呼ばれる', async () => {
    const { deleteChildProfile } = await import('@/lib/firebase/firestore');
    const { writeBatch } = await import('firebase/firestore');
    vi.mocked(writeBatch).mockClear();

    await deleteChildProfile('group-1', 'child_abc123');

    const batch = vi.mocked(writeBatch).mock.results[0]?.value;
    expect(batch?.delete).toHaveBeenCalledTimes(1);
  });

  it('正常系: memberCount のデクリメントが batch.update で呼ばれる', async () => {
    const { deleteChildProfile } = await import('@/lib/firebase/firestore');
    const { writeBatch, increment } = await import('firebase/firestore');
    vi.mocked(writeBatch).mockClear();

    await deleteChildProfile('group-1', 'child_abc123');

    const batch = vi.mocked(writeBatch).mock.results[0]?.value;
    expect(batch?.update).toHaveBeenCalledTimes(1);
    expect(increment).toHaveBeenCalledWith(-1);
  });
});
