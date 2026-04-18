import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type StorageError,
} from 'firebase/storage';
import { storage } from './config';

// 画像アップロード進捗コールバック型
type UploadProgressCallback = (progress: number) => void;

// Firebase Storageへの画像アップロード
export async function uploadImage(
  path: string,
  file: File,
  onProgress?: UploadProgressCallback
): Promise<string> {
  // ファイルタイプバリデーション
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('INVALID_FILE_TYPE');
  }

  // ファイルサイズバリデーション（10MB以下）
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('FILE_TOO_LARGE');
  }

  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error: StorageError) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}

// 画像削除
export async function deleteImage(url: string): Promise<void> {
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  } catch {
    // 削除失敗は無視（すでに削除済みの場合など）
  }
}

// ノート用画像パスを生成
export function getNoteImagePath(noteId: string, filename: string): string {
  return `notes/${noteId}/${filename}`;
}

// アバター用画像パスを生成
export function getAvatarPath(userId: string, filename: string): string {
  return `avatars/${userId}/${filename}`;
}

// グループアイコン用画像パスを生成
export function getGroupIconPath(groupId: string, filename: string): string {
  return `groups/${groupId}/${filename}`;
}
