import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';

interface ProtectedRouteProps {
  requireGroup?: boolean;
  requireProfile?: boolean;
}

// 認証ガード・オンボーディングガード・プロフィール選択ガード
export function ProtectedRoute({ requireGroup = false, requireProfile = false }: ProtectedRouteProps) {
  const { firebaseUser, userProfile, isLoading, isInitialized } = useAuthStore();
  const activeProfile = useProfileStore((s) => s.activeProfile);

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

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireGroup && !userProfile?.groupId) {
    return <Navigate to="/onboarding/profile" replace />;
  }

  // グループ不要ページ（オンボーディング）でグループ参加済みの場合はプロフィール選択またはダッシュボードへ
  if (!requireGroup && userProfile?.groupId) {
    return <Navigate to={activeProfile ? '/dashboard' : '/select-profile'} replace />;
  }

  // プロフィール選択が必要なページでプロフィール未選択の場合は選択画面へ
  if (requireProfile && !activeProfile) {
    return <Navigate to="/select-profile" replace />;
  }

  return <Outlet />;
}
