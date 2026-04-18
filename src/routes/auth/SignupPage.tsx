import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { signupSchema, type SignupSchema } from '@/lib/validations/profileSchema';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { useAuth } from '@/hooks/useAuth';

// パスワード強度インジケーター
function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;

  const colors = ['bg-zinc-700', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="flex gap-1 mt-1" role="progressbar" aria-valuenow={strength} aria-valuemax={4}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < strength ? colors[strength] : 'bg-zinc-700'
          }`}
        />
      ))}
    </div>
  );
}

// サインアップページ
export function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUp, loginWithGoogle, isAuthenticated, userProfile } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
  });

  const passwordValue = watch('password', '');

  // 認証済みの場合はリダイレクト
  if (isAuthenticated) {
    const target = userProfile?.groupId ? '/dashboard' : '/onboarding/profile';
    navigate(target, { replace: true });
    return null;
  }

  const onSubmit = async (data: SignupSchema) => {
    try {
      await signUp(data.email, data.password, data.displayName);
    } catch {
      // エラーはuseAuth内でトースト表示
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-8">
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
          <h2 className="text-xl font-semibold text-zinc-50 mb-6">{t('auth.signup')}</h2>

          {/* Googleサインアップ */}
          <GoogleAuthButton
            onClick={handleGoogleSignup}
            isLoading={isGoogleLoading}
            label={t('auth.signupWithGoogle')}
          />

          <div className="flex items-center gap-4 my-6 text-zinc-500 text-sm">
            <div className="flex-1 h-px bg-zinc-800" />
            {t('auth.or')}
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* 名前 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">{t('auth.displayName')}</label>
              <input
                {...register('displayName')}
                type="text"
                autoComplete="name"
                placeholder="田中 太郎"
                className="input-base"
                aria-invalid={!!errors.displayName}
              />
              {errors.displayName && (
                <p className="text-red-500 text-xs">{errors.displayName.message}</p>
              )}
            </div>

            {/* メール */}
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

            {/* パスワード */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">{t('auth.password')}</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
              {passwordValue && <PasswordStrengthBar password={passwordValue} />}
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            {/* パスワード確認 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="input-base pr-12"
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  aria-label={showConfirm ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* 利用規約同意 */}
            <div className="flex items-start gap-3">
              <input
                {...register('agreeToTerms')}
                type="checkbox"
                id="agreeToTerms"
                className="w-4 h-4 mt-0.5 accent-[var(--color-brand-primary)]"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-zinc-400">
                {t('auth.agreeToTerms')}
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-500 text-xs -mt-2">{errors.agreeToTerms.message}</p>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
            >
              {isSubmitting ? '処理中...' : t('auth.signup')}
            </motion.button>
          </form>
        </div>

        {/* ログインリンク */}
        <p className="text-center text-sm text-zinc-400 mt-6">
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" className="text-[var(--color-brand-primary)] hover:underline font-medium">
            {t('auth.login')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
