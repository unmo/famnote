import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from './config';
import { getGroupAvatarPath } from './storage';
import type { AvatarUploadResult } from '@/types/avatar';

/**
 * アバター画像を Firebase Storage にアップロードし、ダウンロード URL を返す。
 * 同一パスに上書きするため既存画像は自動的に置き換えられる。
 */
export async function uploadAvatar(
  groupId: string,
  memberId: string,
  blob: Blob,
  onProgress: (progress: number) => void
): Promise<AvatarUploadResult> {
  const storagePath = getGroupAvatarPath(groupId, memberId);
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, blob, {
    contentType: 'image/jpeg',
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ downloadUrl, storagePath });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Firebase Storage からアバター画像を削除する。
 * ファイルが存在しない場合は無視する。
 */
export async function deleteAvatar(
  groupId: string,
  memberId: string,
  // currentAvatarUrl は将来的な拡張のため引数として保持（現在は storagePath で削除）
  _currentAvatarUrl: string
): Promise<void> {
  const storagePath = getGroupAvatarPath(groupId, memberId);
  const storageRef = ref(storage, storagePath);

  try {
    await deleteObject(storageRef);
  } catch (error) {
    // ファイルが存在しない場合（object-not-found）は無視する
    const storageError = error as { code?: string };
    if (storageError.code !== 'storage/object-not-found') {
      throw error;
    }
  }
}

/**
 * Firestore の members ドキュメントの avatarUrl フィールドを更新する。
 * null を渡すとイニシャル表示に戻る。
 */
export async function updateMemberAvatarUrl(
  groupId: string,
  memberId: string,
  avatarUrl: string | null
): Promise<void> {
  const memberRef = doc(db, 'groups', groupId, 'members', memberId);
  await updateDoc(memberRef, { avatarUrl });
}
