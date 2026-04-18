import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type Theme, THEMES, DEFAULT_THEME } from './themes';

// localStorageのキー
const STORAGE_KEY = 'famnote_theme';

interface ThemeContextValue {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    // localStorageから復元、なければデフォルトテーマ
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return THEMES.find((t) => t.id === stored) ?? DEFAULT_THEME;
    } catch {
      // localStorageが利用不可な場合はデフォルトテーマにフォールバック
      return DEFAULT_THEME;
    }
  });

  // テーマ変更時にCSS変数を更新し、localStorageに保存
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-brand-primary', currentTheme.primary);
    root.style.setProperty('--color-brand-secondary', currentTheme.secondary);
    try {
      localStorage.setItem(STORAGE_KEY, currentTheme.id);
    } catch {
      // localStorageへの書き込み失敗は無視（プライベートブラウジング等）
    }
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = THEMES.find((t) => t.id === themeId);
    // 存在しないIDを設定しても現在のテーマを保持する
    if (theme) setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
}
