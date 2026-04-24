import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useProfileStore } from '@/store/profileStore';
import type { GroupMember } from '@/types/group';
import { Timestamp } from 'firebase/firestore';

// firebase/firestoreをモック（Timestampのみ使用）
vi.mock('firebase/firestore', () => ({
  Timestamp: {
    now: () => ({ seconds: 0, nanoseconds: 0 }),
  },
}));

const SESSION_KEY = 'famnote_active_profile_uid';

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

describe('profileStore', () => {
  beforeEach(() => {
    // 各テスト前にストアとsessionStorageをリセット
    useProfileStore.setState({ activeProfile: null });
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('setActiveProfile', () => {
    it('activeProfileが指定したメンバーに更新される', () => {
      const member = makeMember('user-1', 'owner');
      useProfileStore.getState().setActiveProfile(member);
      expect(useProfileStore.getState().activeProfile).toEqual(member);
    });

    it('sessionStorageにUIDが保存される', () => {
      const member = makeMember('user-1');
      useProfileStore.getState().setActiveProfile(member);
      expect(sessionStorage.getItem(SESSION_KEY)).toBe('user-1');
    });
  });

  describe('clearActiveProfile', () => {
    it('activeProfileがnullになる', () => {
      const member = makeMember('user-1');
      useProfileStore.setState({ activeProfile: member });
      sessionStorage.setItem(SESSION_KEY, 'user-1');

      useProfileStore.getState().clearActiveProfile();

      expect(useProfileStore.getState().activeProfile).toBeNull();
    });

    it('sessionStorageのキーが削除される', () => {
      sessionStorage.setItem(SESSION_KEY, 'user-1');
      useProfileStore.getState().clearActiveProfile();
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });
  });

  describe('restoreFromSession', () => {
    it('sessionStorageのUIDと一致するメンバーが復元される', () => {
      const member1 = makeMember('user-1');
      const member2 = makeMember('user-2');
      sessionStorage.setItem(SESSION_KEY, 'user-2');

      useProfileStore.getState().restoreFromSession([member1, member2]);

      expect(useProfileStore.getState().activeProfile).toEqual(member2);
    });

    it('メンバー一覧に存在しないUIDの場合はnullになる', () => {
      const member1 = makeMember('user-1');
      sessionStorage.setItem(SESSION_KEY, 'non-existent-uid');

      useProfileStore.getState().restoreFromSession([member1]);

      expect(useProfileStore.getState().activeProfile).toBeNull();
    });

    it('sessionStorageが空のときはnullになる', () => {
      const member1 = makeMember('user-1');
      // sessionStorageには何も入っていない状態

      useProfileStore.getState().restoreFromSession([member1]);

      expect(useProfileStore.getState().activeProfile).toBeNull();
    });

    it('メンバー一覧が空でもクラッシュしない', () => {
      sessionStorage.setItem(SESSION_KEY, 'user-1');

      expect(() => {
        useProfileStore.getState().restoreFromSession([]);
      }).not.toThrow();

      expect(useProfileStore.getState().activeProfile).toBeNull();
    });
  });

  describe('sessionStorage利用不可環境', () => {
    it('sessionStorageがthrowする環境でsetActiveProfileがクラッシュしない', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('sessionStorage is not available');
      });

      const member = makeMember('user-1');
      expect(() => {
        useProfileStore.getState().setActiveProfile(member);
      }).not.toThrow();

      // activeProfileは更新される（sessionStorageエラーは無視）
      expect(useProfileStore.getState().activeProfile).toEqual(member);

      Storage.prototype.setItem = originalSetItem;
    });

    it('sessionStorageがthrowする環境でclearActiveProfileがクラッシュしない', () => {
      const originalRemoveItem = Storage.prototype.removeItem;
      Storage.prototype.removeItem = vi.fn(() => {
        throw new Error('sessionStorage is not available');
      });

      expect(() => {
        useProfileStore.getState().clearActiveProfile();
      }).not.toThrow();

      Storage.prototype.removeItem = originalRemoveItem;
    });

    it('sessionStorageがthrowする環境でrestoreFromSessionがクラッシュしない', () => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('sessionStorage is not available');
      });

      const member = makeMember('user-1');
      expect(() => {
        useProfileStore.getState().restoreFromSession([member]);
      }).not.toThrow();

      expect(useProfileStore.getState().activeProfile).toBeNull();

      Storage.prototype.getItem = originalGetItem;
    });
  });
});
