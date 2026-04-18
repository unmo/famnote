import { useState } from 'react';
import { uploadImage } from '@/lib/firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface UploadState {
  progress: number;
  isUploading: boolean;
}

// 画像アップロードのカスタムフック
export function useImageUpload(basePath: string) {
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});

  // 単一ファイルをアップロード
  const uploadFile = async (file: File): Promise<string> => {
    const fileId = uuidv4();
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${basePath}/${fileId}.${ext}`;

    setUploadStates((prev) => ({
      ...prev,
      [fileId]: { progress: 0, isUploading: true },
    }));

    try {
      const url = await uploadImage(path, file, (progress) => {
        setUploadStates((prev) => ({
          ...prev,
          [fileId]: { progress, isUploading: true },
        }));
      });

      setUploadStates((prev) => {
        const next = { ...prev };
        delete next[fileId];
        return next;
      });

      return url;
    } catch (error) {
      setUploadStates((prev) => {
        const next = { ...prev };
        delete next[fileId];
        return next;
      });

      const errorCode = (error as { code?: string }).code;
      if (errorCode === 'INVALID_FILE_TYPE') {
        toast.error('JPEG, PNG, WebP形式の画像のみアップロードできます');
      } else if (errorCode === 'FILE_TOO_LARGE') {
        toast.error('ファイルサイズは10MB以下にしてください');
      } else {
        toast.error('画像のアップロードに失敗しました');
      }
      throw error;
    }
  };

  // 複数ファイルをアップロード（最大5枚）
  const uploadFiles = async (files: File[], currentCount = 0): Promise<string[]> => {
    const remaining = 5 - currentCount;
    if (files.length > remaining) {
      toast.error(`画像は最大5枚まで添付できます（あと${remaining}枚追加可能）`);
      files = files.slice(0, remaining);
    }

    const urls = await Promise.all(files.map((f) => uploadFile(f)));
    return urls;
  };

  const isUploading = Object.values(uploadStates).some((s) => s.isUploading);
  const totalProgress =
    Object.values(uploadStates).reduce((sum, s) => sum + s.progress, 0) /
    Math.max(Object.keys(uploadStates).length, 1);

  return { uploadFile, uploadFiles, isUploading, totalProgress };
}
