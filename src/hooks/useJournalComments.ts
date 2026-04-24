import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  subscribeJournalComments,
  addJournalComment,
  deleteJournalComment,
} from '@/lib/firebase/journalCommentService';
import type { JournalComment } from '@/types/matchJournal';

interface UseJournalCommentsResult {
  comments: JournalComment[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * コメント一覧をリアルタイム購読するフック
 * アンマウント時に自動的にリスナーを解除する
 */
export function useJournalComments(journalId: string): UseJournalCommentsResult {
  const [comments, setComments] = useState<JournalComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!journalId) return;

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeJournalComments(journalId, (data) => {
      setComments(data);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [journalId]);

  return { comments, isLoading, error };
}

interface AddCommentVariables {
  journalId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'parent' | 'child' | 'member';
  text: string;
}

/**
 * コメント投稿ミューテーション
 * 成功・失敗時に Sonner トーストを表示する
 */
export function useAddJournalComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ journalId, ...comment }: AddCommentVariables) =>
      addJournalComment(journalId, comment),
    onSuccess: (_data, variables) => {
      toast.success('コメントを送信しました');
      // ジャーナル詳細のキャッシュを無効化して未読カウントを最新化
      queryClient.invalidateQueries({ queryKey: ['matchJournal', variables.journalId] });
    },
    onError: () => {
      toast.error('コメントの送信に失敗しました');
    },
  });
}

interface DeleteCommentVariables {
  journalId: string;
  commentId: string;
  userId: string;
}

/**
 * コメント削除ミューテーション
 */
export function useDeleteJournalComment() {
  return useMutation({
    mutationFn: ({ journalId, commentId, userId }: DeleteCommentVariables) =>
      deleteJournalComment(journalId, commentId, userId),
    onSuccess: () => {
      toast.success('コメントを削除しました');
    },
    onError: () => {
      toast.error('コメントの削除に失敗しました');
    },
  });
}
