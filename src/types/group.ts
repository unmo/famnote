import { Timestamp } from 'firebase/firestore';
import { Sport } from './sport';

// Firestoreのgroupsコレクション型
export interface Group {
  id: string;
  name: string;
  iconUrl: string | null;
  inviteCode: string;
  ownerUid: string;
  memberCount: number;
  maxMembers: number; // 固定: 10
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// グループメンバー型
export interface GroupMember {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  sports: Sport[];
  joinedAt: Timestamp;
  role: 'owner' | 'member';
  lastActiveAt: Timestamp | null;
  // Firebase Auth アカウントを持たない仮想プロフィール（子供など）かどうかを示すフラグ
  isChildProfile?: boolean;
}

// 招待コード型
export interface InviteCode {
  code: string;
  groupId: string;
  createdAt: Timestamp;
  expiresAt: Timestamp | null;
}
