import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

// authStoreとprofileStoreのモック変数をvi.hoisted()で定義
const { mockAuthState, mockActiveProfile } = vi.hoisted(() => ({
  mockAuthState: {
    current: {
      firebaseUser: null as Record<string, unknown> | null,
      userProfile: null as { groupId?: string } | null,
      isLoading: false,
      isInitialized: true,
    },
  },
  mockActiveProfile: { current: null as Record<string, unknown> | null },
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => mockAuthState.current,
}));

vi.mock('@/store/profileStore', () => ({
  useProfileStore: (selector: (s: { activeProfile: Record<string, unknown> | null }) => unknown) =>
    selector({ activeProfile: mockActiveProfile.current }),
}));

// テスト用のOutletコンテンツ
function TestOutlet() {
  return <div>メインコンテンツ</div>;
}

// テスト用のリダイレクト先確認コンポーネント
function LoginPage() {
  return <div>ログインページ</div>;
}
function OnboardingPage() {
  return <div>オンボーディングページ</div>;
}
function SelectProfilePage() {
  return <div>プロフィール選択ページ</div>;
}
function DashboardPage() {
  return <div>ダッシュボードページ</div>;
}

// ProtectedRouteをラップしてテストできるヘルパー
function renderProtectedRoute(
  props: { requireGroup?: boolean; requireProfile?: boolean },
  initialPath = '/protected'
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding/profile" element={<OnboardingPage />} />
        <Route path="/select-profile" element={<SelectProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route element={<ProtectedRoute {...props} />}>
          <Route path="/protected" element={<TestOutlet />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルト: 認証済み・グループあり・プロフィールあり
    mockAuthState.current = {
      firebaseUser: { uid: 'test-user' },
      userProfile: { groupId: 'group-1' },
      isLoading: false,
      isInitialized: true,
    };
    mockActiveProfile.current = { uid: 'test-user', displayName: 'テスト' };
  });

  describe('初期化中・ローディング', () => {
    it('isInitializedがfalseのときローディングスピナーが表示される', () => {
      mockAuthState.current = {
        ...mockAuthState.current,
        isInitialized: false,
        isLoading: false,
      };
      renderProtectedRoute({ requireGroup: true, requireProfile: true });
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('isLoadingがtrueのときローディングスピナーが表示される', () => {
      mockAuthState.current = {
        ...mockAuthState.current,
        isInitialized: true,
        isLoading: true,
      };
      renderProtectedRoute({ requireGroup: true, requireProfile: true });
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });
  });

  describe('未認証', () => {
    it('firebaseUserがnullのとき/loginにリダイレクトされる', () => {
      mockAuthState.current = {
        ...mockAuthState.current,
        firebaseUser: null,
      };
      renderProtectedRoute({ requireGroup: true });
      expect(screen.getByText('ログインページ')).toBeInTheDocument();
    });
  });

  describe('requireGroup=true', () => {
    it('groupIdがないとき/onboarding/profileにリダイレクトされる', () => {
      mockAuthState.current = {
        ...mockAuthState.current,
        userProfile: { groupId: undefined },
      };
      renderProtectedRoute({ requireGroup: true });
      expect(screen.getByText('オンボーディングページ')).toBeInTheDocument();
    });
  });

  describe('requireGroup=false（オンボーディング画面）', () => {
    it('グループ参加済み・プロフィール選択済みのとき/dashboardにリダイレクトされる', () => {
      mockActiveProfile.current = { uid: 'test-user' };
      renderProtectedRoute({ requireGroup: false });
      expect(screen.getByText('ダッシュボードページ')).toBeInTheDocument();
    });

    it('グループ参加済み・プロフィール未選択のとき/select-profileにリダイレクトされる', () => {
      mockActiveProfile.current = null;
      renderProtectedRoute({ requireGroup: false });
      expect(screen.getByText('プロフィール選択ページ')).toBeInTheDocument();
    });
  });

  describe('requireProfile=true', () => {
    it('activeProfileがnullのとき/select-profileにリダイレクトされる', () => {
      mockActiveProfile.current = null;
      renderProtectedRoute({ requireGroup: true, requireProfile: true });
      expect(screen.getByText('プロフィール選択ページ')).toBeInTheDocument();
    });

    it('activeProfileがあるときOutletが表示される', () => {
      mockActiveProfile.current = { uid: 'test-user', displayName: 'テスト' };
      renderProtectedRoute({ requireGroup: true, requireProfile: true });
      expect(screen.getByText('メインコンテンツ')).toBeInTheDocument();
    });
  });

  describe('全条件を満たす場合', () => {
    it('Outletが表示される', () => {
      renderProtectedRoute({ requireGroup: true, requireProfile: true });
      expect(screen.getByText('メインコンテンツ')).toBeInTheDocument();
    });
  });
});
