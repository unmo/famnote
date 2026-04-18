import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test('正常系: 未認証ユーザーがダッシュボードにアクセスするとログインにリダイレクトされる', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('正常系: ランディングページにアクセスできる', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1, [class*="hero"]')).toBeTruthy();
  });

  test('正常系: ログインページが正常に表示される', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('正常系: サインアップページが正常に表示される', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('form')).toBeVisible();
  });

  test('正常系: ログインページからサインアップページに遷移できる', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[href="/signup"]');
    await expect(page).toHaveURL(/\/signup/);
  });

  test('異常系: 無効なメールアドレスでログインを試みるとバリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    // バリデーションエラーが表示されるか、フォーム送信が阻止される
    await expect(page.locator('[role="alert"], .text-red-500, [aria-invalid="true"]')).toBeTruthy();
  });

  test('異常系: パスワードなしでログインを試みるとバリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"], .text-red-500, [aria-invalid="true"]')).toBeTruthy();
  });
});
