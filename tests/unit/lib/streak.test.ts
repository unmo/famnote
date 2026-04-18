import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateStreak, getWeeklyStreakStatus, isStreakActive } from '@/lib/utils/streak';

// テスト環境ではタイムゾーン変換をバイパス（ローカル時刻をそのまま使用）
vi.mock('date-fns-tz', () => ({
  toZonedTime: vi.fn((date: Date) => new Date(date)),
}));

describe('calculateStreak', () => {
  const makeDate = (daysAgo: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  it('正常系: 空配列の場合はストリーク0を返す', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('正常系: 当日だけ記録がある場合はストリーク1を返す', () => {
    const dates = [makeDate(0)];
    expect(calculateStreak(dates)).toBe(1);
  });

  it('正常系: 連続した日付のリストでストリーク数が正しく計算される', () => {
    const dates = [makeDate(0), makeDate(1), makeDate(2), makeDate(3)];
    expect(calculateStreak(dates)).toBe(4);
  });

  it('正常系: 昨日の記録がある場合もストリーク継続と判定される', () => {
    const dates = [makeDate(1), makeDate(2), makeDate(3)];
    expect(calculateStreak(dates)).toBe(3);
  });

  it('異常系: 2日以上空いた場合、ストリークがリセットされる', () => {
    // 昨日以前の記録が途絶えている（3日前まで）
    const dates = [makeDate(3), makeDate(4), makeDate(5)];
    // 直近の記録が3日前なのでストリーク0
    expect(calculateStreak(dates)).toBe(0);
  });

  it('正常系: 重複する日付は1日としてカウントされる', () => {
    const today = makeDate(0);
    const today2 = new Date(today.getTime() + 1000); // 同日の別の時刻
    const yesterday = makeDate(1);
    expect(calculateStreak([today, today2, yesterday])).toBe(2);
  });

  it('異常系: 連続の途中で空いた場合、連続部分のみカウントされる', () => {
    // 今日・昨日は記録あり、3日前から連続あり（2日前は空き）
    const dates = [makeDate(0), makeDate(1), makeDate(3), makeDate(4)];
    // 今日・昨日の連続2日がカウントされる
    expect(calculateStreak(dates)).toBe(2);
  });
});

describe('getWeeklyStreakStatus', () => {
  const makeDate = (daysAgo: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  it('正常系: 7日分の配列を返す', () => {
    const status = getWeeklyStreakStatus([]);
    expect(status).toHaveLength(7);
  });

  it('正常系: 記録がある日はtrueになる', () => {
    const dates = [makeDate(0), makeDate(2)];
    const status = getWeeklyStreakStatus(dates);
    // 最後の要素（今日）がtrue
    expect(status[6]).toBe(true);
    // 5日前（インデックス1）はfalse
    expect(status[4]).toBe(true); // 2日前
  });

  it('正常系: 空配列の場合はすべてfalse', () => {
    const status = getWeeklyStreakStatus([]);
    expect(status.every((s) => s === false)).toBe(true);
  });
});

describe('isStreakActive', () => {
  it('正常系: nullの場合はfalseを返す', () => {
    expect(isStreakActive(null)).toBe(false);
  });

  it('正常系: 今日の日付はtrueを返す', () => {
    const today = new Date();
    expect(isStreakActive(today)).toBe(true);
  });

  it('正常系: 昨日の日付はtrueを返す', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isStreakActive(yesterday)).toBe(true);
  });

  it('異常系: 2日前の日付はfalseを返す', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    expect(isStreakActive(twoDaysAgo)).toBe(false);
  });
});
