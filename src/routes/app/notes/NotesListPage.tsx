import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Clock, MapPin, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useNotes } from '@/hooks/useNotes';
import { formatDateJa } from '@/lib/utils/date';

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

function NoteCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="h-1.5 skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 skeleton-shimmer rounded-full w-1/4" />
          <div className="h-4 skeleton-shimmer rounded-full w-1/5" />
        </div>
        <div className="h-5 skeleton-shimmer rounded-full w-2/3" />
        <div className="h-4 skeleton-shimmer rounded-full w-1/2" />
      </div>
    </div>
  );
}

export function NotesListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const { data: notes, isLoading } = useNotes(userProfile?.uid);

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
          <h1 className="text-xl font-bold text-white">{t('notes.title')}</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => navigate('/notes/new')}
          aria-label={t('notes.new')}
          className="min-w-[44px] min-h-[44px] bg-[var(--color-brand-primary)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--color-brand-primary)]/30"
        >
          <Plus size={20} className="text-white" />
        </motion.button>
      </header>

      {/* コンテンツ */}
      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3" role="status" aria-label={t('common.loading')}>
            {[1, 2, 3, 4].map((i) => <NoteCardSkeleton key={i} />)}
          </div>
        ) : notes && notes.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-3"
          >
            {notes.map((note) => (
              <motion.div key={note.id} variants={cardVariants}>
                <Link to={`/notes/${note.id}`}>
                  <motion.article
                    whileTap={{ scale: 0.97 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden active:bg-zinc-800/80 transition-all duration-100 hover:border-[var(--color-brand-primary)]/30"
                  >
                    <div className="h-1.5 w-full bg-gradient-to-r from-[var(--color-brand-primary)] to-sky-400" />
                    <div className="p-3 flex flex-col gap-2">
                      {/* 日付・体調 */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-zinc-500">{formatDateJa(note.date)}</span>
                        {note.condition && (
                          <span className="text-[10px] text-amber-400">{'★'.repeat(note.condition)}</span>
                        )}
                      </div>
                      {/* 本文 */}
                      <p className="text-xs font-medium text-zinc-100 line-clamp-3 leading-relaxed">
                        {note.content || note.todayGoal || ''}
                      </p>
                      {/* メタ */}
                      <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                        {note.durationMinutes && (
                          <span className="flex items-center gap-0.5"><Clock size={9} />{note.durationMinutes}分</span>
                        )}
                        {note.location && (
                          <span className="flex items-center gap-0.5 truncate"><MapPin size={9} />{note.location}</span>
                        )}
                      </div>
                    </div>
                  </motion.article>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {/* アイコングループ（入場アニメーション付き） */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative mb-6"
            >
              {/* 外側の輪 */}
              <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                {/* 内側の輪 */}
                <div className="w-16 h-16 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                  <BookOpen size={32} className="text-[var(--color-brand-primary)]" />
                </div>
              </div>
              {/* フローティング装飾 - 上下に浮遊 */}
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-brand-primary)]/20 border border-[var(--color-brand-primary)]/40 flex items-center justify-center"
                aria-hidden="true"
              >
                <Plus size={12} className="text-[var(--color-brand-primary)]" />
              </motion.div>
            </motion.div>
            <h2 className="text-base font-semibold text-zinc-200">{t('notes.emptyTitle', '練習ノートを書いてみよう')}</h2>
            <p className="text-sm text-zinc-500 mt-1.5 max-w-[200px] leading-relaxed">
              {t('notes.emptyDesc', '日々の積み重ねが成長の証になります')}
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/notes/new')}
              className="mt-6 w-full max-w-[240px] bg-[var(--color-brand-primary)] text-white rounded-xl py-3 font-medium shadow-lg shadow-[var(--color-brand-primary)]/20"
            >
              <Plus size={16} className="inline mr-2" />
              {t('notes.new')}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
