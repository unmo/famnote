import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

export type NotificationContentType = 'note' | 'matchJournal' | 'match';
export type NotificationActionType = 'created' | 'updated';

export interface Notification {
  id: string;
  groupId: string;
  senderProfileUid: string;
  senderDisplayName: string;
  senderAvatarUrl: string | null;
  recipientProfileUid: string;
  contentType: NotificationContentType;
  contentId: string;
  contentTitle: string;
  actionType: NotificationActionType;
  isRead: boolean;
  createdAt: Timestamp;
  readAt: Timestamp | null;
}

export interface UnreadCountByProfile {
  profileUid: string;
  count: number;
}

// 通知作成の入力バリデーションスキーマ
export const createNotificationSchema = z.object({
  groupId: z.string().min(1),
  senderProfileUid: z.string().min(1),
  senderDisplayName: z.string().min(1).max(50),
  senderAvatarUrl: z.string().url().nullable(),
  recipientProfileUids: z.array(z.string().min(1)).min(1).max(10),
  contentType: z.enum(['note', 'matchJournal', 'match']),
  contentId: z.string().min(1),
  contentTitle: z.string().min(1).max(50),
  actionType: z.enum(['created', 'updated']),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
