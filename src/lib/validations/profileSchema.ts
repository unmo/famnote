import { z } from 'zod';
import { SPORTS } from '@/types/sport';

// プロフィール設定フォームのバリデーション
export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, '名前を入力してください')
    .max(20, '20文字以内で入力してください'),
  sports: z
    .array(z.enum(SPORTS))
    .min(1, '最低1つのスポーツを選択してください'),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

