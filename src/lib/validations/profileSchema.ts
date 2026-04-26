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

// プロフィール名前編集フォームのバリデーション（スポーツ選択なし版）
export const profileEditSchema = z.object({
  displayName: z
    .string()
    .min(1, '名前は必須です')
    .max(20, '名前は20文字以内で入力してください')
    .trim(),
});

export type ProfileEditSchema = z.infer<typeof profileEditSchema>;

// 子プロフィール追加フォームのバリデーション
export const addChildProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, '名前は必須です')
    .max(20, '名前は20文字以内で入力してください')
    .trim(),
});

export type AddChildProfileSchema = z.infer<typeof addChildProfileSchema>;

