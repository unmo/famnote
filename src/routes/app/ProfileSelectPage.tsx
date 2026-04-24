import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Crown, User, AlertCircle } from 'lucide-react';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import type { GroupMember } from '@/types/group';
import { useAuthStore } from '@/store/authStore';

// スケルトンカード（ローディング中に表示）
function SkeletonProfileCard() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-24 h-24 rounded-xl bg-zinc-800 animate-pulse" />
      <div className="w-16 h-3 rounded-full bg-zinc-800 animate-pulse" />
    </div>
  );
}

// エラー状態の表示
interface ProfileSelectErrorProps {
  onRetry: () => void;
}
function ProfileSelectError({ onRetry }: ProfileSelectErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <p className="text-zinc-300 text-base font-medium">メンバー情報の取得に失敗しました</p>
      <p className="text-zinc-500 text-sm">ネットワーク接続を確認して、もう一度お試しください</p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 rounded-lg bg-[var(--color-brand-primary)] text-white text-sm font-medium hover:opacity-90 active:opacity-80 transition-opacity"
      >
        再読み込み
      </button>
    </div>
  );
}

export function ProfileSelectPage() {
  const navigate = useNavigate();
  const { members, setActiveProfile } = useActiveProfile();
  // AuthContextがメンバーをFirestoreからロードするまでの間はisLoadingがtrue
  const isLoading = useAuthStore((s) => s.isLoading);

  const handleSelect = (member: GroupMember) => {
    setActiveProfile(member);
    navigate('/dashboard');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // isLoadingがtrueかつメンバーが0件のときスケルトンを表示
  const showSkeleton = isLoading && members.length === 0;
  // isLoadingがfalseでメンバーが0件のときエラー状態を表示
  const showError = !isLoading && members.length === 0;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 sm:px-6">
      {/* ロゴ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
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

      {/* スケルトンローディング */}
      {showSkeleton && (
        <div className="flex flex-wrap justify-center gap-6 max-w-2xl w-full">
          <SkeletonProfileCard />
          <SkeletonProfileCard />
          <SkeletonProfileCard />
        </div>
      )}

      {/* エラー状態 */}
      {showError && <ProfileSelectError onRetry={handleRetry} />}

      {/* プロフィールグリッド */}
      {members.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
          className="flex flex-wrap justify-center gap-6 max-w-2xl w-full"
        >
          {members.map((member, i) => (
            <motion.button
              key={member.uid}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.3, ease: 'easeOut' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(member)}
              aria-label={`${member.displayName}${member.role === 'owner' ? '（管理者）' : ''}として使う`}
              className="flex flex-col items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 min-w-[80px]"
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
                  <div className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-1 shadow-md shadow-amber-900/30">
                    <Crown className="w-3 h-3 text-amber-900" />
                  </div>
                )}
              </div>
              {/* 名前 */}
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors duration-200 text-center max-w-[96px] truncate">
                {member.displayName}
              </span>
              {member.role === 'owner' && (
                <span className="text-[10px] font-medium text-amber-400 -mt-2 tracking-wide">管理者</span>
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
