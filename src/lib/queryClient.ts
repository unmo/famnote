import { QueryClient } from '@tanstack/react-query';

// TanStack Queryクライアントの設定
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5分間キャッシュを保持
      staleTime: 5 * 60 * 1000,
      // エラー時に1回リトライ
      retry: 1,
      // ウィンドウフォーカス時は再取得しない（Firestoreはリアルタイム更新のため）
      refetchOnWindowFocus: false,
    },
    mutations: {
      // ミューテーションエラーはコンポーネント側でハンドリング
      retry: 0,
    },
  },
});
