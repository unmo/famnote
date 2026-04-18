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

// ログインフォームのバリデーション
export const loginSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

// サインアップフォームのバリデーション
export const signupSchema = z
  .object({
    displayName: z
      .string()
      .min(1, '名前を入力してください')
      .max(20, '20文字以内で入力してください'),
    email: z.string().email('正しいメールアドレスを入力してください'),
    password: z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください')
      .regex(/[A-Z]/, '大文字を1文字以上含めてください')
      .regex(/[a-z]/, '小文字を1文字以上含めてください')
      .regex(/[0-9]/, '数字を1文字以上含めてください'),
    confirmPassword: z.string(),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: '利用規約・プライバシーポリシーへの同意が必要です' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

export type SignupSchema = z.infer<typeof signupSchema>;
