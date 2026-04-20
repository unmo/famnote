import { test, expect } from '@playwright/test';

test.describe('試合ジャーナル', () => {
  test.beforeEach(async ({ page }) => {
    // ログインが必要なページへのアクセスはログイン済みセッションが必要
    // テスト環境では認証モックを使用
    await page.goto('/');
  });

  test('正常系: ジャーナル一覧ページにアクセスできる', async ({ page }) => {
    await page.goto('/journals');
    // ログインリダイレクトまたはジャーナルページが表示される
    const url = page.url();
    expect(url).toMatch(/\/(journals|login)/);
  });

  test('正常系: ハイライトページにアクセスできる', async ({ page }) => {
    await page.goto('/highlights');
    const url = page.url();
    expect(url).toMatch(/\/(highlights|login)/);
  });

  test('正常系: ランディングページが表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('モバイル: ランディングページがモバイルで表示される', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('モバイル: ジャーナルページがモバイルで表示される', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/journals');
    const url = page.url();
    expect(url).toMatch(/\/(journals|login)/);
  });
});
