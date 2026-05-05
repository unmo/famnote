import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, User, BookOpen, NotebookPen, Trophy, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { NotificationBadge } from './NotificationBadge';
import { useUnreadCount, useUnreadNotifications, useMarkAllAsRead, useMarkAsRead } from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/lib/utils/date';
import type { Notification, NotificationContentType, NotificationActionType } from '@/types/notification';

// contentType 別アイコン・ラベルの定義
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

// 通知パネル内の単一アイテム
interface NotificationItemProps {
  notification: Notification;
  onNavigate: (notification: Notification) => void;
}

function NotificationItem({ notification, onNavigate }: NotificationItemProps) {
  const config = CONTENT_TYPE_CONFIG[notification.contentType];

  return (
    <motion.button
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      onClick={() => onNavigate(notification)}
      role="button"
      tabIndex={0}
      aria-label={`${notification.senderDisplayName}の${config.label}「${notification.contentTitle}」${!notification.isRead ? '（未読）' : ''}`}
      className={`
        w-full text-left px-4 py-3 flex items-start gap-3 transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:rounded-xl
        ${notification.isRead
          ? 'hover:bg-zinc-800'
          : 'bg-sky-500/5 hover:bg-sky-500/10'
        }
      `}
    >
      {/* アバター */}
      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-zinc-700 flex items-center justify-center">
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
        <p className="text-xs text-zinc-400 leading-snug">
          <span className="font-medium text-zinc-200">{notification.senderDisplayName}</span>
          {' が '}
          <span className="text-zinc-300">{config.label}</span>
          {' を '}
          {ACTION_LABELS[notification.actionType]}
        </p>
        <p className="text-xs font-medium text-zinc-300 truncate mt-0.5 max-w-[180px]">
          {notification.contentTitle}
        </p>
        <p className="text-[10px] text-zinc-500 mt-0.5">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* 未読インジケーター */}
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 mt-1.5" aria-hidden="true" />
      )}
    </motion.button>
  );
}

interface NotificationBellButtonProps {
  recipientProfileUid: string | undefined;
}

/**
 * ヘッダーに配置するベルアイコン＋通知パネルのコンポーネント。
 * パネル外クリック・ESCキーで閉じる。
 */
export function NotificationBellButton({ recipientProfileUid }: NotificationBellButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const { count: unreadCount } = useUnreadCount(recipientProfileUid);
  const { data: notifications = [] } = useUnreadNotifications(recipientProfileUid, 5);
  const markAllAsReadMutation = useMarkAllAsRead();
  const markAsReadMutation = useMarkAsRead();

  // パネル外クリックで閉じる
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleMouseDown);
    }
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleMarkAllAsRead = async () => {
    if (!recipientProfileUid || unreadCount === 0) return;
    try {
      await markAllAsReadMutation.mutateAsync(recipientProfileUid);
      toast.success('すべて既読にしました', { duration: 2000 });
    } catch {
      toast.error('既読化に失敗しました', { duration: 3000 });
    }
  };

  const handleNavigate = async (notification: Notification) => {
    setIsOpen(false);
    // 既読化は非同期で行い、ナビゲーションをブロックしない
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    const config = CONTENT_TYPE_CONFIG[notification.contentType];
    navigate(`${config.path}/${notification.contentId}`);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`通知を開く（${unreadCount}件の未読）`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="relative p-1.5 md:p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <Bell className="w-5 h-5" />
        <NotificationBadge
          count={unreadCount}
          positionClassName="absolute top-0.5 right-0.5"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="通知パネル"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full right-0 mt-2 z-50 w-80 max-h-96 overflow-y-auto rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl shadow-black/40"
          >
            {/* パネルヘッダー */}
            <div className="flex items-center justify-between h-12 px-4 border-b border-zinc-800">
              <span className="text-sm font-semibold text-zinc-50">通知</span>
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
                aria-label="すべての通知を既読にする"
                aria-disabled={unreadCount === 0}
                className="text-xs text-sky-400 hover:text-sky-300 transition-colors disabled:text-zinc-600 disabled:cursor-not-allowed"
              >
                {markAllAsReadMutation.isPending ? '...' : 'すべて既読にする'}
              </button>
            </div>

            {/* 通知リスト */}
            {notifications.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-2 text-center">
                <Bell className="w-8 h-8 text-zinc-700" />
                <p className="text-xs text-zinc-500">新しい通知はありません</p>
              </div>
            ) : (
              <div>
                {notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} onNavigate={handleNavigate} />
                ))}
              </div>
            )}

            {/* フッター */}
            <div className="border-t border-zinc-800">
              <button
                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                className="w-full h-10 px-4 flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <span>すべての通知を見る</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
