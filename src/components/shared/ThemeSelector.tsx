import { Palette, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function ThemeSelector() {
  const userProfile = useAuthStore((s) => s.userProfile);
  const navigate = useNavigate();
  const location = useLocation();

  const themesUnlocked = userProfile?.subscriptionStatus === 'premium';
  const isActive = location.pathname === '/theme';

  return (
    <button
      onClick={() => navigate('/theme')}
      className={`relative p-2 rounded-full transition-colors ${
        isActive
          ? 'bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] text-[var(--color-brand-primary)]'
          : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800'
      }`}
      title="テーマを変更"
      aria-label="テーマを変更"
    >
      <Palette className="w-5 h-5" />
      {!themesUnlocked && (
        <Lock className="absolute bottom-0.5 right-0.5 w-3 h-3 text-zinc-400" />
      )}
    </button>
  );
}
