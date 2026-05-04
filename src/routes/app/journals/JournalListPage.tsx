import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trophy, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useUserJournalsList } from '@/hooks/useMatchJournals';
import { MatchJournalCard } from '@/components/journals/MatchJournalCard';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const containerVariants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.97, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
};

// スケルトンローディング（shimmer アニメーション使用）
function JournalCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="h-1.5 skeleton-shimmer rounded-t-xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton-shimmer rounded-full w-1/3" />
        <div className="h-6 skeleton-shimmer rounded-full w-2/3" />
        <div className="h-4 skeleton-shimmer rounded-full w-1/2" />
        <div className="flex gap-4">
          <div className="h-10 skeleton-shimmer rounded w-16" />
          <div className="h-10 skeleton-shimmer rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function JournalListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.userProfile);
  const { data, isLoading } = useUserJournalsList(user?.uid);
  const journals = data?.journals ?? [];

  const [showActionSheet, setShowActionSheet] = useState(false);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen bg-zinc-950 pb-24"
    >
      {/* ヘッダー */}
      <header className="page-header-gradient-line flex items-center justify-between px-4 py-3 sticky top-0 bg-zinc-950/95 backdrop-blur-xl z-10 border-b border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full bg-[var(--color-brand-primary)]" aria-hidden="true" />
          <h1 className="text-xl font-bold text-white">{t('journals.title')}</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowActionSheet(true)}
          aria-label="新規ジャーナルを作成"
          className="min-w-[44px] min-h-[44px] bg-[var(--color-brand-primary)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--color-brand-primary)]/30"
        >
          <Plus size={20} className="text-white" />
        </motion.button>
      </header>

      {/* コンテンツ */}
      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3" role="status" aria-label="読み込み中">
            {[1, 2, 3, 4].map((i) => <JournalCardSkeleton key={i} />)}
          </div>
        ) : journals.length === 0 ? (
          /* 空状態 */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {/* アイコングループ（入場アニメーション付き） */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative mb-6"
            >
              {/* 外側の輪 */}
              <div className="w-24 h-24 rounded-full bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 flex items-center justify-center">
                {/* 内側の輪 */}
                <div className="w-16 h-16 rounded-full bg-[var(--color-brand-primary)]/15 border border-[var(--color-brand-primary)]/30 flex items-center justify-center">
                  <Trophy size={32} className="text-[var(--color-brand-primary)]" />
                </div>
              </div>
              {/* フローティング装飾（Star）- 上下に浮遊 */}
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center"
              >
                <Star size={12} className="text-amber-400" />
              </motion.div>
            </motion.div>
            <h2 className="text-base font-semibold text-zinc-200">{t('journals.emptyTitle')}</h2>
            <p className="text-sm text-zinc-500 mt-1.5 max-w-[200px] leading-relaxed">{t('journals.emptyDesc')}</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/journals/new')}
              className="mt-6 w-full max-w-[240px] bg-[var(--color-brand-primary)] text-white rounded-xl py-3 font-medium shadow-lg shadow-[var(--color-brand-primary)]/20"
            >
              {t('journals.createFirst')}
            </motion.button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-3"
          >
            {journals.map((journal) => (
              <motion.div key={journal.id} variants={cardVariants}>
                <MatchJournalCard
                  journal={journal}
                  onPress={(id) => navigate(`/journals/${id}`)}
                  onPostNotePress={(id) => navigate(`/journals/${id}/post`)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* FABアクションシート */}
      <AnimatePresence>
        {showActionSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowActionSheet(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } }}
              exit={{ y: '100%', transition: { duration: 0.25 } }}
              className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 rounded-t-2xl p-4 pb-8 z-50"
            >
              <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />
              <div className="space-y-2">
                <button
                  onClick={() => { setShowActionSheet(false); navigate('/journals/new'); }}
                  className="w-full bg-[var(--color-brand-primary)] text-white rounded-xl py-4 text-base font-semibold"
                >
                  {t('journals.newPre')}
                </button>
                <button
                  onClick={() => { setShowActionSheet(false); navigate('/journals/new?type=post_only'); }}
                  className="w-full bg-zinc-800 text-zinc-100 rounded-xl py-4 text-base font-medium hover:bg-zinc-700"
                >
                  {t('journals.newPostOnly')}
                </button>
                <button
                  onClick={() => { setShowActionSheet(false); navigate('/notes/new'); }}
                  className="w-full bg-zinc-800 text-zinc-400 rounded-xl py-3 text-sm font-medium hover:bg-zinc-700"
                >
                  {t('journals.newPractice')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
