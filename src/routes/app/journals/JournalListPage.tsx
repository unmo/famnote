import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trophy } from 'lucide-react';
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

// スケルトンローディング
function JournalCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
      <div className="h-1 bg-zinc-700 rounded-t-xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-zinc-700 rounded-full w-1/3" />
        <div className="h-6 bg-zinc-700 rounded-full w-2/3" />
        <div className="h-4 bg-zinc-700 rounded-full w-1/2" />
        <div className="flex gap-4">
          <div className="h-10 bg-zinc-700 rounded w-16" />
          <div className="h-10 bg-zinc-700 rounded w-16" />
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
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50">
        <h1 className="text-xl font-bold text-zinc-50">{t('journals.title')}</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowActionSheet(true)}
          aria-label="新規ジャーナルを作成"
          className="min-w-[44px] min-h-[44px] bg-[var(--color-brand-primary)] rounded-full flex items-center justify-center"
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
            <div className="mb-4 opacity-20 flex justify-center"><Trophy size={64} className="text-zinc-400" /></div>
            <h2 className="text-lg font-semibold text-zinc-300 mt-4">{t('journals.emptyTitle')}</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-[240px]">{t('journals.emptyDesc')}</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/journals/new')}
              className="mt-6 w-full max-w-[240px] bg-[var(--color-brand-primary)] text-white rounded-xl py-3 font-medium"
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
