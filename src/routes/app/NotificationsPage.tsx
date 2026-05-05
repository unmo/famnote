import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, BellOff, ChevronLeft, BookOpen, NotebookPen, Trophy, User } from 'lucide-react';
import { toast } from 'sonner';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useNotifications, useMarkAllAsRead, useMarkAsRead } from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/lib/utils/date';
import type { Notification, NotificationContentType, NotificationActionType } from '@/types/notification';

const CONTENT_TYPE_CONFIG: Record<
  NotificationContentType,
  { icon: typeof BookOpen; label: string; path: string }
> = {
  note: { icon: BookOpen, label: '練習ノート', path: '/notes' },
  matchJournal: { icon: NotebookPen, label: '試合ジャーナル', path: '/journals' },
  match: { icon: Trophy, label: '試合記録', path: '/matches' },
};

const ACTION_LABELS: Record<NotificationActionType, string> = {
  created: '投稿しました',
  updated: '更新しました',
};

// スケルトンカード
function NotificationCardSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3 bg-zinc-800 rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-zinc-800 rounded-full w-1/2 animate-pulse" />
        <div className="h-2.5 bg-zinc-800 rounded-full w-1/4 animate-pulse" />
      </div>
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const config = CONTENT_TYPE_CONFIG[notification.contentType];
  const ContentIcon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      role="button"
      tabIndex={0}
      aria-label={`${notification.senderDisplayName}の${config.label}「${notification.contentTitle}」${!notification.isRead ? '（未読）' : ''}`}
      onClick={() => onClick(notification)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(notification);
        }
      }}
      className={`
        bg-zinc-900 rounded-xl p-4 flex items-start gap-3 cursor-pointer
        border-l-4 transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
        focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 focus-visible:rounded-xl
        ${notification.isRead
          ? 'border-transparent hover:bg-zinc-800'
          : 'border-sky-500 hover:bg-sky-500/5'
        }
      `}
    >
      {/* アバター */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-zinc-700 flex items-center justify-center">
        {notification.senderAvatarUrl ? (
          <img
            src={notification.senderAvatarUrl}
            alt={notification.senderDisplayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-5 h-5 text-zinc-500" />
        )}
      </div>

      {/* テキストエリア */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300 flex items-center gap-1 flex-wrap">
          <span className="font-semibold text-zinc-100">{notification.senderDisplayName}</span>
          <span>が</span>
          <span className="text-zinc-300">{config.label}</span>
          <span>を</span>
          <span>{ACTION_LABELS[notification.actionType]}</span>
        </p>
        <p className="text-sm font-medium text-zinc-200 truncate mt-0.5">
          {notification.contentTitle}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-zinc-500">
            {formatRelativeTime(notification.createdAt)}
          </span>
          <ContentIcon className="w-4 h-4 text-zinc-500" />
        </div>
      </div>

      {/* 未読インジケーター */}
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 mt-1.5" aria-hidden="true" />
      )}
    </motion.div>
  );
}

type FilterTab = 'all' | 'unread';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { activeProfile } = useActiveProfile();
  const [filter, setFilter] = useState<FilterTab>('all');

  const recipientProfileUid = activeProfile?.isChildProfile ? undefined : activeProfile?.uid;

  const { data: allNotifications = [], isLoading } = useNotifications(recipientProfileUid, 50);
  const markAllAsReadMutation = useMarkAllAsRead();
  const markAsReadMutation = useMarkAsRead();

  const displayed =
    filter === 'unread'
      ? allNotifications.filter((n) => !n.isRead)
      : allNotifications;

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  const handleCardClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    const config = CONTENT_TYPE_CONFIG[notification.contentType];
    navigate(`${config.path}/${notification.contentId}`);
  };

  const handleMarkAllAsRead = async () => {
    if (!recipientProfileUid || unreadCount === 0) return;
    try {
      await markAllAsReadMutation.mutateAsync(recipientProfileUid);
      toast.success('すべて既読にしました', { duration: 2000 });
    } catch {
      toast.error('既読化に失敗しました', { duration: 3000 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-2xl mx-auto"
    >
      {/* ページヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {/* モバイルのみ戻るボタンを表示（デスクトップはサイドナビで戻れる） */}
          <button
            onClick={() => navigate(-1)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
            aria-label="戻る"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <Bell className="w-6 h-6 text-sky-500" />
          <h1 className="text-2xl font-bold text-zinc-50">すべての通知</h1>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          aria-label="すべての通知を既読にする"
          aria-disabled={unreadCount === 0}
          className="text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors disabled:text-zinc-600 disabled:cursor-not-allowed min-h-[44px] px-4"
        >
          {markAllAsReadMutation.isPending ? '...' : 'すべて既読'}
        </button>
      </div>

      {/* フィルタータブ */}
      <div className="flex gap-1 mb-4 bg-zinc-900 rounded-lg p-1">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 text-sm px-4 py-1.5 rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-zinc-800 text-zinc-50 font-medium'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`flex-1 text-sm px-4 py-1.5 rounded-md transition-colors ${
            filter === 'unread'
              ? 'bg-zinc-800 text-zinc-50 font-medium'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          未読のみ
        </button>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <NotificationCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* 通知リスト */}
      {!isLoading && displayed.length > 0 && (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {displayed.map((n) => (
              <NotificationCard key={n.id} notification={n} onClick={handleCardClick} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 空状態 */}
      {!isLoading && displayed.length === 0 && (
        <div className="py-20 flex flex-col items-center gap-4 text-center">
          <BellOff className="w-16 h-16 text-zinc-800" />
          <h2 className="text-xl font-bold text-zinc-600">通知はありません</h2>
          <p className="text-sm text-zinc-600">
            子プロフィールが練習ノートや試合を記録すると、ここに表示されます
          </p>
          <Link
            to="/dashboard"
            className="text-sm text-sky-400 hover:text-sky-300 underline transition-colors"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      )}
    </motion.div>
  );
}
