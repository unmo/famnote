import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

// FirestoreのTimestampをDateに変換
export function timestampToDate(timestamp: Timestamp | null | undefined): Date | null {
  if (!timestamp) return null;
  return timestamp.toDate();
}

// 日付を「2026/04/17」形式にフォーマット
export function formatDate(date: Date | Timestamp | null | undefined): string {
  if (!date) return '';
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, 'yyyy/MM/dd', { locale: ja });
}

// 日付を「4月17日（木）」形式にフォーマット
export function formatDateJa(date: Date | Timestamp | null | undefined): string {
  if (!date) return '';
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, 'M月d日（E）', { locale: ja });
}

// 相対時間表示（「3時間前」「昨日」など）
export function formatRelativeTime(date: Date | Timestamp | null | undefined): string {
  if (!date) return '';
  const d = date instanceof Timestamp ? date.toDate() : date;

  if (isToday(d)) {
    return formatDistanceToNow(d, { addSuffix: true, locale: ja });
  } else if (isYesterday(d)) {
    return '昨日';
  } else {
    return format(d, 'M月d日', { locale: ja });
  }
}

// 今日の日付をinput[type=date]形式で返す
export function getTodayInputValue(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// 日付文字列をFirestore Timestampに変換
export function dateStringToTimestamp(dateString: string): Timestamp {
  return Timestamp.fromDate(new Date(dateString));
}
