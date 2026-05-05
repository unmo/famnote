import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  subscribeUnreadCount,
  getUnreadNotifications,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  markContentAsRead,
  getUnreadCount,
} from '@/lib/firebase/notifications';
import type { Notification } from '@/types/notification';

// ----- クエリキー定数 -----
const KEYS = {
  unreadNotifications: (uid: string) => ['unreadNotifications', uid] as const,
  allNotifications: (uid: string) => ['allNotifications', uid] as const,
  unreadCounts: (uids: string[]) => ['unreadCounts', uids] as const,
};

/**
 * 未読件数をリアルタイム購読するフック。
 * recipientProfileUid が undefined の場合は count: 0 を返す。
 */
export function useUnreadCount(
  recipientProfileUid: string | undefined,
): { count: number; isLoading: boolean } {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!recipientProfileUid) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeUnreadCount(recipientProfileUid, (c) => {
      setCount(c);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [recipientProfileUid]);

  return { count, isLoading };
}

/**
 * 未読通知一覧を取得するフック（TanStack Query）。
 */
export function useUnreadNotifications(
  recipientProfileUid: string | undefined,
  limitCount = 20,
) {
  return useQuery<Notification[]>({
    queryKey: KEYS.unreadNotifications(recipientProfileUid ?? ''),
    enabled: !!recipientProfileUid,
    staleTime: 30 * 1000,
    queryFn: () => getUnreadNotifications(recipientProfileUid!, limitCount),
  });
}

/**
 * 全通知一覧（既読・未読混在）を取得するフック。
 */
export function useNotifications(
  recipientProfileUid: string | undefined,
  limitCount = 20,
) {
  return useQuery<Notification[]>({
    queryKey: KEYS.allNotifications(recipientProfileUid ?? ''),
    enabled: !!recipientProfileUid,
    staleTime: 30 * 1000,
    queryFn: () => fetchNotifications(recipientProfileUid!, limitCount),
  });
}

/**
 * 複数プロフィールの未読件数を一括取得するフック（ProfileSelectPage用）。
 * @returns profileUid → count のマップ
 */
export function useUnreadCountByProfiles(
  profileUids: string[],
): Record<string, number> {
  const { data } = useQuery<Record<string, number>>({
    queryKey: KEYS.unreadCounts(profileUids),
    enabled: profileUids.length > 0,
    staleTime: 30 * 1000,
    queryFn: async () => {
      const results = await Promise.all(
        profileUids.map(async (uid) => ({
          uid,
          count: await getUnreadCount(uid),
        })),
      );
      return Object.fromEntries(results.map(({ uid, count }) => [uid, count]));
    },
  });
  return data ?? {};
}

/**
 * 単一通知を既読にするミューテーション。
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onSuccess: () => {
      // 通知関連クエリを無効化してリフレッシュ
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCounts'] });
    },
  });
}

/**
 * 全未読通知を既読にするミューテーション。
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipientProfileUid: string) => markAllAsRead(recipientProfileUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCounts'] });
    },
  });
}

/**
 * 特定コンテンツに対応する通知を既読にするミューテーション。
 * NoteDetailPage・JournalDetailPage・MatchDetailPage でページマウント時に呼ぶ。
 */
export function useMarkContentAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recipientProfileUid,
      contentId,
    }: {
      recipientProfileUid: string;
      contentId: string;
    }) => markContentAsRead(recipientProfileUid, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCounts'] });
    },
  });
}
