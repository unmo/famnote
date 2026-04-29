import { useTranslation } from 'react-i18next';
import type { ParentRole } from '@/types/group';

interface RoleBadgeProps {
  parentRole: ParentRole | undefined;
  className?: string;
}

/**
 * 保護者の役割（父/母）を示す小型バッジ
 * parentRole が null/undefined の場合は何も表示しない
 */
export function RoleBadge({ parentRole, className }: RoleBadgeProps) {
  const { t } = useTranslation();

  if (!parentRole) return null;

  const isFather = parentRole === 'father';

  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border inline-flex items-center leading-none ${
        isFather
          ? 'bg-blue-500/20 text-blue-400 border-blue-800/50'
          : 'bg-pink-500/20 text-pink-400 border-pink-800/50'
      } ${className ?? ''}`}
    >
      {isFather ? t('profile.parentRoleFather') : t('profile.parentRoleMother')}
    </span>
  );
}
