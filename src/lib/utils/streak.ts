import { isSameDay, isYesterday, differenceInCalendarDays, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// 日本時間タイムゾーン
const JAPAN_TZ = 'Asia/Tokyo';

// 日付を日本時間に変換
function toJapanDate(date: Date): Date {
  try {
    return toZonedTime(date, JAPAN_TZ);
  } catch {
    // date-fns-tzが利用できない場合はJST（UTC+9）で近似
    return new Date(date.getTime() + 9 * 60 * 60 * 1000);
  }
}

// 日本時間での今日の日付を取得
export function getJapanToday(): Date {
  return toJapanDate(new Date());
}

// タイムスタンプ（または日付文字列）から日本時間の日付を取得
export function toJapanDateFromTimestamp(timestamp: number | string | Date): Date {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
  return toJapanDate(date);
}

// ストリーク計算
// recordDates: 記録のある日付（日本時間）の配列（重複可・ソート不要）
export function calculateStreak(recordDates: Date[]): number {
  if (recordDates.length === 0) return 0;

  const today = getJapanToday();

  // 日付のみ（時刻を除く）に正規化してユニーク化
  const uniqueDates = [
    ...new Set(
      recordDates.map((d) => {
        const jd = toJapanDate(d);
        return `${jd.getFullYear()}-${jd.getMonth()}-${jd.getDate()}`;
      })
    ),
  ]
    .map((str) => {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m, d);
    })
    .sort((a, b) => b.getTime() - a.getTime()); // 降順

  // 直近の記録が当日または昨日でなければストリーク0
  const latestDate = uniqueDates[0];
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = differenceInCalendarDays(todayNormalized, latestDate);

  if (diff > 1) return 0; // 2日以上空いている

  // 連続日数をカウント
  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const dayDiff = differenceInCalendarDays(uniqueDates[i], uniqueDates[i + 1]);
    if (dayDiff === 1) {
      streak++;
    } else {
      break; // 連続が途切れたら終了
    }
  }

  return streak;
}

// 今日または昨日に記録があるかチェック（ストリーク継続判定）
export function isStreakActive(lastRecordedDate: Date | null): boolean {
  if (!lastRecordedDate) return false;
  const japanDate = toJapanDate(lastRecordedDate);
  const today = getJapanToday();
  return isSameDay(japanDate, today) || isYesterday(japanDate);
}

// 週7日分のストリーク状態を返す（ボトムナビのドット表示用）
export function getWeeklyStreakStatus(recordDates: Date[]): boolean[] {
  const today = getJapanToday();
  const result: boolean[] = [];

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);

    const hasRecord = recordDates.some((d) => {
      const japanDate = toJapanDate(d);
      return isSameDay(japanDate, targetDate);
    });

    result.push(hasRecord);
  }

  return result;
}
