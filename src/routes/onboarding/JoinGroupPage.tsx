import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { joinGroup } from '@/lib/firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { normalizeInviteCode } from '@/lib/utils/inviteCode';

// グループ参加ページ（オンボーディング 2/3）
// 6マス個別入力フィールドで招待コードを入力する
export function JoinGroupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { firebaseUser } = useAuthStore();
  const [codes, setCodes] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
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

  const handleJoin = async () => {
    const code = normalizeInviteCode(codes.join(''));
    if (code.length !== 6) {
      toast.error('招待コードを6文字入力してください');
      return;
    }
    if (!firebaseUser) return;

    setIsLoading(true);
    try {
      await joinGroup(firebaseUser.uid, code);
      toast.success('グループに参加しました！');
      navigate('/dashboard');
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === 'INVALID_CODE') {
        toast.error(t('onboarding.invalidCode'));
      } else if (msg === 'GROUP_FULL') {
        toast.error(t('onboarding.groupFull'));
      } else {
        toast.error('グループへの参加に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = codes.every((c) => c.length === 1);

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
            {t('onboarding.joinGroup')}
          </h2>
          <p className="text-zinc-400 text-sm mb-8">
            家族から受け取った招待コードを入力してください
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
                aria-label={`招待コード ${i + 1}文字目`}
              />
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleJoin}
            disabled={!isComplete || isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? '参加中...' : t('onboarding.joinGroupButton')}
          </motion.button>
        </div>

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
