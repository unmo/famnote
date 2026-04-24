import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ja from './locales/ja.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en',
    interpolation: {
      // Reactは自動的にXSSエスケープするため不要
      escapeValue: false,
    },
    resources: {
      en: {
        translation: en,
      },
      ja: {
        translation: ja,
      },
    },
  });

export default i18n;
