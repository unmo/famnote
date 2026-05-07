import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resizeImageToBlob } from '@/lib/utils/imageResize';
import { uploadAvatar, deleteAvatar, updateMemberAvatarUrl } from '@/lib/firebase/avatarService';
import type { AvatarUploadState } from '@/types/avatar';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UseAvatarUploadReturn {
  uploadState: AvatarUploadState;
  handleFileSelect: (file: File, groupId: string, memberId: string) => Promise<void>;
  handleDelete: (groupId: string, memberId: string, currentAvatarUrl: string) => Promise<void>;
}

// アバター画像のアップロード・削除ロジックを管理するカスタムフック
export function useAvatarUpload(): UseAvatarUploadReturn {
  const queryClient = useQueryClient();
  const [uploadState, setUploadState] = useState<AvatarUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const handleFileSelect = useCallback(
    async (file: File, groupId: string, memberId: string) => {
      // ファイルサイズバリデーション
      if (file.size > MAX_FILE_SIZE) {
        toast.error('画像サイズは5MB以下にしてください');
        return;
      }

      // MIMEタイプバリデーション
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error('JPEG, PNG, WebP形式の画像のみアップロードできます');
        return;
      }

      setUploadState({ isUploading: true, progress: 0, error: null });

      try {
        // Canvas API でリサイズして JPEG Blob に変換
        const blob = await resizeImageToBlob(file, 400, 0.85);

        // Firebase Storage にアップロード
        const { downloadUrl } = await uploadAvatar(
          groupId,
          memberId,
          blob,
          (progress) => {
            setUploadState((prev) => ({ ...prev, progress }));
          }
        );

        // Firestore の avatarUrl フィールドを更新
        await updateMemberAvatarUrl(groupId, memberId, downloadUrl);

        // TanStack Query キャッシュを無効化してリアルタイムデータを再フェッチ
        await queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });

        setUploadState({ isUploading: false, progress: 100, error: null });
        toast.success('プロフィール画像を更新しました');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
        setUploadState({ isUploading: false, progress: 0, error: errorMessage });
        toast.error('アップロードに失敗しました。再度お試しください');
      }
    },
    [queryClient]
  );

  const handleDelete = useCallback(
    async (groupId: string, memberId: string, currentAvatarUrl: string) => {
      setUploadState({ isUploading: true, progress: 0, error: null });

      try {
        // Storage からファイルを削除
        await deleteAvatar(groupId, memberId, currentAvatarUrl);

        // Firestore の avatarUrl を null に更新
        await updateMemberAvatarUrl(groupId, memberId, null);

        // TanStack Query キャッシュを無効化
        await queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });

        setUploadState({ isUploading: false, progress: 0, error: null });
        toast.success('プロフィール画像を削除しました');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
        setUploadState({ isUploading: false, progress: 0, error: errorMessage });
        toast.error('削除に失敗しました。再度お試しください');
      }
    },
    [queryClient]
  );

  return { uploadState, handleFileSelect, handleDelete };
}
