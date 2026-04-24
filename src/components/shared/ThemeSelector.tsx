import { useState, useRef, useEffect } from 'react';
import { Palette, Check, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '@/theme/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { clsx } from 'clsx';

// SkillSyncのThemeSelectorと同等のチームカラー選択コンポーネント
export function ThemeSelector() {
  const { currentTheme, setTheme, themes } = useThemeContext();
  const userProfile = useAuthStore((s) => s.userProfile);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 有料プランかどうか（SkillSyncの themesUnlocked に相当）
  const themesUnlocked = userProfile?.subscriptionStatus === 'premium';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!themesUnlocked) {
    return (
      <button
        onClick={() => navigate('/settings')}
        className="relative p-2 rounded-full text-gray-400 hover:bg-zinc-800 transition-colors"
        title="有料プランでUIテーマを解放"
      >
        <Palette className="w-5 h-5" />
        <Lock className="absolute bottom-0.5 right-0.5 w-3 h-3 text-gray-400" />
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-600 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
        aria-label="カラーテーマを選択"
        title="応援するクラブを選択 (UIテーマ)"
      >
        <Palette className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-zinc-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-zinc-800/60 z-50 transform opacity-100 scale-100 transition-all origin-top-right">
          <div className="p-3 border-b border-zinc-800/60">
            <h3 className="text-sm font-bold text-zinc-50">
              カラーテーマを選択
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              選択したカラーがアプリのUIに適用されます
            </p>
          </div>
          <div className="py-1">
            {themes.map((team) => (
              <button
                key={team.id}
                onClick={() => {
                  setTheme(team.id);
                  setIsOpen(false);
                }}
                className={clsx(
                  'w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-zinc-800 transition-colors',
                  currentTheme.id === team.id
                    ? 'bg-[color-mix(in_srgb,var(--color-brand-primary)_15%,transparent)] font-bold text-[var(--color-brand-primary)]'
                    : 'text-zinc-300'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <span
                      className="w-3 h-5 rounded-sm shadow-sm"
                      style={{ backgroundColor: team.primary }}
                    />
                    <span
                      className="w-3 h-5 rounded-sm shadow-sm"
                      style={{ backgroundColor: team.secondary }}
                    />
                  </div>
                  <span>{team.name}</span>
                </div>
                {currentTheme.id === team.id && (
                  <Check className="w-4 h-4 text-[var(--color-brand-primary)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
