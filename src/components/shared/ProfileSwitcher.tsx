import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, Crown } from 'lucide-react';
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
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
      >
        {/* アバター */}
        <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center flex-shrink-0">
          {activeProfile?.avatarUrl ? (
            <img src={activeProfile.avatarUrl} alt={activeProfile.displayName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-zinc-400" />
          )}
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:block max-w-[80px] truncate">
          {activeProfile?.displayName ?? '選択中'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-zinc-700 overflow-hidden z-50"
          >
            <div className="p-1">
              {members.map((member) => (
                <button
                  key={member.uid}
                  onClick={() => handleSelect(member)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeProfile?.uid === member.uid
                      ? 'bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] text-[var(--color-brand-primary)]'
                      : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200'
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
            <div className="border-t border-gray-200 dark:border-zinc-700 p-1">
              <button
                onClick={handleSwitchAll}
                className="w-full text-center text-xs text-zinc-400 hover:text-zinc-200 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                プロフィール選択画面へ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
