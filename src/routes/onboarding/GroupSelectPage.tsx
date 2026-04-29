import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Users, Plus } from 'lucide-react';

// グループ作成 or 参加を選択するページ（オンボーディング 2/3）
export function GroupSelectPage() {
  const { t } = useTranslation();

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
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === 2
                  ? 'bg-[var(--color-brand-primary)] text-white'
                  : step < 2
                  ? 'bg-[color-mix(in_srgb,var(--color-brand-primary)_50%,transparent)] text-zinc-300'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-zinc-50 mb-2">
            {t('onboarding.groupSelectTitle')}
          </h2>
          <p className="text-zinc-400 text-sm mb-8">
            {t('onboarding.groupSelectHint')}
          </p>

          <div className="flex flex-col gap-3">
            <Link to="/onboarding/create-group">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 bg-zinc-800 border border-zinc-700 hover:border-[var(--color-brand-primary)] rounded-2xl p-5 cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-primary)]/15 flex items-center justify-center flex-shrink-0">
                  <Plus size={22} className="text-[var(--color-brand-primary)]" />
                </div>
                <div>
                  <p className="text-zinc-50 font-semibold">{t('onboarding.createGroupButton')}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{t('onboarding.createGroupHint')}</p>
                </div>
              </motion.div>
            </Link>

            <Link to="/onboarding/join-group">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 bg-zinc-800 border border-zinc-700 hover:border-blue-500 rounded-2xl p-5 cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <Users size={22} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-zinc-50 font-semibold">{t('onboarding.joinGroup')}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{t('onboarding.enterInviteHint')}</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
