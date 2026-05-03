import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Share2, Heart, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const FEATURE_BADGE_CONFIGS = [
  { icon: ClipboardList, key: 'auth.featureBadgeGrowth' },
  { icon: Share2, key: 'auth.featureBadgeFamily' },
  { icon: Heart, key: 'auth.featureBadgeCheer' },
] as const;

// ログインページ（Googleログインのみ・1画面完結）
export function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle, user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 認証済みの場合はリダイレクト
  useEffect(() => {
    if (user) {
      const target = userProfile?.groupId ? '/dashboard' : '/onboarding/profile';
      navigate(target, { replace: true });
    }
  }, [user, userProfile, navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      // ポップアップをユーザーが閉じた場合は静かに失敗
      const code = (err as { code?: string }).code;
      if (code === 'auth/popup-closed-by-user') {
        setIsLoading(false);
        return;
      }
      const message = t('auth.loginFailed');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.main
      role="main"
      aria-label={t('auth.loginPageAriaLabel')}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 text-white"
    >
      {/* 背景レイヤー */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* フィールドグリッドSVGパターン */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3Ccircle cx='30' cy='30' r='10'/%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* グロー1: ブランドオレンジ（左上） */}
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[160px] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(232,85,19,0.25) 0%, transparent 70%)',
            animationDuration: '6000ms',
          }}
        />

        {/* グロー2: ネイビー（右下） */}
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(0,19,63,0.4) 0%, transparent 70%)',
            animationDuration: '8000ms',
            animationDelay: '2s',
          }}
        />

        {/* グロー3: グリーン（中央下） */}
        <div
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)' }}
        />

        {/* ノイズオーバーレイ */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg px-4 sm:px-6 flex flex-col items-center">
        {/* グラスカード */}
        <div className="backdrop-blur-3xl bg-white/[0.04] border border-white/[0.09] p-8 sm:p-10 w-full rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500">

          {/* カード上部アクセントライン（ブランドカラーグラデーション） */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, var(--color-brand-primary), rgba(251,191,36,0.8), transparent)',
            }}
          />

          {/* カード内シャインオーバーレイ（ホバー時） */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* カード底部グロー（ホバー時に強調） */}
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'var(--color-brand-primary)' }}
          />

          {/* ブランドロゴブロック */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              {/* ブランドアイコン */}
              <div className="transform group-hover:scale-105 transition-transform duration-500" style={{ filter: 'drop-shadow(0 8px 16px rgba(14,165,233,0.35))' }}>
                <img src="/favicon.svg" alt="FamNote" className="w-14 h-14 rounded-2xl" />
              </div>

              {/* ブランド名 */}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">FamNote</h1>
                <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase">
                  Family Sports Record
                </p>
              </div>
            </div>

            {/* ONLINEバッジ */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
              <span className="text-[10px] font-semibold text-green-400 tracking-wide">ONLINE</span>
            </div>
          </div>

          {/* ヘッドライン・サブタイトル */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-[2.5rem] font-extrabold tracking-tight leading-[1.15] mb-4">
              <span className="block text-white">家族の記録を、</span>
              <span
                className="block text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, var(--color-brand-primary) 0%, #f97316 40%, #fbbf24 100%)',
                }}
              >
                ひとつの場所に。
              </span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base font-medium leading-relaxed">
              スポーツに励む子供の成長を、
              <br className="hidden sm:block" />
              家族みんなで記録・応援しよう
            </p>
          </div>

          {/* 機能バッジ行 */}
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {FEATURE_BADGE_CONFIGS.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 text-xs font-medium"
              >
                <Icon className="w-3 h-3" aria-hidden="true" />
                {t(key)}
              </div>
            ))}
          </div>

          {/* エラーバナー（AnimatePresenceで高さアニメーション） */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-md overflow-hidden"
              >
                <div className="flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium" role="alert" aria-live="assertive">
                    {error}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Googleログインボタン */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            onClick={handleLogin}
            disabled={isLoading}
            aria-busy={isLoading}
            aria-label={isLoading ? t('auth.loginProcessing') : t('auth.loginWithGoogle')}
            className="relative w-full flex items-center justify-center py-4 px-6 rounded-2xl font-semibold text-white text-base bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.10] hover:border-white/[0.22] transition-all duration-300 overflow-hidden group/btn hover:shadow-[0_0_40px_-8px_rgba(232,85,19,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            {/* シマーエフェクト */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent -translate-x-[200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none" />

            {/* ローディングスピナー or Googleアイコン */}
            {isLoading ? (
              <motion.svg
                className="w-5 h-5 mr-3 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                aria-hidden="true"
              >
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </motion.svg>
            ) : (
              <svg
                className="w-5 h-5 mr-3 flex-shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{isLoading ? t('auth.loggingIn') : t('auth.loginWithGoogle')}</span>
          </motion.button>

        </div>

        {/* フッター */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <p className="text-[10px] text-zinc-500 font-bold tracking-[0.25em] uppercase">
            家族の成長を、記録しよう。
          </p>
        </motion.div>
      </div>
    </motion.main>
  );
}
