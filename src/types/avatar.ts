// アバターアップロード機能の型定義

export interface AvatarUploadResult {
  downloadUrl: string;
  storagePath: string;
}

export interface AvatarUploadState {
  isUploading: boolean;
  /** アップロード進捗（0〜100） */
  progress: number;
  error: string | null;
}
