import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    firebaseUser: null,
    userProfile: null,
    isLoading: false,
    isInitialized: true,
  }),
}));

// firebase/authモックはvi.hoisted()で変数を定義する
const { mockSignInWithGoogle, mockLogout } = vi.hoisted(() => ({
  mockSignInWithGoogle: vi.fn(),
  mockLogout: vi.fn(),
}));

vi.mock('@/lib/firebase/auth', () => ({
  signInWithGoogle: mockSignInWithGoogle,
  logout: mockLogout,
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loginWithEmailがエクスポートされない（削除済み）', () => {
    const { result } = renderHook(() => useAuth());
    expect('loginWithEmail' in result.current).toBe(false);
  });

  it('signUpがエクスポートされない（削除済み）', () => {
    const { result } = renderHook(() => useAuth());
    expect('signUp' in result.current).toBe(false);
  });

  it('loginWithGoogleが存在する', () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.loginWithGoogle).toBe('function');
  });

  it('logOutが存在する', () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.logOut).toBe('function');
  });

  it('loginWithGoogle成功時: signInWithGoogleが呼ばれる', async () => {
    mockSignInWithGoogle.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.loginWithGoogle();
    });
    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('logOut成功時: /loginにナビゲートされる', async () => {
    mockLogout.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.logOut();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
