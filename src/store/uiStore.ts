import { create } from 'zustand';

// UIの状態管理（ダークモード等）
interface UIState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
}

// localStorageからダークモード設定を読み込む
function getInitialDarkMode(): boolean {
  try {
    const stored = localStorage.getItem('famnote_dark_mode');
    if (stored !== null) return stored === 'true';
    // システム設定に従う
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return true; // デフォルトはダークモード
  }
}

export const useUIStore = create<UIState>((set) => ({
  isDarkMode: getInitialDarkMode(),

  toggleDarkMode: () =>
    set((state) => {
      const newVal = !state.isDarkMode;
      try {
        localStorage.setItem('famnote_dark_mode', String(newVal));
        // ダークモードクラスをHTMLに適用
        document.documentElement.classList.toggle('dark', newVal);
      } catch {
        // localStorageが利用不可な場合は無視
      }
      return { isDarkMode: newVal };
    }),

  setDarkMode: (dark) => {
    try {
      localStorage.setItem('famnote_dark_mode', String(dark));
      document.documentElement.classList.toggle('dark', dark);
    } catch {
      // 無視
    }
    set({ isDarkMode: dark });
  },
}));

// 初期化時にダークモードクラスを適用
const initDarkMode = getInitialDarkMode();
document.documentElement.classList.toggle('dark', initDarkMode);
