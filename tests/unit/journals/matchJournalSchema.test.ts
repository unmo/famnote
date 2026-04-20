import { describe, it, expect } from 'vitest';
import { preMatchSchema, postMatchSchema } from '@/lib/validations/matchJournalSchema';

describe('preMatchSchema', () => {
  const validData = {
    sport: 'soccer' as const,
    date: '2026-04-18',
    opponent: 'テストFC',
    venue: null,
    goals: ['目標1', '目標2'],
    challenges: [],
    isPublic: true,
  };

  it('正常系: 有効なデータがパースされる', () => {
    const result = preMatchSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('異常系: 対戦相手が空文字でエラー', () => {
    const result = preMatchSchema.safeParse({ ...validData, opponent: '' });
    expect(result.success).toBe(false);
  });

  it('異常系: 目標が0件でエラー', () => {
    const result = preMatchSchema.safeParse({ ...validData, goals: [] });
    expect(result.success).toBe(false);
  });

  it('異常系: 目標が11件でエラー', () => {
    const goals = Array.from({ length: 11 }, (_, i) => `目標${i + 1}`);
    const result = preMatchSchema.safeParse({ ...validData, goals });
    expect(result.success).toBe(false);
  });

  it('正常系: 目標が10件で成功', () => {
    const goals = Array.from({ length: 10 }, (_, i) => `目標${i + 1}`);
    const result = preMatchSchema.safeParse({ ...validData, goals });
    expect(result.success).toBe(true);
  });

  it('異常系: 対戦相手が51文字でエラー', () => {
    const result = preMatchSchema.safeParse({ ...validData, opponent: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('異常系: 日付フォーマット不正でエラー', () => {
    const result = preMatchSchema.safeParse({ ...validData, date: '2026/04/18' });
    expect(result.success).toBe(false);
  });

  it('異常系: 不正なスポーツ種別でエラー', () => {
    const result = preMatchSchema.safeParse({ ...validData, sport: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('postMatchSchema', () => {
  const validPost = {
    result: 'win' as const,
    myScore: 3,
    opponentScore: 1,
    goalReviews: [],
    achievements: ['できたこと1'],
    improvements: [],
    explorations: [],
    performance: 4 as const,
    isPublic: true,
  };

  it('正常系: 有効な試合後データがパースされる', () => {
    const result = postMatchSchema.safeParse(validPost);
    expect(result.success).toBe(true);
  });

  it('正常系: resultがnullでも成功', () => {
    const result = postMatchSchema.safeParse({ ...validPost, result: null });
    expect(result.success).toBe(true);
  });

  it('異常系: achievementsが11件でエラー', () => {
    const achievements = Array.from({ length: 11 }, (_, i) => `できたこと${i + 1}`);
    const result = postMatchSchema.safeParse({ ...validPost, achievements });
    expect(result.success).toBe(false);
  });

  it('異常系: performanceが6でエラー', () => {
    const result = postMatchSchema.safeParse({ ...validPost, performance: 6 });
    expect(result.success).toBe(false);
  });
});
