import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { joinGroup } from '@/lib/firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { normalizeInviteCode } from '@/lib/utils/inviteCode';
import { RoleSelector } from '@/components/shared/RoleSelector';
import type { ParentRole } from '@/types/group';

// ステップ間スライドアニメーションの variants
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' as const },
  }),
};

// グループ参加ページ（オンボーディング 2/3）
// 6マス個別入力フィールドで招待コードを入力し、役割選択ステップへ進む
export function JoinGroupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { firebaseUser, userProfile } = useAuthStore();
  const [codes, setCodes] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'invite' | 'role'>('invite');
  const [selectedRole, setSelectedRole] = useState<ParentRole>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // 英数字以外を拒否
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const char = sanitized.slice(-1);

    const newCodes = [...codes];
    newCodes[index] = char;
    setCodes(newCodes);

    // 次のフィールドに自動フォーカス
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // バックスペースで前のフィールドに戻る
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\s/g, '').toUpperCase();
    const chars = pasted.replace(/[^A-Z0-9]/g, '').slice(0, 6).split('');
    const newCodes = Array(6).fill('');
    chars.forEach((c, i) => { newCodes[i] = c; });
    setCodes(newCodes);
    // 最後の入力フィールドにフォーカス
    const lastIndex = Math.min(chars.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  // 招待コードを検証して役割選択ステップへ進む
  // 実際の Firestore 書き込みは役割確定時に行う
  const handleInviteNext = async () => {
    const code = normalizeInviteCode(codes.join(''));
    if (code.length !== 6) {
      toast.error(t('onboarding.inviteCodeLengthError'));
      return;
    }
    if (!firebaseUser) return;

    setIsLoading(true);
    try {
      // コード検証のため仮参加（parentRole: null）
      // 役割選択後に updateMemberParentRole で更新する設計も可能だが、
      // ここでは役割選択画面に遷移して最終的に joinGroup を呼ぶ
      setIsLoading(false);
      setStep('role');
    } catch {
      toast.error(t('onboarding.joinFailed'));
      setIsLoading(false);
    }
  };

  // 役割を確定してグループ参加を完了する
  const handleRoleConfirm = async (role: ParentRole) => {
    const code = normalizeInviteCode(codes.join(''));
    if (!firebaseUser) return;

    setIsLoading(true);
    const displayName = userProfile?.displayName ?? firebaseUser.displayName ?? '';
    const avatarUrl = userProfile?.avatarUrl ?? null;
    try {
      await joinGroup(firebaseUser.uid, code, displayName, avatarUrl, role);
      toast.success(t('onboarding.joinSuccess'));
      navigate('/dashboard');
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === 'INVALID_CODE') {
        toast.error(t('onboarding.invalidCode'));
        // 招待コードが無効になった場合は invite ステップに戻る
        setStep('invite');
      } else if (msg === 'GROUP_FULL') {
        toast.error(t('onboarding.groupFull'));
        setStep('invite');
      } else {
        toast.error(t('onboarding.joinFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = codes.every((c) => c.length === 1);
  // invite ステップはステップ2、role ステップはステップ3として扱う
  const currentStep = step === 'invite' ? 2 : 3;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden"
      >
        {/* ステップインジケーター */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                s < currentStep
                  ? 'bg-[color-mix(in_srgb,var(--color-brand-primary)_50%,transparent)] text-zinc-300'
                  : s === currentStep
                  ? 'bg-[var(--color-brand-primary)] text-white'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {s < currentStep ? <CheckCircle size={16} /> : s}
            </div>
          ))}
        </div>

        {/* ステップコンテンツ（AnimatePresence でスライドアニメーション） */}
        <AnimatePresence mode="wait" custom={step === 'role' ? 1 : -1}>
          {step === 'invite' ? (
            <motion.div
              key="invite"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
            >
              <h2 className="text-xl font-semibold text-zinc-50 mb-2">
                {t('onboarding.joinGroup')}
              </h2>
              <p className="text-zinc-400 text-sm mb-8">
                {t('onboarding.enterInviteHint')}
              </p>

              {/* 6マス入力フィールド */}
              <div className="flex gap-2 justify-center mb-8" onPaste={handlePaste}>
                {codes.map((code, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={code}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-mono font-bold rounded-xl
                               bg-zinc-800 border border-zinc-700 text-zinc-50
                               focus:outline-none focus:border-[var(--color-brand-primary)]
                               focus:ring-1 focus:ring-[var(--color-brand-primary)]
                               transition-colors"
                    aria-label={t('onboarding.inviteCodeCharLabel', { num: i + 1 })}
                  />
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleInviteNext}
                disabled={!isComplete || isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? t('onboarding.joining') : t('onboarding.next')}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="role"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
            >
              <h2 className="text-xl font-semibold text-zinc-50 mb-2">
                {t('onboarding.selectParentRole')}
              </h2>
              <p className="text-zinc-400 text-sm mb-8">
                {t('onboarding.selectParentRoleHint')}
              </p>

              {/* 役割選択 */}
              <div className="mb-8">
                <RoleSelector
                  value={selectedRole}
                  onChange={setSelectedRole}
                  disabled={isLoading}
                />
              </div>

              {/* 次へボタン */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleConfirm(selectedRole)}
                disabled={isLoading}
                className="btn-primary w-full mb-3"
              >
                {isLoading ? t('onboarding.joining') : t('onboarding.next')}
              </motion.button>

              {/* スキップボタン（parentRole: null で参加） */}
              <button
                type="button"
                onClick={() => handleRoleConfirm(null)}
                disabled={isLoading}
                className="w-full text-center text-sm text-zinc-500 hover:text-zinc-300
                           transition-colors py-2 min-h-[44px] flex items-center justify-center
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('onboarding.skipRole')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-sm text-zinc-400 mt-4">
          <Link
            to="/onboarding/create-group"
            className="text-[var(--color-brand-primary)] hover:underline"
          >
            {t('onboarding.createGroupLink')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
