import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnreadCount } from './useNotifications';
import * as notificationService from '@/lib/firebase/notifications';

// subscribeUnreadCount のモック
vi.mock('@/lib/firebase/notifications', () => ({
  subscribeUnreadCount: vi.fn(),
  getUnreadNotifications: vi.fn().mockResolvedValue([]),
  fetchNotifications: vi.fn().mockResolvedValue([]),
  getUnreadCount: vi.fn().mockResolvedValue(0),
  markAsRead: vi.fn().mockResolvedValue(undefined),
  markAllAsRead: vi.fn().mockResolvedValue(undefined),
  markContentAsRead: vi.fn().mockResolvedValue(undefined),
}));

describe('useUnreadCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('recipientProfileUid が undefined の場合 count: 0 を返すこと', () => {
    const { result } = renderHook(() => useUnreadCount(undefined));
    expect(result.current.count).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('subscribeUnreadCount が呼ばれること', () => {
    const mockUnsubscribe = vi.fn();
    vi.mocked(notificationService.subscribeUnreadCount).mockImplementation(
      (_uid, callback) => {
        callback(5);
        return mockUnsubscribe;
      },
    );

    const { result } = renderHook(() => useUnreadCount('test-uid'));
    expect(notificationService.subscribeUnreadCount).toHaveBeenCalledWith(
      'test-uid',
      expect.any(Function),
    );
    expect(result.current.count).toBe(5);
  });

  it('アンマウント時に unsubscribe が呼ばれること', () => {
    const mockUnsubscribe = vi.fn();
    vi.mocked(notificationService.subscribeUnreadCount).mockImplementation(
      (_uid, callback) => {
        callback(3);
        return mockUnsubscribe;
      },
    );

    const { unmount } = renderHook(() => useUnreadCount('test-uid'));
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });

  it('コールバックでカウントが更新されること', () => {
    let capturedCallback: ((count: number) => void) | null = null;
    vi.mocked(notificationService.subscribeUnreadCount).mockImplementation(
      (_uid, callback) => {
        capturedCallback = callback;
        callback(0);
        return vi.fn();
      },
    );

    const { result } = renderHook(() => useUnreadCount('test-uid'));
    expect(result.current.count).toBe(0);

    act(() => {
      capturedCallback?.(10);
    });
    expect(result.current.count).toBe(10);
  });
});
