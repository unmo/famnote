import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useNotes } from '@/hooks/useNotes';
import { SportBadge } from '@/components/shared/SportBadge';
import { formatDateJa } from '@/lib/utils/date';

// ノート一覧ページ
export function NotesListPage() {
  const { t } = useTranslation();
  const { userProfile } = useAuthStore();
  const { data: notes, isLoading } = useNotes(userProfile?.uid);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">{t('notes.title')}</h1>
        <Link to="/notes/new">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
          >
            <Plus size={16} />
            {t('notes.new')}
          </motion.div>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notes && notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <Link key={note.id} to={`/notes/${note.id}`}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <SportBadge sport={note.sport} size="sm" />
                    {note.location && (
                      <span className="text-zinc-500 text-xs">📍 {note.location}</span>
                    )}
                  </div>
                  <span className="text-zinc-500 text-xs shrink-0">
                    {formatDateJa(note.date)}
                  </span>
                </div>
                <p className="text-zinc-300 text-sm line-clamp-2">{note.content}</p>
                {note.durationMinutes && (
                  <p className="text-zinc-500 text-xs mt-2">⏱ {note.durationMinutes}分</p>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📓</p>
          <p className="text-zinc-400 mb-4">まだ練習ノートがありません</p>
          <Link to="/notes/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} />
            最初のノートを書く
          </Link>
        </div>
      )}
    </div>
  );
}
