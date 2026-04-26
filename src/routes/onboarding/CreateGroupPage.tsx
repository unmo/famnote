import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Copy, Share2, CheckCircle } from 'lucide-react';
import { createGroupSchema, type CreateGroupSchema } from '@/lib/validations/groupSchema';
import { createGroup } from '@/lib/firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

// グループ作成ページ（オンボーディング 2/3）
export function CreateGroupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { firebaseUser, userProfile } = useAuthStore();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateGroupSchema>({
    resolver: zodResolver(createGroupSchema),
  });

  const onSubmit = async (data: CreateGroupSchema) => {
    if (!firebaseUser) return;
    // userProfile から displayName と avatarUrl を取得して createGroup に渡す
    // これにより、グループ作成直後からオーナーの名前が正しく表示される
    const displayName = userProfile?.displayName ?? firebaseUser.displayName ?? '';
    const avatarUrl = userProfile?.avatarUrl ?? null;
    try {
      const result = await createGroup(firebaseUser.uid, data.groupName, null, displayName, avatarUrl);
      setInviteCode(result.inviteCode);
    } catch (err) {
      console.error('グループ作成エラー:', err);
      toast.error('グループの作成に失敗しました');
    }
  };

  const copyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setIsCopied(true);
      toast.success(t('onboarding.inviteCodeCopied'));
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('コピーに失敗しました');
    }
  };

  const shareCode = async () => {
    if (!inviteCode) return;
    if (navigator.share) {
      await navigator.share({
        title: 'FamNoteグループへの招待',
        text: `FamNoteに参加してください！招待コード: ${inviteCode}`,
      });
    } else {
      await copyCode();
    }
  };

  // 招待コード表示画面
  if (inviteCode) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* ステップインジケーター */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step <= 3
                    ? 'bg-[var(--color-brand-primary)] text-white'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {step <= 2 ? <CheckCircle size={16} /> : step}
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[color-mix(in_srgb,var(--color-brand-primary)_15%,transparent)] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-xl font-semibold text-zinc-50 mb-2">グループを作成しました！</h2>
            <p className="text-zinc-400 text-sm mb-8">
              家族に招待コードを共有しましょう
            </p>

            {/* 招待コード表示 */}
            <div className="bg-zinc-800 rounded-2xl p-6 mb-6">
              <p className="text-zinc-400 text-xs mb-2">{t('onboarding.inviteCode')}</p>
              <p className="text-4xl font-mono font-bold text-zinc-50 tracking-widest">
                {inviteCode}
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={copyCode}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                {isCopied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                {isCopied ? 'コピー済み' : t('common.copy')}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={shareCode}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                {t('onboarding.inviteCodeShare')}
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="btn-primary w-full mt-4"
            >
              {t('onboarding.toDashboard')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* ステップインジケーター */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === 1
                  ? 'bg-[color-mix(in_srgb,var(--color-brand-primary)_50%,transparent)] text-zinc-300'
                  : step === 2
                  ? 'bg-[var(--color-brand-primary)] text-white'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {step === 1 ? <CheckCircle size={16} /> : step}
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-zinc-50 mb-2">
            {t('onboarding.createGroup')}
          </h2>
          <p className="text-zinc-400 text-sm mb-6">家族グループを作成してください</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">
                {t('onboarding.groupName')}
              </label>
              <input
                {...register('groupName')}
                type="text"
                placeholder={t('onboarding.groupNamePlaceholder')}
                className="input-base"
                aria-invalid={!!errors.groupName}
              />
              {errors.groupName && (
                <p className="text-red-500 text-xs">{errors.groupName.message}</p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? '作成中...' : t('onboarding.createGroupButton')}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-400 mt-4">
          <Link
            to="/onboarding/join-group"
            className="text-[var(--color-brand-primary)] hover:underline"
          >
            {t('onboarding.joinGroupLink')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
