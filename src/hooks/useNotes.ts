import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { createNote, updateNote, deleteNote } from '@/lib/firebase/firestore';
import type { Note } from '@/types/note';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// ノート一覧取得フック
export function useNotes(userId: string | undefined) {
  return useQuery({
    queryKey: ['notes', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      const q = query(
        collection(db, 'notes'),
        where('userId', '==', userId),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ ...(d.data() as Note), id: d.id }))
        .filter((n) => !n.isDraft)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        .slice(0, 20);
    },
  });
}

// ノート詳細取得フック
export function useNote(noteId: string | undefined) {
  return useQuery({
    queryKey: ['note', noteId],
    enabled: !!noteId,
    queryFn: async () => {
      if (!noteId) return null;
      const snap = await getDoc(doc(db, 'notes', noteId));
      if (!snap.exists()) return null;
      return { ...(snap.data() as Note), id: snap.id };
    },
  });
}

// グループタイムライン取得フック
export function useGroupNotes(groupId: string | undefined) {
  return useQuery({
    queryKey: ['groupNotes', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      if (!groupId) return [];
      const q = query(
        collection(db, 'notes'),
        where('groupId', '==', groupId),
        where('isPublic', '==', true),
        where('isDraft', '==', false),
        orderBy('createdAt', 'desc'),
        limit(15)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ ...(d.data() as Note), id: d.id }));
    },
  });
}

// ノート作成ミューテーション
export function useCreateNote() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: createNote,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['notes', variables.userId] });
      qc.invalidateQueries({ queryKey: ['groupNotes', variables.groupId] });
      qc.invalidateQueries({ queryKey: ['streak', variables.userId] });
      toast.success(t('notes.savedSuccess'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });
}

// ノート削除ミューテーション
export function useDeleteNote() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ noteId, userId }: { noteId: string; userId: string }) =>
      deleteNote(noteId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      qc.invalidateQueries({ queryKey: ['groupNotes'] });
      toast.success(t('notes.deletedSuccess'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });
}

// ノート更新ミューテーション
export function useUpdateNote() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      noteId,
      userId,
      data,
    }: {
      noteId: string;
      userId: string;
      data: Partial<Omit<Note, 'id' | 'userId' | 'groupId' | 'createdAt'>>;
    }) => updateNote(noteId, userId, data),
    onSuccess: (_, { noteId }) => {
      qc.invalidateQueries({ queryKey: ['note', noteId] });
      qc.invalidateQueries({ queryKey: ['notes'] });
      qc.invalidateQueries({ queryKey: ['groupNotes'] });
      toast.success(t('notes.savedSuccess'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });
}
