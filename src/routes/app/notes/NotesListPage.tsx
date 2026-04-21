import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Clock, MapPin } from 'lucide-react';
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-zinc-700 rounded-full w-1/4" />
          <div className="h-4 bg-zinc-700 rounded-full w-1/5" />
        </div>
        <div className="h-5 bg-zinc-700 rounded-full w-2/3" />
        <div className="h-4 bg-zinc-700 rounded-full w-1/2" />
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
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50">
        <h1 className="text-xl font-bold text-zinc-50">{t('notes.title')}</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => navigate('/notes/new')}
          aria-label={t('notes.new')}
          className="min-w-[44px] min-h-[44px] bg-[var(--color-brand-primary)] rounded-full flex items-center justify-center"
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
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden active:bg-zinc-800/80 transition-colors duration-100"
                  >
                    <div className="h-1 w-full bg-[var(--color-brand-primary)] opacity-60" />
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
            <div className="text-6xl mb-4 opacity-20">📓</div>
            <h2 className="text-lg font-semibold text-zinc-300 mt-4">{t('common.noRecords')}</h2>
            <p className="text-sm text-zinc-500 mt-2">{t('common.createFirstRecord')}</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/notes/new')}
              className="mt-6 w-full max-w-[240px] bg-[var(--color-brand-primary)] text-white rounded-xl py-3 font-medium"
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
