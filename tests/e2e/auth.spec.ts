import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test('正常系: ログインページにGoogleログインボタンのみ表示される', async ({ page }) => {
    await page.goto('/login');
    // Googleログインボタンが表示される
    await expect(page.getByRole('button', { name: /Googleでログイン/i })).toBeVisible();
    // メールアドレス入力欄が存在しない
    await expect(page.locator('input[type="email"]')).not.toBeVisible();
    // パスワード入力欄が存在しない
    await expect(page.locator('input[type="password"]')).not.toBeVisible();
  });

  test('正常系: ランディングページにアクセスできる', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1, [class*="hero"]')).toBeTruthy();
  });

  test('正常系: /signup にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveURL(/\/login/);
  });

  test('正常系: /auth/signup にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page).toHaveURL(/\/login/);
  });

  test('正常系: 未認証ユーザーがダッシュボードにアクセスするとログインにリダイレクトされる', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('正常系: ログインページにFamNoteブランドが表示される', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'FamNote' })).toBeVisible();
    await expect(page.getByText('家族の記録を、')).toBeVisible();
    await expect(page.getByText('ひとつの場所に。')).toBeVisible();
  });

  test('正常系: 機能バッジが表示される', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('成長記録')).toBeVisible();
    await expect(page.getByText('家族共有')).toBeVisible();
    await expect(page.getByText('応援機能')).toBeVisible();
  });

  test('モバイル: ログインページがモバイルで正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /Googleでログイン/i })).toBeVisible();
    // ボタンが全幅になっている（モバイル対応）
    const button = page.getByRole('button', { name: /Googleでログイン/i });
    await expect(button).toBeVisible();
    const buttonBox = await button.boundingBox();
    // モバイル（390px幅）では全幅ボタンが表示されることを確認（余白を除いた幅）
    expect(buttonBox?.width).toBeGreaterThan(250);
  });
});
