import { test, expect } from '@playwright/test';

test.describe('練習ノート機能', () => {
  // 認証が必要なため、テスト前にログイン状態を準備する
  // 実際のFirebase認証は統合テスト環境で行う
  // ここではUIの振る舞いをテスト

  test('正常系: ノート一覧ページへの未認証アクセスはログインにリダイレクトされる', async ({ page }) => {
    await page.goto('/notes');
    await expect(page).toHaveURL(/\/login/);
  });

  test('正常系: 新規ノート作成ページへの未認証アクセスはログインにリダイレクトされる', async ({ page }) => {
    await page.goto('/notes/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('正常系: ログインページが正常に表示される', async ({ page }) => {
    await page.goto('/login');
    // FamNoteのブランドが表示されていることを確認
    await expect(page.getByRole('heading', { name: 'FamNote' })).toBeVisible();
  });
});
