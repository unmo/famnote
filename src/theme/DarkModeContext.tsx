/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

// SkillSyncと同じダーク/ライト/システムテーマ管理
type DarkMode = 'dark' | 'light' | 'system';

type DarkModeProviderProps = {
  children: React.ReactNode;
  defaultMode?: DarkMode;
  storageKey?: string;
};

type DarkModeProviderState = {
  theme: DarkMode;
  setTheme: (theme: DarkMode) => void;
};

const initialState: DarkModeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const DarkModeProviderContext = createContext<DarkModeProviderState>(initialState);

export function DarkModeProvider({
  children,
  defaultMode = 'system',
  storageKey = 'famnote-ui-theme',
  ...props
}: DarkModeProviderProps) {
  const [theme, setTheme] = useState<DarkMode>(
    () => (localStorage.getItem(storageKey) as DarkMode) || defaultMode
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: DarkMode) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <DarkModeProviderContext.Provider {...props} value={value}>
      {children}
    </DarkModeProviderContext.Provider>
  );
}

export const useDarkMode = () => {
  const context = useContext(DarkModeProviderContext);
  if (context === undefined)
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  return context;
};
