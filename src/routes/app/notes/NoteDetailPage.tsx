import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Edit2, Trash2, Clock, MapPin, Globe, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNote, useDeleteNote } from '@/hooks/useNotes';
import { useAuthStore } from '@/store/authStore';
import { formatDateJa } from '@/lib/utils/date';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const CONDITION_LABEL: Record<number, string> = {
  1: '最悪', 2: '悪い', 3: '普通', 4: '良い', 5: '最高',
};

function SectionCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
        <span className="text-base">{icon}</span>
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

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
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">ノートが見つかりません</p>
        <Link to="/notes" className="text-[var(--color-brand-primary)] text-sm">{t('common.back')}</Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!userProfile) return;
    await deleteNote.mutateAsync({ noteId: note.id, userId: userProfile.uid });
    navigate('/notes');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen bg-zinc-950 pb-8"
    >
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50">
        <button
          onClick={() => navigate(-1)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-100"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={22} />
        </button>
        <span className="text-sm font-semibold text-zinc-300">練習ノート</span>
        {isOwner && (
          <div className="flex items-center">
            <Link
              to={`/notes/${note.id}/edit`}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-100"
              aria-label="編集"
            >
              <Edit2 size={18} />
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-red-400"
              aria-label="削除"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </header>

      {/* ヒーローカード: メタ情報 */}
      <div className="mx-4 mt-3 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="h-1 w-full bg-[var(--color-brand-primary)] opacity-60" />
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-zinc-100">{formatDateJa(note.date)}</span>
            {note.isPublic
              ? <span className="flex items-center gap-1 text-[11px] text-zinc-500"><Globe size={12} />公開中</span>
              : <span className="flex items-center gap-1 text-[11px] text-zinc-600"><Lock size={12} />非公開</span>
            }
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-500">
            {note.durationMinutes && (
              <span className="flex items-center gap-1"><Clock size={12} />{note.durationMinutes}分</span>
            )}
            {note.location && (
              <span className="flex items-center gap-1"><MapPin size={12} />{note.location}</span>
            )}
            {note.condition && (
              <span className="flex items-center gap-1">
                <span className="text-amber-400">{'★'.repeat(note.condition)}</span>
                <span className="text-zinc-600">{'★'.repeat(5 - note.condition)}</span>
                <span className="ml-0.5">{CONDITION_LABEL[note.condition]}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="mx-4 mt-3 space-y-3">
        {note.todayGoal && (
          <SectionCard icon="🎯" title="今日の目標">
            <p className="text-sm text-zinc-200 leading-relaxed">{note.todayGoal}</p>
          </SectionCard>
        )}

        <SectionCard icon="📝" title={t('notes.content')}>
          <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{note.content}</p>
        </SectionCard>

        {(note.insights ?? []).length > 0 && (
          <SectionCard icon="💡" title="気づき">
            <div className="space-y-2">
              {(note.insights ?? []).map((text, i) => (
                <p key={i} className="text-sm text-zinc-200 leading-relaxed">{text}</p>
              ))}
            </div>
          </SectionCard>
        )}

        {note.reflection && (
          <SectionCard icon="📝" title={t('notes.reflection')}>
            <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{note.reflection}</p>
          </SectionCard>
        )}
      </div>

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
                className="flex-1 bg-zinc-800 text-zinc-200 rounded-xl py-3 text-sm font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteNote.isPending}
                className="flex-1 bg-red-600 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40"
              >
                {deleteNote.isPending ? '削除中...' : t('common.delete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
