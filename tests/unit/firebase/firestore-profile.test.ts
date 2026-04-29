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

  it('正常系: setDoc が 1 回呼ばれる', async () => {
    const { addChildProfile } = await import('@/lib/firebase/firestore');
    const { setDoc } = await import('firebase/firestore');

    await addChildProfile('group-1', '太郎');

    expect(setDoc).toHaveBeenCalledTimes(1);
  });

  it('正常系: setDoc に isChildProfile: true が含まれる', async () => {
    const { addChildProfile } = await import('@/lib/firebase/firestore');
    const { setDoc } = await import('firebase/firestore');

    await addChildProfile('group-1', '太郎');

    const setDocCall = vi.mocked(setDoc).mock.calls[0];
    expect(setDocCall?.[1]).toMatchObject({ isChildProfile: true });
  });

  it('正常系: parentRole が null の場合は null で保存される', async () => {
    const { addChildProfile } = await import('@/lib/firebase/firestore');
    const { setDoc } = await import('firebase/firestore');

    await addChildProfile('group-1', '太郎', null);

    const setDocCall = vi.mocked(setDoc).mock.calls[0];
    expect(setDocCall?.[1]).toMatchObject({ parentRole: null });
  });
});

describe('deleteChildProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: deleteDoc が 1 回呼ばれる', async () => {
    const { deleteChildProfile } = await import('@/lib/firebase/firestore');
    const { deleteDoc } = await import('firebase/firestore');

    await deleteChildProfile('group-1', 'child_abc123');

    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });

  it('正常系: 正しいパスの doc が削除される', async () => {
    const { deleteChildProfile } = await import('@/lib/firebase/firestore');
    const { deleteDoc, doc } = await import('firebase/firestore');

    await deleteChildProfile('group-1', 'child_abc123');

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'groups', 'group-1', 'members', 'child_abc123');
    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });
});
