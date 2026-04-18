import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loginSchema, type LoginSchema } from '@/lib/validations/profileSchema';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { useAuth } from '@/hooks/useAuth';

// ログインページ
export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle, userProfile, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  // 認証済みの場合はリダイレクト
  if (isAuthenticated) {
    const target = userProfile?.groupId ? '/dashboard' : '/onboarding/profile';
    navigate(target, { replace: true });
    return null;
  }

  const onSubmit = async (data: LoginSchema) => {
    try {
      await loginWithEmail(data.email, data.password);
      // ナビゲーションはAuthContextで処理
    } catch {
      // エラーはuseAuth内でトースト表示
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* ロゴ */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-primary)] flex items-center justify-center">
            <span className="text-white font-extrabold text-2xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-50">FamNote</h1>
          <p className="text-zinc-500 text-sm">家族で成長を記録しよう</p>
        </div>

        {/* フォームカード */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-zinc-50 mb-6">{t('auth.login')}</h2>

          {/* Googleログイン */}
          <GoogleAuthButton
            onClick={handleGoogleLogin}
            isLoading={isGoogleLoading}
            label={t('auth.loginWithGoogle')}
          />

          <div className="flex items-center gap-4 my-6 text-zinc-500 text-sm">
            <div className="flex-1 h-px bg-zinc-800" />
            {t('auth.or')}
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* メール/パスワードフォーム */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">{t('auth.email')}</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                className="input-base"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">{t('auth.password')}</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-base pr-12"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
            >
              {isSubmitting ? '処理中...' : t('auth.login')}
            </motion.button>
          </form>
        </div>

        {/* サインアップリンク */}
        <p className="text-center text-sm text-zinc-400 mt-6">
          アカウントをお持ちでない方は{' '}
          <Link to="/signup" className="text-[var(--color-brand-primary)] hover:underline font-medium">
            {t('auth.signup')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
