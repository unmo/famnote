import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { ParentRole } from '@/types/group';

interface RoleSelectorProps {
  value: ParentRole;
  onChange: (value: ParentRole) => void;
  disabled?: boolean;
}

interface RoleOption {
  value: ParentRole;
  icon: string | null;
  labelKey: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { value: 'father', icon: '👨', labelKey: 'profile.parentRoleFather' },
  { value: 'mother', icon: '👩', labelKey: 'profile.parentRoleMother' },
  { value: null, icon: null, labelKey: 'profile.parentRoleNone' },
];

/**
 * 父 / 母 / 設定しない の 3 択トグルボタングループ
 * モバイルは縦並び、sm以上は横並び
 */
export function RoleSelector({ value, onChange, disabled = false }: RoleSelectorProps) {
  const { t } = useTranslation();

  return (
    <div
      role="radiogroup"
      aria-label={t('profile.parentRole')}
      className={`flex flex-col sm:flex-row gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {ROLE_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <motion.button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={t(option.labelKey)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.1 }}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`rounded-xl px-4 py-3 w-full flex-1 flex items-center gap-2 justify-center min-h-[44px] transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]
              focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900
              ${isSelected
                ? 'bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:border-zinc-600 hover:text-zinc-200'
              }`}
          >
            {option.icon && <span aria-hidden="true">{option.icon}</span>}
            <span className="text-sm font-medium">{t(option.labelKey)}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
