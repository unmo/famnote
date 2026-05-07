import { describe, it, expect, vi, beforeEach } from 'vitest';

// Firebase モジュールをモック
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock('./config', () => ({
  storage: {},
  db: {},
}));

vi.mock('./storage', () => ({
  getGroupAvatarPath: vi.fn((groupId: string, memberId: string) =>
    `avatars/${groupId}/${memberId}.jpg`
  ),
}));

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { uploadAvatar, deleteAvatar, updateMemberAvatarUrl } from './avatarService';

const mockRef = vi.mocked(ref);
const mockUploadBytesResumable = vi.mocked(uploadBytesResumable);
const mockGetDownloadURL = vi.mocked(getDownloadURL);
const mockDeleteObject = vi.mocked(deleteObject);
const mockDoc = vi.mocked(doc);
const mockUpdateDoc = vi.mocked(updateDoc);

describe('avatarService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRef.mockReturnValue({} as ReturnType<typeof ref>);
  });

  describe('uploadAvatar', () => {
    it('Storage にファイルをアップロードしてダウンロード URL を返す', async () => {
      const mockSnapshotRef = {};
      const mockTask = {
        on: vi.fn().mockImplementation(
          (_event: string, _progress: unknown, _error: unknown, complete: () => void) => {
            complete();
          }
        ),
        snapshot: { ref: mockSnapshotRef },
      };
      mockUploadBytesResumable.mockReturnValue(mockTask as unknown as ReturnType<typeof uploadBytesResumable>);
      mockGetDownloadURL.mockResolvedValue('https://example.com/avatar.jpg');

      const blob = new Blob(['test'], { type: 'image/jpeg' });
      const onProgress = vi.fn();

      const result = await uploadAvatar('group1', 'member1', blob, onProgress);

      expect(result.downloadUrl).toBe('https://example.com/avatar.jpg');
      expect(result.storagePath).toBe('avatars/group1/member1.jpg');
    });

    it('プログレスコールバックを呼び出す', async () => {
      let progressCallback: ((snapshot: { bytesTransferred: number; totalBytes: number }) => void) | null = null;
      const mockTask = {
        on: vi.fn().mockImplementation(
          (
            _event: string,
            progress: (snapshot: { bytesTransferred: number; totalBytes: number }) => void,
            _error: unknown,
            complete: () => void
          ) => {
            progressCallback = progress;
            // プログレスを呼び出してから完了
            progress({ bytesTransferred: 50, totalBytes: 100 });
            complete();
          }
        ),
        snapshot: { ref: {} },
      };
      mockUploadBytesResumable.mockReturnValue(mockTask as unknown as ReturnType<typeof uploadBytesResumable>);
      mockGetDownloadURL.mockResolvedValue('https://example.com/avatar.jpg');

      const blob = new Blob(['test'], { type: 'image/jpeg' });
      const onProgress = vi.fn();

      await uploadAvatar('group1', 'member1', blob, onProgress);

      expect(progressCallback).not.toBeNull();
      expect(onProgress).toHaveBeenCalledWith(50);
    });

    it('Storage エラー時にエラーをスローする', async () => {
      const mockError = new Error('STORAGE_ERROR');
      const mockTask = {
        on: vi.fn().mockImplementation(
          (_event: string, _progress: unknown, error: (e: Error) => void) => {
            error(mockError);
          }
        ),
        snapshot: { ref: {} },
      };
      mockUploadBytesResumable.mockReturnValue(mockTask as unknown as ReturnType<typeof uploadBytesResumable>);

      const blob = new Blob(['test'], { type: 'image/jpeg' });
      const onProgress = vi.fn();

      await expect(uploadAvatar('group1', 'member1', blob, onProgress)).rejects.toThrow('STORAGE_ERROR');
    });
  });

  describe('deleteAvatar', () => {
    it('Storage からファイルを削除する', async () => {
      mockDeleteObject.mockResolvedValue(undefined);

      await deleteAvatar('group1', 'member1', 'https://example.com/avatar.jpg');

      expect(mockDeleteObject).toHaveBeenCalledTimes(1);
    });

    it('ファイルが存在しない（object-not-found）場合はエラーを無視する', async () => {
      const notFoundError = Object.assign(new Error('Not found'), { code: 'storage/object-not-found' });
      mockDeleteObject.mockRejectedValue(notFoundError);

      // エラーが再スローされないことを確認
      await expect(deleteAvatar('group1', 'member1', 'https://example.com/avatar.jpg')).resolves.toBeUndefined();
    });

    it('object-not-found 以外のエラーは再スローする', async () => {
      const permissionError = Object.assign(new Error('Permission denied'), { code: 'storage/unauthorized' });
      mockDeleteObject.mockRejectedValue(permissionError);

      await expect(deleteAvatar('group1', 'member1', 'https://example.com/avatar.jpg')).rejects.toThrow();
    });
  });

  describe('updateMemberAvatarUrl', () => {
    it('Firestore の avatarUrl フィールドを更新する', async () => {
      const mockDocRef = {};
      mockDoc.mockReturnValue(mockDocRef as ReturnType<typeof doc>);
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateMemberAvatarUrl('group1', 'member1', 'https://example.com/avatar.jpg');

      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        avatarUrl: 'https://example.com/avatar.jpg',
      });
    });

    it('null を渡すと avatarUrl が null になる', async () => {
      const mockDocRef = {};
      mockDoc.mockReturnValue(mockDocRef as ReturnType<typeof doc>);
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateMemberAvatarUrl('group1', 'member1', null);

      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        avatarUrl: null,
      });
    });
  });
});
