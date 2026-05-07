import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

// noteCountService のモック
vi.mock('@/lib/firebase/noteCountService', () => ({
  fetchNoteCountInfo: vi.fn(),
}));

// ストアのモック（セレクター関数を通じて値を返す）
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/store/groupStore', () => ({
  useGroupStore: vi.fn(),
}));

import { useNoteCount } from './useNoteCount';
import { fetchNoteCountInfo } from '@/lib/firebase/noteCountService';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import type { User } from '@/types/user';
import type { Group } from '@/types/group';

/** テスト用 QueryClientProvider ラッパー */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

/** useAuthStore のセレクターモックヘルパー */
function mockAuthStore(userProfile: Partial<User> | null) {
  vi.mocked(useAuthStore).mockImplementation(
    (selector) => selector({ userProfile } as Parameters<typeof selector>[0])
  );
}

/** useGroupStore のセレクターモックヘルパー */
function mockGroupStore(group: Partial<Group> | null) {
  vi.mocked(useGroupStore).mockImplementation(
    (selector) => selector({ group, members: [], setGroup: vi.fn(), setMembers: vi.fn(), reset: vi.fn() } as Parameters<typeof selector>[0])
  );
}

describe('useNoteCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('グループ未参加の場合は enabled: false となり data が undefined を返す', () => {
    mockAuthStore({ uid: 'user1', groupId: null });
    mockGroupStore(null);

    const { result } = renderHook(() => useNoteCount(), { wrapper: createWrapper() });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(fetchNoteCountInfo).not.toHaveBeenCalled();
  });

  it('グループ参加済みの場合は fetchNoteCountInfo を呼び出し結果を返す', async () => {
    const mockInfo = {
      totalNoteCount: 8,
      limit: 20,
      remaining: 12,
      isLow: false,
      isExceeded: false,
      plan: 'free' as const,
    };

    mockAuthStore({ uid: 'user1', groupId: 'group1' });
    mockGroupStore({ id: 'group1' } as Partial<Group>);
    vi.mocked(fetchNoteCountInfo).mockResolvedValue(mockInfo);

    const { result } = renderHook(() => useNoteCount(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockInfo);
    expect(result.current.isError).toBe(false);
    expect(fetchNoteCountInfo).toHaveBeenCalledWith('group1', 'user1');
  });

  it('Firestore 取得エラー時に isError: true を返す', async () => {
    mockAuthStore({ uid: 'user1', groupId: 'group1' });
    mockGroupStore({ id: 'group1' } as Partial<Group>);
    vi.mocked(fetchNoteCountInfo).mockRejectedValue(new Error('Firestore error'));

    const { result } = renderHook(() => useNoteCount(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
