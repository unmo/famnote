import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Check, Lock } from 'lucide-react';
import { useThemeContext } from '@/theme/ThemeContext';
import { useAuthStore } from '@/store/authStore';

export function ThemePage() {
  const { t } = useTranslation();
  const { currentTheme, setTheme, themes } = useThemeContext();
  const { userProfile } = useAuthStore();
  const isPremium = userProfile?.subscriptionStatus !== 'free';
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">{t('settings.theme')}</h1>
        <p className="text-zinc-400 text-sm mt-1">{t('settings.themeDesc')}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <h2 className="text-zinc-300 font-medium mb-5">{t('settings.themeSelect')}</h2>
        <div className="grid grid-cols-5 gap-4">
          {themes.map((theme) => {
            const isSelected = currentTheme.id === theme.id;
            const isLocked = theme.isPremium && !isPremium;
            return (
              <motion.button
                key={theme.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (isLocked) { setShowUpgradeModal(true); return; }
                  setTheme(theme.id);
                }}
                title={theme.name}
                aria-label={t('settings.themeAriaLabel', { name: theme.name }) + (isLocked ? ` (${t('settings.themeLocked')})` : '')}
                className="relative flex flex-col items-center gap-2"
              >
                <div
                  className={`w-12 h-12 rounded-full transition-all ${
                    isSelected ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: theme.primary }}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={18} className="text-white drop-shadow" />
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <Lock size={13} className="text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 truncate w-full text-center">{theme.name}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowUpgradeModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <p className="text-2xl text-center mb-3">🔒</p>
            <h3 className="text-zinc-50 font-bold text-center mb-2">{t('settings.premiumRequired')}</h3>
            <p className="text-zinc-400 text-sm text-center mb-6">{t('common.premiumUpgradeDesc')}</p>
            <button onClick={() => setShowUpgradeModal(false)} className="btn-secondary w-full">{t('common.close')}</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
