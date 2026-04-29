import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileManagementSection } from '@/components/settings/ProfileManagementSection';

// Framer Motion をモック（アニメーションをスキップ）
// whileHover / whileTap などの Framer 独自 props を除去して標準 DOM 要素に渡す
vi.mock('motion/react', () => {
  const React = require('react');
  // Framer Motion 固有の props を除いて DOM に渡す（aria-label 等は保持）
  function stripMotionProps(props: Record<string, unknown>): Record<string, unknown> {
    const { initial: _i, animate: _a, exit: _e, transition: _t, variants: _v, whileHover: _wh, whileTap: _wt, ...rest } = props;
    return rest;
  }

  return {
    motion: {
      div: (props: Record<string, unknown>) => {
        const { children, ...rest } = props;
        return React.createElement('div', stripMotionProps(rest), children);
      },
      button: (props: Record<string, unknown>) => {
        const { children, ...rest } = props;
        return React.createElement('button', stripMotionProps(rest), children);
      },
    },
    AnimatePresence: ({ children }: { children: unknown }) => children,
  };
});

// Firestore 操作のモック
const mockUpdateMemberDisplayName = vi.fn();
const mockUpdateMemberProfile = vi.fn();
const mockAddChildProfile = vi.fn();
const mockDeleteChildProfile = vi.fn();

vi.mock('@/lib/firebase/firestore', () => ({
  updateMemberDisplayName: (...args: unknown[]) => mockUpdateMemberDisplayName(...args),
  updateMemberProfile: (...args: unknown[]) => mockUpdateMemberProfile(...args),
  addChildProfile: (...args: unknown[]) => mockAddChildProfile(...args),
  deleteChildProfile: (...args: unknown[]) => mockDeleteChildProfile(...args),
}));

// Sonner トーストのモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// authStore・groupStore・profileStore のモック変数
const { mockAuthState, mockGroupState, mockProfileState } = vi.hoisted(() => {
  // vi.hoisted() 内では外部変数に依存できないため、Timestamp 相当の値をここで直接定義
  const ts = null;
  return {
    mockAuthState: {
      current: {
        firebaseUser: { uid: 'owner-uid' },
        userProfile: { uid: 'owner-uid', displayName: 'オーナー太郎', avatarUrl: null, groupId: 'group-1', subscriptionStatus: 'free' as const, email: 'test@test.com' },
      },
    },
    mockGroupState: {
      current: {
        group: { id: 'group-1', name: 'テストグループ', memberCount: 2, maxMembers: 10, iconUrl: null, inviteCode: 'ABC123', ownerUid: 'owner-uid', createdAt: ts, updatedAt: ts },
        members: [
          {
            uid: 'owner-uid',
            displayName: 'オーナー太郎',
            avatarUrl: null,
            sports: [],
            role: 'owner' as const,
            joinedAt: ts,
            lastActiveAt: null,
            isChildProfile: false,
          },
          {
            uid: 'child_abc123',
            displayName: '子供花子',
            avatarUrl: null,
            sports: [],
            role: 'member' as const,
            joinedAt: ts,
            lastActiveAt: null,
            isChildProfile: true,
          },
        ],
      },
    },
    mockProfileState: {
      current: {
        activeProfile: null as null | { uid: string },
        clearActiveProfile: vi.fn(),
      },
    },
  };
});

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => mockAuthState.current,
}));

vi.mock('@/store/groupStore', () => ({
  useGroupStore: () => mockGroupState.current,
}));

vi.mock('@/store/profileStore', () => ({
  useProfileStore: () => mockProfileState.current,
}));

// 初期グループ状態を関数で返すことで各テストで独立した状態を使用できるようにする
function getInitialGroupState() {
  const ts = null;
  return {
    group: { id: 'group-1', name: 'テストグループ', memberCount: 2, maxMembers: 10, iconUrl: null, inviteCode: 'ABC123', ownerUid: 'owner-uid', createdAt: ts, updatedAt: ts },
    members: [
      { uid: 'owner-uid', displayName: 'オーナー太郎', avatarUrl: null, sports: [], role: 'owner' as const, joinedAt: ts, lastActiveAt: null, isChildProfile: false },
      { uid: 'child_abc123', displayName: '子供花子', avatarUrl: null, sports: [], role: 'member' as const, joinedAt: ts, lastActiveAt: null, isChildProfile: true },
    ],
  };
}

describe('ProfileManagementSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 各テストで初期状態に戻す
    mockGroupState.current = getInitialGroupState();
  });

  describe('オーナー向け表示', () => {
    it('「プロフィール管理」のセクション見出しが表示される', () => {
      render(<ProfileManagementSection />);
      expect(screen.getByText('プロフィール管理')).toBeInTheDocument();
    });

    it('「あなたのプロフィール」小見出しが表示される', () => {
      render(<ProfileManagementSection />);
      expect(screen.getByText('あなたのプロフィール')).toBeInTheDocument();
    });

    it('自分の名前が表示される', () => {
      render(<ProfileManagementSection />);
      expect(screen.getByText('オーナー太郎')).toBeInTheDocument();
    });

    it('「メンバー」小見出しが表示される（オーナーのみ）', () => {
      render(<ProfileManagementSection />);
      expect(screen.getByText('メンバー')).toBeInTheDocument();
    });

    it('子プロフィールの名前が表示される', () => {
      render(<ProfileManagementSection />);
      expect(screen.getByText('子供花子')).toBeInTheDocument();
    });

    it('プロフィール追加ボタンが表示される', () => {
      render(<ProfileManagementSection />);
      expect(screen.getByRole('button', { name: /子プロフィールを追加/ })).toBeInTheDocument();
    });
  });

  describe('メンバーロール（非オーナー）', () => {
    beforeEach(() => {
      // 自分を member ロールに変更
      mockGroupState.current = {
        ...mockGroupState.current,
        members: mockGroupState.current.members.map((m) =>
          m.uid === 'owner-uid' ? { ...m, role: 'member' as const } : m
        ),
      };
    });

    it('「メンバー」小見出しが表示されない', () => {
      render(<ProfileManagementSection />);
      expect(screen.queryByText('メンバー')).not.toBeInTheDocument();
    });

    it('プロフィール追加ボタンが表示されない', () => {
      render(<ProfileManagementSection />);
      expect(screen.queryByRole('button', { name: /子プロフィールを追加/ })).not.toBeInTheDocument();
    });

    it('自分のプロフィール名は表示される', () => {
      render(<ProfileManagementSection />);
      expect(screen.getByText('オーナー太郎')).toBeInTheDocument();
    });
  });

  describe('プロフィール追加フォームのバリデーション', () => {
    it('空の名前で追加ボタンを押してもエラーが表示され onAdd は呼ばれない', async () => {
      render(<ProfileManagementSection />);

      // フォームを開く（テキスト内容で特定、SVGとテキストが混在するため regex を使用）
      const addButton = screen.getByRole('button', { name: /プロフィールを追加/ });
      fireEvent.click(addButton);

      // 追加するボタンをクリック（名前が空のまま）
      const submitButton = screen.getByText('追加する');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('alert').textContent).toBe('名前は必須です');
      });
      expect(mockAddChildProfile).not.toHaveBeenCalled();
    });

    it('21文字以上の名前でエラーが表示される', async () => {
      render(<ProfileManagementSection />);

      const addButton = screen.getByRole('button', { name: /プロフィールを追加/ });
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText('例: 太郎');
      fireEvent.change(input, { target: { value: 'あいうえおかきくけこさしすせそたちつてなに' } }); // 21文字

      const submitButton = screen.getByText('追加する');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert').textContent).toBe('名前は20文字以内で入力してください');
      });
      expect(mockAddChildProfile).not.toHaveBeenCalled();
    });

    it('正しい名前で addChildProfile が呼ばれる', async () => {
      mockAddChildProfile.mockResolvedValue('child_new123');
      render(<ProfileManagementSection />);

      const addButton = screen.getByRole('button', { name: /プロフィールを追加/ });
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText('例: 太郎');
      fireEvent.change(input, { target: { value: '新メンバー' } });

      const submitButton = screen.getByText('追加する');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAddChildProfile).toHaveBeenCalledWith('group-1', '新メンバー');
      });
    });
  });

  describe('メンバー上限到達時', () => {
    it('メンバーが最大人数の時、追加ボタンが disabled になる', () => {
      mockGroupState.current = {
        ...mockGroupState.current,
        group: { ...mockGroupState.current.group!, memberCount: 10 },
      };
      render(<ProfileManagementSection />);
      const addButton = screen.getByRole('button', { name: /プロフィールを追加/ });
      expect(addButton).toBeDisabled();
    });
  });
});
