import type { Timestamp } from 'firebase/firestore';

/** Firestoreのpurchasesコレクション型（監査ログ） */
export interface PurchaseDocument {
  id: string;
  userId: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  /** 決済金額（円）: 480 */
  amountTotal: number;
  currency: string;
  /** 購入パック数: 1 */
  packCount: number;
  /** 追加されたノート件数: 100 */
  noteCountAdded: number;
  purchasedCountBefore: number;
  purchasedCountAfter: number;
  status: 'succeeded';
  createdAt: Timestamp;
}
