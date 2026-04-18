import { useAuthStore } from '@/store/authStore';
import { signInWithGoogle, logout } from '@/lib/firebase/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// 認証操作のカスタムフック（Googleログインのみ）
export function useAuth() {
  const { firebaseUser, userProfile, isLoading, isInitialized } = useAuthStore();
  const navigate = useNavigate();

  // Googleログイン
  const loginWithGoogle = async () => {
    await signInWithGoogle();
    // ナビゲーションはLoginPageのuseEffectで処理
  };

  // ログアウト
  const logOut = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('ログアウトしました');
    } catch {
      toast.error('ログアウトに失敗しました');
    }
  };

  return {
    user: firebaseUser,
    userProfile,
    isLoading,
    isInitialized,
    isAuthenticated: !!firebaseUser,
    hasGroup: !!userProfile?.groupId,
    loginWithGoogle,
    logOut,
  };
}
