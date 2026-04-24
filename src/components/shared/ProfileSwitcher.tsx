import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, Crown, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import type { GroupMember } from '@/types/group';

// ヘッダー内プロフィール切り替えUI
export function ProfileSwitcher() {
  const { activeProfile, members, setActiveProfile } = useActiveProfile();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 外側クリックで閉じる
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Escapeキーで閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (member: GroupMember) => {
    setActiveProfile(member);
    setIsOpen(false);
  };

  const handleSwitchAll = () => {
    setIsOpen(false);
    navigate('/select-profile');
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`現在のプロフィール: ${activeProfile?.displayName ?? '未選択'}。クリックして切り替え`}
        className="flex items-center gap-2 px-2 py-1.5 min-h-[44px] rounded-lg hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
      >
        {/* アバター */}
        <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center flex-shrink-0">
          {activeProfile?.avatarUrl ? (
            <img src={activeProfile.avatarUrl} alt={activeProfile.displayName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-zinc-400" />
          )}
        </div>
        <span className="text-sm font-medium text-zinc-100 hidden sm:block max-w-[80px] truncate">
          {activeProfile?.displayName ?? '選択中'}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="listbox"
            aria-label="プロフィールを選択"
            className="absolute right-0 top-full mt-2 w-48 max-w-[calc(100vw-2rem)] bg-zinc-900 rounded-xl shadow-xl shadow-black/40 border border-zinc-800 overflow-hidden z-50"
          >
            <div className="p-1">
              {members.map((member) => (
                <button
                  key={member.uid}
                  onClick={() => handleSelect(member)}
                  role="option"
                  aria-selected={activeProfile?.uid === member.uid}
                  aria-label={`${member.displayName}${member.role === 'owner' ? '（管理者）' : ''}に切り替え`}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-150 ${
                    activeProfile?.uid === member.uid
                      ? 'bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] text-[var(--color-brand-primary)]'
                      : 'hover:bg-zinc-800 text-zinc-200'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                    {member.role === 'owner' && (
                      <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5">
                        <Crown className="w-2.5 h-2.5 text-amber-900" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{member.displayName}</p>
                    {member.role === 'owner' && (
                      <p className="text-[10px] text-amber-500">管理者</p>
                    )}
                  </div>
                  {activeProfile?.uid === member.uid && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-[var(--color-brand-primary)]" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-zinc-800 p-1">
              <button
                onClick={handleSwitchAll}
                className="w-full text-center text-xs text-zinc-400 hover:text-zinc-200 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors duration-150 flex items-center justify-center gap-1.5"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                プロフィール選択画面へ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
