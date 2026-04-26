import { z } from 'zod';

// グループ作成フォームのバリデーション
export const createGroupSchema = z.object({
  groupName: z
    .string()
    .min(1, 'グループ名を入力してください')
    .max(30, '30文字以内で入力してください'),
});

export type CreateGroupSchema = z.infer<typeof createGroupSchema>;

// グループ参加フォームのバリデーション
export const joinGroupSchema = z.object({
  inviteCode: z
    .string()
    .min(6, '招待コードを入力してください')
    .max(6, '招待コードは6文字です')
    .regex(/^[A-Z0-9]{6}$/, '招待コードは半角英数字6文字です'),
});

export type JoinGroupSchema = z.infer<typeof joinGroupSchema>;

// 目標作成フォームのバリデーション
export const goalSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(100, '100文字以内で入力してください'),
  description: z.string().max(300, '300文字以内で入力してください').nullable().optional(),
  sport: z.string().min(1, 'スポーツ種目を選択してください'),
  goalType: z.enum(['practice_count', 'match_appearance', 'skill_acquisition']),
  targetValue: z
    .number()
    .min(1, '1以上の数値を入力してください')
    .max(9999, '9999以下の数値を入力してください')
    .nullable()
    .optional(),
  deadline: z.string().min(1, '期限を設定してください'),
});

export type GoalSchema = z.infer<typeof goalSchema>;
