import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// useActiveProfile のモック
const mockUseActiveProfile = vi.fn();
vi.mock('@/hooks/useActiveProfile', () => ({
  useActiveProfile: () => mockUseActiveProfile(),
}));

// useAuthStore のモック
vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: { firebaseUser: { uid: string } | null }) => unknown) =>
    selector({ firebaseUser: { uid: 'test-uid' } }),
}));

// useAddJournalComment のモック
const mockMutateAsync = vi.fn().mockResolvedValue(undefined);
vi.mock('@/hooks/useJournalComments', () => ({
  useAddJournalComment: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

// Framer Motion のモック（アニメーションをスキップ）
vi.mock('motion/react', () => ({
  motion: {
    form: ({ children, ...props }: React.HTMLAttributes<HTMLFormElement> & { children?: React.ReactNode }) => (
      <form {...props}>{children}</form>
    ),
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

import { JournalCommentForm } from '@/components/journals/JournalCommentForm';

const managerProfile = {
  uid: 'manager-uid',
  displayName: '田中パパ',
  avatarUrl: null,
  role: 'owner' as const,
};

describe('JournalCommentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('isManager=true のとき入力フォームが表示される', () => {
    mockUseActiveProfile.mockReturnValue({
      activeProfile: managerProfile,
      isManager: true,
    });
    render(<JournalCommentForm journalId="journal-1" />);
    // フォームはテキストエリアと送信ボタンで確認
    expect(screen.getByRole('textbox', { name: 'コメントを入力' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /送信/i })).toBeInTheDocument();
  });

  it('isManager=false のとき入力フォームが表示されない', () => {
    mockUseActiveProfile.mockReturnValue({
      activeProfile: { ...managerProfile, role: 'member' },
      isManager: false,
    });
    render(<JournalCommentForm journalId="journal-1" />);
    expect(screen.queryByRole('textbox', { name: 'コメントを入力' })).not.toBeInTheDocument();
  });

  it('activeProfile が null の場合はフォームが表示されない', () => {
    mockUseActiveProfile.mockReturnValue({
      activeProfile: null,
      isManager: false,
    });
    render(<JournalCommentForm journalId="journal-1" />);
    expect(screen.queryByRole('textbox', { name: 'コメントを入力' })).not.toBeInTheDocument();
  });

  it('テキストが空の時は送信ボタンが disabled', () => {
    mockUseActiveProfile.mockReturnValue({
      activeProfile: managerProfile,
      isManager: true,
    });
    render(<JournalCommentForm journalId="journal-1" />);
    const button = screen.getByRole('button', { name: /送信/i });
    expect(button).toBeDisabled();
  });

  it('テキストを入力すると送信ボタンが有効になる', () => {
    mockUseActiveProfile.mockReturnValue({
      activeProfile: managerProfile,
      isManager: true,
    });
    render(<JournalCommentForm journalId="journal-1" />);

    const textarea = screen.getByRole('textbox', { name: 'コメントを入力' });
    fireEvent.change(textarea, { target: { value: 'よくがんばったね！' } });

    const button = screen.getByRole('button', { name: /送信/i });
    expect(button).not.toBeDisabled();
  });

  it('200文字超入力時に送信ボタンが disabled になる', () => {
    mockUseActiveProfile.mockReturnValue({
      activeProfile: managerProfile,
      isManager: true,
    });
    render(<JournalCommentForm journalId="journal-1" />);

    const textarea = screen.getByRole('textbox', { name: 'コメントを入力' });
    fireEvent.change(textarea, { target: { value: 'a'.repeat(201) } });

    const button = screen.getByRole('button', { name: /送信/i });
    expect(button).toBeDisabled();
  });

  it('文字数カウンターが正しく表示される', () => {
    mockUseActiveProfile.mockReturnValue({
      activeProfile: managerProfile,
      isManager: true,
    });
    render(<JournalCommentForm journalId="journal-1" />);

    const textarea = screen.getByRole('textbox', { name: 'コメントを入力' });
    fireEvent.change(textarea, { target: { value: 'テスト' } });

    expect(screen.getByText('3/200')).toBeInTheDocument();
  });
});
