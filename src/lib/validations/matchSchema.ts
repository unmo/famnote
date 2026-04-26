import { z } from 'zod';
import { SPORTS } from '@/types/sport';
import { getTodayInputValue } from '@/lib/utils/date';

// 試合記録作成・編集フォームのバリデーションスキーマ
export const matchSchema = z.object({
  sport: z.enum(SPORTS, { errorMap: () => ({ message: 'スポーツ種目を選択してください' }) }),
  date: z
    .string()
    .min(1, '日付を入力してください')
    .refine((val) => val <= getTodayInputValue(), '未来の日付は選択できません'),
  opponent: z
    .string()
    .min(1, '対戦相手を入力してください')
    .max(100, '100文字以内で入力してください'),
  venue: z.string().max(100, '100文字以内で入力してください').nullable().optional(),
  myScore: z
    .number()
    .min(0, '0以上の数値を入力してください')
    .max(999, '999以下の数値を入力してください')
    .nullable()
    .optional(),
  opponentScore: z
    .number()
    .min(0, '0以上の数値を入力してください')
    .max(999, '999以下の数値を入力してください')
    .nullable()
    .optional(),
  result: z.enum(['win', 'draw', 'loss']).nullable().optional(),
  position: z.string().max(50, '50文字以内で入力してください').nullable().optional(),
  playingTimeMinutes: z
    .number()
    .min(0, '0以上の数値を入力してください')
    .max(300, '300以内で入力してください')
    .nullable()
    .optional(),
  performance: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).nullable().optional(),
  highlight: z.string().max(500, '500文字以内で入力してください').nullable().optional(),
  improvements: z.string().max(500, '500文字以内で入力してください').nullable().optional(),
});

export type MatchSchema = z.infer<typeof matchSchema>;
