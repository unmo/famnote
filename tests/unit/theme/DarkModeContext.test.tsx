import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DarkModeProvider, useDarkMode } from '@/theme/DarkModeContext';

// jsdomにはwindow.matchMediaが存在しないためモックを設定
const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: query === '(prefers-color-scheme: dark)',
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

const resetStorage = () => {
  localStorage.clear();
  vi.clearAllMocks();
  // 毎回matchMediaモックを再設定
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });
};

describe('DarkModeProvider', () => {
  beforeEach(resetStorage);

  it('正常系: デフォルトはsystemモード', () => {
    const { result } = renderHook(() => useDarkMode(), {
      wrapper: ({ children }) => <DarkModeProvider>{children}</DarkModeProvider>,
    });
    expect(result.current.theme).toBe('system');
  });

  it('正常系: setTheme("dark")でdarkモードに切り替わる', () => {
    const { result } = renderHook(() => useDarkMode(), {
      wrapper: ({ children }) => <DarkModeProvider>{children}</DarkModeProvider>,
    });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('famnote-ui-theme', 'dark');
  });

  it('正常系: setTheme("light")でlightモードに切り替わる', () => {
    const { result } = renderHook(() => useDarkMode(), {
      wrapper: ({ children }) => <DarkModeProvider>{children}</DarkModeProvider>,
    });

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
  });

  it('正常系: localStorageからテーマが復元される', () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('dark');

    const { result } = renderHook(() => useDarkMode(), {
      wrapper: ({ children }) => <DarkModeProvider>{children}</DarkModeProvider>,
    });

    expect(result.current.theme).toBe('dark');
  });

  it('正常系: Provider内でuseThemeが正常に動作する', () => {
    const { result } = renderHook(() => useDarkMode(), {
      wrapper: ({ children }) => <DarkModeProvider>{children}</DarkModeProvider>,
    });
    // setTheme関数が存在することを確認
    expect(typeof result.current.setTheme).toBe('function');
  });
});
