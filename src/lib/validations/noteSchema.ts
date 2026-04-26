import { z } from 'zod';
import { SPORTS } from '@/types/sport';
import { getTodayInputValue } from '@/lib/utils/date';

// ノート作成・編集フォームのバリデーションスキーマ
export const noteSchema = z.object({
  sport: z.enum(SPORTS, { errorMap: () => ({ message: 'スポーツ種目を選択してください' }) }),
  date: z
    .string()
    .min(1, '日付を入力してください')
    .refine((val) => {
      // 未来日は不可
      return val <= getTodayInputValue();
    }, '未来の日付は選択できません'),
  durationMinutes: z
    .number()
    .min(1, '1以上の数値を入力してください')
    .max(600, '600分以内で入力してください')
    .nullable()
    .optional(),
  location: z.string().max(100, '100文字以内で入力してください').nullable().optional(),
  todayGoal: z.string().max(200, '200文字以内で入力してください').nullable().optional(),
  content: z
    .string()
    .min(1, '練習内容を入力してください')
    .max(1000, '1000文字以内で入力してください'),
  reflection: z.string().max(500, '500文字以内で入力してください').nullable().optional(),
  condition: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).nullable().optional(),
});

export type NoteSchema = z.infer<typeof noteSchema>;
