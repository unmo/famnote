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
          <div className="space-y-3" role="status" aria-label={t('common.loading')}>
            {[1, 2, 3].map((i) => <NoteCardSkeleton key={i} />)}
          </div>
        ) : notes && notes.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {notes.map((note) => (
              <motion.div key={note.id} variants={cardVariants}>
                <Link to={`/notes/${note.id}`}>
                  <motion.div
                    whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                    transition={{ duration: 0.15 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700/60 transition-colors duration-150"
                  >
                    <div className="h-1 w-full bg-[var(--color-brand-primary)] opacity-50" />
                    <div className="p-4">
                      {/* 上段: 日付・体調 */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500">{formatDateJa(note.date)}</span>
                        {note.condition && (
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map((s) => (
                              <span key={s} className={`text-[10px] ${s <= note.condition! ? 'text-amber-400' : 'text-zinc-700'}`}>★</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* メインテキスト */}
                      <p className="text-zinc-100 text-sm font-medium line-clamp-2 leading-relaxed mb-2">
                        {note.content || note.todayGoal || ''}
                      </p>

                      {/* 下段: 時間・場所 */}
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        {note.durationMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {note.durationMinutes}分
                          </span>
                        )}
                        {note.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} />
                            {note.location}
                          </span>
                        )}
                        {!note.isPublic && (
                          <span className="ml-auto text-zinc-600">🔒 非公開</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
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
