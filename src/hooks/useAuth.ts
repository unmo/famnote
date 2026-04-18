import { useAuthStore } from '@/store/authStore';
import { signInWithEmail, signInWithGoogle, signUpWithEmail, logout } from '@/lib/firebase/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// 認証操作のカスタムフック
export function useAuth() {
  const { firebaseUser, userProfile, isLoading, isInitialized } = useAuthStore();
  const navigate = useNavigate();

  // Googleログイン
  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
      // ナビゲーションはAuthContextで処理
    } catch {
      toast.error('Googleログインに失敗しました');
    }
  };

  // メール/パスワードログイン
  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        toast.error('メールアドレスまたはパスワードが正しくありません');
      } else {
        toast.error('通信に失敗しました。再試行してください');
      }
      throw error;
    }
  };

  // メール/パスワードサインアップ
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      await signUpWithEmail(email, password, displayName);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'auth/email-already-in-use') {
        toast.error('このメールアドレスはすでに使用されています');
      } else {
        toast.error('アカウント作成に失敗しました');
      }
      throw error;
    }
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
    loginWithEmail,
    signUp,
    logOut,
  };
}
