// テーマ型定義
export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  isPremium: boolean;
}

// ユーザーテーマ設定（localStorageおよびFirestoreに保存）
export interface UserTheme {
  themeId: string;
}
