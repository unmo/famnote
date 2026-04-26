import { z } from 'zod';
import { SPORTS } from '@/types/sport';

const bulletTextSchema = z.string().min(1).max(100);

export const preMatchSchema = z.object({
  sport: z.enum(SPORTS),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付はYYYY-MM-DD形式で入力してください'),
  opponent: z.string().min(1, '対戦相手を入力してください').max(50, '50文字以内で入力してください'),
  venue: z.string().max(50, '50文字以内で入力してください').nullable(),
  goals: z
    .array(bulletTextSchema)
    .min(1, '目標を1件以上入力してください')
    .max(10, '目標は最大10件まで入力できます'),
  challenges: z.array(z.string().max(100)).max(5, 'チャレンジしたいことは最大5件まで入力できます'),
});

export const goalReviewSchema = z.object({
  goalItemId: z.string(),
  achievement: z.enum(['achieved', 'partial', 'not_achieved']),
  comment: z.string().max(50).nullable(),
});

export const postMatchSchema = z.object({
  result: z.enum(['win', 'draw', 'loss']).nullable(),
  myScore: z.number().int().min(0).nullable(),
  opponentScore: z.number().int().min(0).nullable(),
  goalReviews: z.array(goalReviewSchema),
  achievements: z.array(z.string().max(100)).max(10),
  improvements: z.array(z.string().max(100)).max(10),
  explorations: z.array(z.string().max(100)).max(5),
  performance: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).nullable(),
});

export type PreMatchSchemaType = z.infer<typeof preMatchSchema>;
export type PostMatchSchemaType = z.infer<typeof postMatchSchema>;
