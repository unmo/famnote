import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/routes/auth/LoginPage';

// i18n モック：テスト内で日本語テキストが正しく検索できるよう実際の翻訳値を返す
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.loginWithGoogle': 'Googleでログイン',
        'auth.loggingIn': 'ログイン中...',
        'auth.loginProcessing': 'ログイン処理中',
        'auth.loginPageAriaLabel': 'ログインページ',
        'auth.loginFailed': 'ログインに失敗しました。もう一度お試しください。',
        'auth.featureBadgeGrowth': '成長記録',
        'auth.featureBadgeFamily': '家族共有',
        'auth.featureBadgeCheer': '応援機能',
      };
      return translations[key] ?? key;
    },
    i18n: { language: 'ja', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
  Trans: ({ children }: { children: unknown }) => children,
}));

// useAuthのモック
const mockLoginWithGoogle = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    loginWithGoogle: mockLoginWithGoogle,
    user: null,
    userProfile: null,
    isLoading: false,
    isAuthenticated: false,
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Googleログインボタンが表示される', () => {
    renderLoginPage();
    expect(screen.getByRole('button', { name: /Googleでログイン/i })).toBeInTheDocument();
  });

  it('メールアドレス入力欄が存在しない', () => {
    renderLoginPage();
    expect(screen.queryByRole('textbox', { name: /メール/i })).not.toBeInTheDocument();
  });

  it('FamNoteブランドが表示される', () => {
    renderLoginPage();
    expect(screen.getByText('FamNote')).toBeInTheDocument();
    expect(screen.getByText('家族の記録を、')).toBeInTheDocument();
    expect(screen.getByText('ひとつの場所に。')).toBeInTheDocument();
  });

  it('機能バッジが表示される', () => {
    renderLoginPage();
    expect(screen.getByText('成長記録')).toBeInTheDocument();
    expect(screen.getByText('家族共有')).toBeInTheDocument();
    expect(screen.getByText('応援機能')).toBeInTheDocument();
  });

  it('GoogleボタンクリックでloginWithGoogleが呼ばれる', async () => {
    mockLoginWithGoogle.mockResolvedValue(undefined);
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /Googleでログイン/i }));
    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  it('認証エラー時にエラーメッセージが表示される', async () => {
    const error = new Error('auth error');
    (error as { code?: string }).code = 'auth/internal-error';
    mockLoginWithGoogle.mockRejectedValue(error);

    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /Googleでログイン/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('popup-closed-by-userエラーはエラー表示しない', async () => {
    const error = new Error('popup closed');
    (error as { code?: string }).code = 'auth/popup-closed-by-user';
    mockLoginWithGoogle.mockRejectedValue(error);

    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /Googleでログイン/i }));
    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalled();
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
