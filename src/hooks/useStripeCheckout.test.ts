import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// firebase/functionsをモック
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(),
}));

// firebase/configをモック
vi.mock('@/lib/firebase/config', () => ({
  app: {},
}));

// sonnerをモック
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

import { useStripeCheckout } from './useStripeCheckout';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';

describe('useStripeCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // window.location.href のセッターをモック
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  it('正常系: startCheckoutを呼び出すとhttpsCallableが実行されリダイレクトが発生する', async () => {
    const mockCallable = vi.fn().mockResolvedValue({ data: { url: 'https://checkout.stripe.com/test' } });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable);

    const { result } = renderHook(() => useStripeCheckout());

    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.startCheckout();
    });

    expect(mockCallable).toHaveBeenCalledWith({});
    expect(window.location.href).toBe('https://checkout.stripe.com/test');
    expect(result.current.isLoading).toBe(false);
  });

  it('異常系: httpsCallableがエラーをスローした場合、Sonnerトーストが表示されisLoadingがfalseに戻る', async () => {
    const mockCallable = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.mocked(httpsCallable).mockReturnValue(mockCallable);

    const { result } = renderHook(() => useStripeCheckout());

    await act(async () => {
      await result.current.startCheckout();
    });

    expect(toast.error).toHaveBeenCalledWith(
      '決済ページの取得に失敗しました。しばらく経ってから再度お試しください。',
      expect.objectContaining({ duration: 5000 })
    );
    expect(result.current.isLoading).toBe(false);
  });

  it('二重クリック防止: startCheckout実行中にisLoadingがtrueになり、二重呼び出しを防ぐ', async () => {
    let resolvePromise!: (value: { data: { url: string } }) => void;
    const pendingPromise = new Promise<{ data: { url: string } }>((resolve) => {
      resolvePromise = resolve;
    });
    const mockCallable = vi.fn().mockReturnValue(pendingPromise);
    vi.mocked(httpsCallable).mockReturnValue(mockCallable);

    const { result } = renderHook(() => useStripeCheckout());

    // 1回目の呼び出し（非同期・完了前）
    act(() => {
      result.current.startCheckout();
    });

    // isLoadingがtrueになっていることを確認
    expect(result.current.isLoading).toBe(true);

    // 2回目の呼び出しは isLoading=true のためスキップされる
    await act(async () => {
      await result.current.startCheckout();
    });

    // mockCallableは1回しか呼ばれていない（2回目はスキップ）
    expect(mockCallable).toHaveBeenCalledTimes(1);

    // Promiseを解決してクリーンアップ
    await act(async () => {
      resolvePromise({ data: { url: 'https://checkout.stripe.com/test' } });
    });
  });
});
