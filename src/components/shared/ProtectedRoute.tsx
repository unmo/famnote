import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  requireGroup?: boolean;
}

// 認証ガード・オンボーディングガードコンポーネント
export function ProtectedRoute({ requireGroup = false }: ProtectedRouteProps) {
  const { firebaseUser, userProfile, isLoading, isInitialized } = useAuthStore();

  // 初期化が完了するまでローディング表示
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合はログインページへ
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // グループ参加が必要なページで未参加の場合はオンボーディングへ
  if (requireGroup && !userProfile?.groupId) {
    return <Navigate to="/onboarding/profile" replace />;
  }

  // グループ不要ページ（オンボーディング）でグループ参加済みの場合はダッシュボードへ
  if (!requireGroup && userProfile?.groupId) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
