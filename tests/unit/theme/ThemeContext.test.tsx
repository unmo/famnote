import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { ThemeProvider, useThemeContext } from '@/theme/ThemeContext';
import { DEFAULT_THEME, THEMES } from '@/theme/themes';

// localStorageをリセットするヘルパー
const resetStorage = () => {
  localStorage.clear();
  vi.clearAllMocks();
};

describe('ThemeProvider', () => {
  beforeEach(resetStorage);

  it('正常系: デフォルトテーマ（default）が適用される', () => {
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });
    expect(result.current.currentTheme.id).toBe('default');
    expect(result.current.currentTheme.primary).toBe('#0EA5E9');
  });

  it('正常系: setTheme呼び出しでテーマが変更される', () => {
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });

    act(() => {
      result.current.setTheme('kashima');
    });

    expect(result.current.currentTheme.id).toBe('kashima');
    expect(result.current.currentTheme.primary).toBe('#B30024');
  });

  it('正常系: setTheme呼び出しでlocalStorageにテーマIDが保存される', () => {
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });

    act(() => {
      result.current.setTheme('urawa');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('famnote_theme', 'urawa');
  });

  it('正常系: localStorageからテーマが復元される', () => {
    // あらかじめlocalStorageにテーマIDを設定
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('verdy');

    const { result } = renderHook(() => useThemeContext(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });

    expect(result.current.currentTheme.id).toBe('verdy');
  });

  it('異常系: 存在しないテーマIDを設定してもテーマが変わらない', () => {
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });

    const before = result.current.currentTheme.id;

    act(() => {
      result.current.setTheme('nonexistent_theme_id');
    });

    expect(result.current.currentTheme.id).toBe(before);
  });

  it('正常系: themes配列にすべてのテーマが含まれる', () => {
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });

    expect(result.current.themes).toHaveLength(THEMES.length);
    expect(result.current.themes.length).toBe(20);
  });
});

describe('useThemeContext (outside provider)', () => {
  it('異常系: ThemeProvider外でuseThemeContextを使用するとエラーが発生する', () => {
    // コンソールエラーを抑制
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useThemeContext());
    }).toThrow('useThemeContext must be used within ThemeProvider');

    consoleSpy.mockRestore();
  });
});

describe('DEFAULT_THEME', () => {
  it('正常系: デフォルトテーマはdefaultである', () => {
    expect(DEFAULT_THEME.id).toBe('default');
    expect(DEFAULT_THEME.isPremium).toBe(false);
  });
});
