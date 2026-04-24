import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import type { GroupMember } from '@/types/group';
import { Timestamp } from 'firebase/firestore';

vi.mock('firebase/firestore', () => ({
  Timestamp: {
    now: () => ({ seconds: 0, nanoseconds: 0 }),
  },
}));

// テスト用のGroupMemberファクトリ
function makeMember(uid: string, role: 'owner' | 'member' = 'member'): GroupMember {
  return {
    uid,
    displayName: `テストユーザー_${uid}`,
    avatarUrl: null,
    sports: [],
    joinedAt: Timestamp.now() as unknown as ReturnType<typeof Timestamp.now>,
    role,
    lastActiveAt: null,
  };
}

// モック変数をvi.hoisted()で定義してモック内から参照できるようにする
const { mockActiveProfile, mockMembers, mockSetActiveProfile, mockClearActiveProfile } = vi.hoisted(() => ({
  mockActiveProfile: { current: null as GroupMember | null },
  mockMembers: { current: [] as GroupMember[] },
  mockSetActiveProfile: vi.fn(),
  mockClearActiveProfile: vi.fn(),
}));

vi.mock('@/store/profileStore', () => ({
  useProfileStore: () => ({
    activeProfile: mockActiveProfile.current,
    setActiveProfile: mockSetActiveProfile,
    clearActiveProfile: mockClearActiveProfile,
  }),
}));

vi.mock('@/store/groupStore', () => ({
  useGroupStore: (selector: (s: { members: GroupMember[] }) => GroupMember[]) =>
    selector({ members: mockMembers.current }),
}));

describe('useActiveProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveProfile.current = null;
    mockMembers.current = [];
  });

  it('activeProfileがprofileStoreから取得される', () => {
    const member = makeMember('user-1');
    mockActiveProfile.current = member;

    const { result } = renderHook(() => useActiveProfile());

    expect(result.current.activeProfile).toEqual(member);
  });

  it('membersがgroupStoreから取得される', () => {
    const members = [makeMember('user-1'), makeMember('user-2')];
    mockMembers.current = members;

    const { result } = renderHook(() => useActiveProfile());

    expect(result.current.members).toEqual(members);
  });

  it('activeProfileがnullのときisManagerはfalse', () => {
    mockActiveProfile.current = null;

    const { result } = renderHook(() => useActiveProfile());

    expect(result.current.isManager).toBe(false);
  });

  it('ownerロールのときisManagerはtrue', () => {
    mockActiveProfile.current = makeMember('user-1', 'owner');

    const { result } = renderHook(() => useActiveProfile());

    expect(result.current.isManager).toBe(true);
  });

  it('memberロールのときisManagerはfalse', () => {
    mockActiveProfile.current = makeMember('user-1', 'member');

    const { result } = renderHook(() => useActiveProfile());

    expect(result.current.isManager).toBe(false);
  });

  it('setActiveProfileがprofileStoreのsetActiveProfileを返す', () => {
    const { result } = renderHook(() => useActiveProfile());

    expect(result.current.setActiveProfile).toBe(mockSetActiveProfile);
  });

  it('clearActiveProfileがprofileStoreのclearActiveProfileを返す', () => {
    const { result } = renderHook(() => useActiveProfile());

    expect(result.current.clearActiveProfile).toBe(mockClearActiveProfile);
  });
});
