import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { useThemeContext } from '@/theme/ThemeContext';
import { useAuthStore } from '@/store/authStore';

function ThemeSelector() {
  const { t } = useTranslation();
  const { currentTheme, setTheme, themes } = useThemeContext();
  const { userProfile } = useAuthStore();
  const isPremium = userProfile?.subscriptionStatus !== 'free';
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleThemeClick = (themeId: string, isPremiumTheme: boolean) => {
    if (isPremiumTheme && !isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    setTheme(themeId);
  };

  return (
    <div>
      <h3 className="text-zinc-300 font-medium mb-3">{t('settings.themeSelect')}</h3>
      <div className="grid grid-cols-5 gap-3">
        {themes.map((theme) => {
          const isSelected = currentTheme.id === theme.id;
          const isLocked = theme.isPremium && !isPremium;
          return (
            <motion.button
              key={theme.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleThemeClick(theme.id, theme.isPremium)}
              title={theme.name}
              aria-label={`テーマ: ${theme.name}${isLocked ? '（プレミアム）' : ''}`}
              className="relative flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-10 h-10 rounded-full transition-all ${
                  isSelected ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: theme.primary }}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check size={16} className="text-white drop-shadow" />
                  </div>
                )}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <Lock size={12} className="text-white" />
                  </div>
                )}
              </div>
              <span className="text-[9px] text-zinc-500 truncate w-full text-center">
                {theme.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {showUpgradeModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <p className="text-2xl text-center mb-3">🔒</p>
            <h3 className="text-zinc-50 font-bold text-center mb-2">{t('settings.premiumRequired')}</h3>
            <p className="text-zinc-400 text-sm text-center mb-6">
              プレミアムプランにアップグレードすると全20種類のテーマが使えます
            </p>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="btn-secondary w-full"
            >
              {t('common.close')}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-zinc-50">{t('settings.title')}</h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <h2 className="text-zinc-50 font-semibold mb-4 flex items-center gap-2">
          <span className="text-lg">🎨</span>
          {t('settings.theme')}
        </h2>
        <ThemeSelector />
      </motion.div>
    </div>
  );
}
