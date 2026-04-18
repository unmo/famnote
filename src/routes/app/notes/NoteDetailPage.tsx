import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Edit2, Trash2, Globe, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNote, useDeleteNote } from '@/hooks/useNotes';
import { useAuthStore } from '@/store/authStore';
import { SportBadge } from '@/components/shared/SportBadge';
import { formatDateJa } from '@/lib/utils/date';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useState } from 'react';

// ノート詳細ページ
export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const { data: note, isLoading } = useNote(id);
  const deleteNote = useDeleteNote();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = note?.userId === userProfile?.uid;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-zinc-400">ノートが見つかりません</p>
        <Link to="/notes" className="text-[var(--color-brand-primary)] text-sm mt-4 inline-block">
          ノート一覧に戻る
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!userProfile) return;
    await deleteNote.mutateAsync({ noteId: note.id, userId: userProfile.uid });
    navigate('/notes');
  };

  const conditionLabels: Record<number, string> = {
    1: '😞 最悪',
    2: '😕 悪い',
    3: '😐 普通',
    4: '😊 良い',
    5: '😄 最高',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={24} />
        </button>
        {isOwner && (
          <div className="flex gap-2">
            <Link
              to={`/notes/${note.id}/edit`}
              className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label="編集"
            >
              <Edit2 size={20} />
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
              aria-label="削除"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* スポーツ・日付 */}
        <div className="flex items-center gap-3 flex-wrap">
          <SportBadge sport={note.sport} />
          <span className="text-zinc-400 text-sm">{formatDateJa(note.date)}</span>
          {note.isPublic ? (
            <Globe size={14} className="text-zinc-500" />
          ) : (
            <Lock size={14} className="text-zinc-500" />
          )}
        </div>

        {/* メタ情報 */}
        <div className="flex gap-4 text-sm text-zinc-400">
          {note.durationMinutes && <span>⏱ {note.durationMinutes}分</span>}
          {note.location && <span>📍 {note.location}</span>}
          {note.condition && (
            <span>{conditionLabels[note.condition]}</span>
          )}
        </div>

        {/* 今日の目標 */}
        {note.todayGoal && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
              今日の目標
            </h3>
            <p className="text-zinc-300">{note.todayGoal}</p>
          </div>
        )}

        {/* 練習内容 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            {t('notes.content')}
          </h3>
          <p className="text-zinc-200 whitespace-pre-wrap leading-relaxed">{note.content}</p>
        </div>

        {/* 振り返り */}
        {note.reflection && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
              {t('notes.reflection')}
            </h3>
            <p className="text-zinc-300 whitespace-pre-wrap">{note.reflection}</p>
          </div>
        )}
      </motion.div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-semibold text-zinc-50 mb-2">ノートを削除しますか？</h3>
            <p className="text-zinc-400 text-sm mb-6">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteNote.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3 transition-colors"
              >
                {deleteNote.isPending ? '削除中...' : t('common.delete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
