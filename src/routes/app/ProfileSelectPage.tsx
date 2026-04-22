import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Crown, User } from 'lucide-react';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import type { GroupMember } from '@/types/group';

export function ProfileSelectPage() {
  const navigate = useNavigate();
  const { members, setActiveProfile } = useActiveProfile();

  const handleSelect = (member: GroupMember) => {
    setActiveProfile(member);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      {/* ロゴ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 flex items-center gap-2"
      >
        <img src="/favicon.svg" alt="FamNote" className="w-10 h-10" />
        <span className="text-2xl font-bold text-white tracking-wider">
          Fam<span className="text-[var(--color-brand-primary)]">Note</span>
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-2xl md:text-3xl font-bold text-white mb-2 text-center"
      >
        だれが使いますか？
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-zinc-400 mb-10 text-center text-sm"
      >
        プロフィールを選んでください
      </motion.p>

      {/* プロフィールグリッド */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex flex-wrap justify-center gap-6 max-w-2xl"
      >
        {members.map((member, i) => (
          <motion.button
            key={member.uid}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleSelect(member)}
            className="flex flex-col items-center gap-3 group focus:outline-none"
          >
            {/* アバター */}
            <div className="relative">
              <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-[var(--color-brand-primary)] transition-all duration-200 bg-zinc-800">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-zinc-500" />
                  </div>
                )}
              </div>
              {/* オーナーバッジ */}
              {member.role === 'owner' && (
                <div className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-1">
                  <Crown className="w-3 h-3 text-amber-900" />
                </div>
              )}
            </div>
            {/* 名前 */}
            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
              {member.displayName}
            </span>
            {member.role === 'owner' && (
              <span className="text-[10px] text-amber-400 -mt-2">管理者</span>
            )}
          </motion.button>
        ))}
      </motion.div>

      {members.length === 0 && (
        <p className="text-zinc-500 text-sm mt-4">メンバーを読み込み中...</p>
      )}
    </div>
  );
}
