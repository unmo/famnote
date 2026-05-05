import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, BookOpen, NotebookPen, Trophy, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  useUnreadNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
} from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/lib/utils/date';
import type { Notification, NotificationContentType, NotificationActionType } from '@/types/notification';

// contentType 別アイコン・ラベル・遷移先パス
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

// スタッガーアニメーション定義
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
};

interface ActivityCardProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

function ActivityCard({ notification, onClick }: ActivityCardProps) {
  const config = CONTENT_TYPE_CONFIG[notification.contentType];
  const ContentIcon = config.icon;

  return (
    <motion.div
      variants={itemVariants}
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
        bg-zinc-900 rounded-xl p-4 flex items-start gap-3
        border-l-4 cursor-pointer transition-colors
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

// スケルトンカード（ローディング中に表示）
function ActivityCardSkeleton() {
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

interface ActivityFeedProps {
  recipientProfileUid: string | undefined;
}

/**
 * ダッシュボードに表示する「新着アクティビティ」セクション。
 * 未読通知が0件かつローディング完了の場合は空状態UIを表示する。
 */
export function ActivityFeed({ recipientProfileUid }: ActivityFeedProps) {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useUnreadNotifications(
    recipientProfileUid,
    10,
  );
  const markAllAsReadMutation = useMarkAllAsRead();
  const markAsReadMutation = useMarkAsRead();

  const handleCardClick = async (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    const config = CONTENT_TYPE_CONFIG[notification.contentType];
    navigate(`${config.path}/${notification.contentId}`);
  };

  const handleMarkAllAsRead = async () => {
    if (!recipientProfileUid) return;
    try {
      await markAllAsReadMutation.mutateAsync(recipientProfileUid);
      toast.success('すべて既読にしました', { duration: 2000 });
    } catch {
      toast.error('既読化に失敗しました', { duration: 3000 });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* セクションヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-bold text-zinc-50">新着アクティビティ</h2>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            aria-label="すべての通知を既読にする"
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors disabled:text-zinc-600 disabled:cursor-not-allowed"
          >
            {markAllAsReadMutation.isPending ? '...' : 'すべて既読'}
          </button>
        )}
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <ActivityCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* 通知リスト */}
      {!isLoading && notifications.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2"
        >
          <AnimatePresence>
            {notifications.map((n) => (
              <ActivityCard key={n.id} notification={n} onClick={handleCardClick} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 空状態 */}
      {!isLoading && notifications.length === 0 && (
        <div className="py-8 flex flex-col items-center gap-2 text-center rounded-xl border border-dashed border-zinc-800">
          <Bell className="w-10 h-10 text-zinc-700" />
          <p className="text-sm text-zinc-500 font-medium">まだ新しい投稿はありません</p>
          <p className="text-xs text-zinc-600">子プロフィールの投稿を待っています</p>
        </div>
      )}
    </motion.section>
  );
}
