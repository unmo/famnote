import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  createPreMatchNote,
  updatePreMatchNote,
  addPostMatchNote,
  updatePostMatchNote,
  createPostMatchOnly,
  deleteMatchJournal,
  fetchUserJournals,
  fetchUserJournalsPaged,
} from '@/lib/firebase/matchJournalService';
import type { MatchJournal, PreMatchFormData, PostMatchFormData } from '@/types/matchJournal';
import type { Sport } from '@/types/sport';
import { toast } from 'sonner';

// ジャーナル一覧（月別）
export function useUserJournals(
  userId: string | undefined,
  year: number,
  month: number
) {
  return useQuery({
    queryKey: ['matchJournals', userId, year, month],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      return fetchUserJournals(userId, year, month);
    },
  });
}

// ジャーナル全件（ページなし・一覧用）
export function useUserJournalsList(userId: string | undefined) {
  return useQuery({
    queryKey: ['matchJournalsList', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return { journals: [] as MatchJournal[], lastDoc: null };
      return fetchUserJournalsPaged(userId, 20);
    },
  });
}

// ジャーナル単件
export function useJournal(journalId: string | undefined) {
  return useQuery({
    queryKey: ['matchJournal', journalId],
    enabled: !!journalId,
    queryFn: async () => {
      if (!journalId) return null;
      const snap = await getDoc(doc(db, 'matchJournals', journalId));
      if (!snap.exists()) return null;
      return { ...(snap.data() as MatchJournal), id: snap.id };
    },
  });
}

// 試合前ノート作成
export function useCreatePreMatchNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      groupId,
      data,
    }: {
      userId: string;
      groupId: string | null;
      data: PreMatchFormData;
    }) => createPreMatchNote(userId, groupId, data),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['matchJournalsList', userId] });
      qc.invalidateQueries({ queryKey: ['matchJournals', userId] });
      toast.success('試合前ノートを保存しました！');
    },
    onError: () => {
      toast.error('保存に失敗しました。再試行してください');
    },
  });
}

// 試合前ノート更新
export function useUpdatePreMatchNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ journalId, userId, data }: { journalId: string; userId: string; data: PreMatchFormData }) =>
      updatePreMatchNote(journalId, userId, data),
    onSuccess: (_, { journalId, userId }) => {
      qc.invalidateQueries({ queryKey: ['matchJournal', journalId] });
      qc.invalidateQueries({ queryKey: ['matchJournalsList', userId] });
      toast.success('試合前ノートを更新しました！');
    },
    onError: () => { toast.error('更新に失敗しました'); },
  });
}

// 試合後ノート追加
export function useAddPostMatchNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      journalId,
      userId,
      data,
      imageUrls,
    }: {
      journalId: string;
      userId: string;
      data: PostMatchFormData;
      imageUrls?: string[];
    }) => addPostMatchNote(journalId, userId, data, imageUrls),
    onSuccess: (_, { journalId, userId }) => {
      qc.invalidateQueries({ queryKey: ['matchJournal', journalId] });
      qc.invalidateQueries({ queryKey: ['matchJournalsList', userId] });
      qc.invalidateQueries({ queryKey: ['matchJournals', userId] });
      toast.success('振り返りを保存しました！');
    },
    onError: () => {
      toast.error('保存に失敗しました。再試行してください');
    },
  });
}

// 試合後ノート更新
export function useUpdatePostMatchNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ journalId, userId, data }: { journalId: string; userId: string; data: PostMatchFormData }) =>
      updatePostMatchNote(journalId, userId, data),
    onSuccess: (_, { journalId, userId }) => {
      qc.invalidateQueries({ queryKey: ['matchJournal', journalId] });
      qc.invalidateQueries({ queryKey: ['matchJournalsList', userId] });
      toast.success('振り返りを更新しました！');
    },
    onError: () => { toast.error('更新に失敗しました'); },
  });
}

// 試合後ノートのみ作成
export function useCreatePostMatchOnly() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      groupId,
      baseData,
      postData,
      imageUrls,
    }: {
      userId: string;
      groupId: string | null;
      baseData: { sport: Sport; date: string; opponent: string; venue: string | null };
      postData: PostMatchFormData;
      imageUrls?: string[];
    }) => createPostMatchOnly(userId, groupId, baseData, postData, imageUrls),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['matchJournalsList', userId] });
      qc.invalidateQueries({ queryKey: ['matchJournals', userId] });
      toast.success('試合後ノートを保存しました！');
    },
    onError: () => {
      toast.error('保存に失敗しました。再試行してください');
    },
  });
}

// ジャーナル削除
export function useDeleteJournal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ journalId, userId }: { journalId: string; userId: string }) =>
      deleteMatchJournal(journalId, userId),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['matchJournalsList', userId] });
      qc.invalidateQueries({ queryKey: ['matchJournals', userId] });
      toast.success('ジャーナルを削除しました');
    },
    onError: () => {
      toast.error('削除に失敗しました');
    },
  });
}
