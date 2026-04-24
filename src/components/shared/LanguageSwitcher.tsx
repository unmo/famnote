import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

// SkillSyncと同じ言語切り替えコンポーネント
export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 rounded-lg transition-all flex items-center gap-2"
      title={i18n.language === 'en' ? 'Switch to Japanese' : 'Switch to English'}
    >
      <Globe className="w-5 h-5" />
      <span className="text-xs font-bold uppercase">{i18n.language}</span>
    </button>
  );
}
