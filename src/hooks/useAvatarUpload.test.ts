import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useAvatarUpload } from './useAvatarUpload';

// 依存モジュールをモック
vi.mock('@/lib/utils/imageResize', () => ({
  resizeImageToBlob: vi.fn(),
}));

vi.mock('@/lib/firebase/avatarService', () => ({
  uploadAvatar: vi.fn(),
  deleteAvatar: vi.fn(),
  updateMemberAvatarUrl: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { resizeImageToBlob } from '@/lib/utils/imageResize';
import { uploadAvatar, deleteAvatar, updateMemberAvatarUrl } from '@/lib/firebase/avatarService';
import { toast } from 'sonner';

const mockResizeImageToBlob = vi.mocked(resizeImageToBlob);
const mockUploadAvatar = vi.mocked(uploadAvatar);
const mockDeleteAvatar = vi.mocked(deleteAvatar);
const mockUpdateMemberAvatarUrl = vi.mocked(updateMemberAvatarUrl);
const mockToast = vi.mocked(toast);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
    queryClient,
  };
}

describe('useAvatarUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期状態: isUploading=false, progress=0, error=null', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useAvatarUpload(), { wrapper });

    expect(result.current.uploadState).toEqual({
      isUploading: false,
      progress: 0,
      error: null,
    });
  });

  it('handleFileSelect 実行中は isUploading=true になる', async () => {
    const { wrapper } = createWrapper();

    // アップロードを遅延させる
    mockResizeImageToBlob.mockResolvedValue(new Blob(['test'], { type: 'image/jpeg' }));
    mockUploadAvatar.mockImplementation(
      (_groupId, _memberId, _blob, onProgress) =>
        new Promise((resolve) => {
          onProgress(50);
          setTimeout(() => resolve({ downloadUrl: 'https://example.com/avatar.jpg', storagePath: 'avatars/g1/m1.jpg' }), 100);
        })
    );
    mockUpdateMemberAvatarUrl.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAvatarUpload(), { wrapper });
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.handleFileSelect(file, 'group1', 'member1');
    });

    // 非同期処理が始まった直後は isUploading=true
    await waitFor(() => {
      expect(result.current.uploadState.isUploading).toBe(true);
    });
  });

  it('5MB 超過ファイルはバリデーションエラーでアップロードされない', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useAvatarUpload(), { wrapper });

    // 5MB + 1 byte のファイル
    const largeFile = new File([new ArrayBuffer(5 * 1024 * 1024 + 1)], 'large.jpg', {
      type: 'image/jpeg',
    });

    await act(async () => {
      await result.current.handleFileSelect(largeFile, 'group1', 'member1');
    });

    expect(mockToast.error).toHaveBeenCalledWith('画像サイズは5MB以下にしてください');
    expect(mockResizeImageToBlob).not.toHaveBeenCalled();
    expect(result.current.uploadState.isUploading).toBe(false);
  });

  it('非対応 MIME タイプはバリデーションエラーでアップロードされない', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useAvatarUpload(), { wrapper });

    const gifFile = new File(['test'], 'test.gif', { type: 'image/gif' });

    await act(async () => {
      await result.current.handleFileSelect(gifFile, 'group1', 'member1');
    });

    expect(mockToast.error).toHaveBeenCalledWith('JPEG, PNG, WebP形式の画像のみアップロードできます');
    expect(mockResizeImageToBlob).not.toHaveBeenCalled();
  });

  it('成功時に TanStack Query キャッシュが無効化される', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    mockResizeImageToBlob.mockResolvedValue(new Blob(['test'], { type: 'image/jpeg' }));
    mockUploadAvatar.mockResolvedValue({
      downloadUrl: 'https://example.com/avatar.jpg',
      storagePath: 'avatars/group1/member1.jpg',
    });
    mockUpdateMemberAvatarUrl.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAvatarUpload(), { wrapper });
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.handleFileSelect(file, 'group1', 'member1');
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['groupMembers', 'group1'],
    });
    expect(mockToast.success).toHaveBeenCalledWith('プロフィール画像を更新しました');
  });

  it('handleDelete 成功後に TanStack Query キャッシュが無効化される', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    mockDeleteAvatar.mockResolvedValue(undefined);
    mockUpdateMemberAvatarUrl.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAvatarUpload(), { wrapper });

    await act(async () => {
      await result.current.handleDelete('group1', 'member1', 'https://example.com/avatar.jpg');
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['groupMembers', 'group1'],
    });
    expect(mockToast.success).toHaveBeenCalledWith('プロフィール画像を削除しました');
  });

  it('アップロード失敗時にエラートーストを表示する', async () => {
    const { wrapper } = createWrapper();

    mockResizeImageToBlob.mockResolvedValue(new Blob(['test'], { type: 'image/jpeg' }));
    mockUploadAvatar.mockRejectedValue(new Error('UPLOAD_FAILED'));

    const { result } = renderHook(() => useAvatarUpload(), { wrapper });
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.handleFileSelect(file, 'group1', 'member1');
    });

    expect(mockToast.error).toHaveBeenCalledWith('アップロードに失敗しました。再度お試しください');
    expect(result.current.uploadState.isUploading).toBe(false);
  });

  it('削除失敗時にエラートーストを表示する', async () => {
    const { wrapper } = createWrapper();

    mockDeleteAvatar.mockRejectedValue(new Error('DELETE_FAILED'));

    const { result } = renderHook(() => useAvatarUpload(), { wrapper });

    await act(async () => {
      await result.current.handleDelete('group1', 'member1', 'https://example.com/avatar.jpg');
    });

    expect(mockToast.error).toHaveBeenCalledWith('削除に失敗しました。再度お試しください');
    expect(result.current.uploadState.isUploading).toBe(false);
  });
});
