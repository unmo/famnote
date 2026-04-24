import { test, expect } from '@playwright/test';

/**
 * プロフィール選択・切り替えのE2Eテスト
 *
 * 注意: Firebase認証を経由するため、実際のE2Eでは認証状態をモックするか
 * テスト用アカウントを使用する必要があります。
 * 現時点では未認証状態からのリダイレクトのみ検証します。
 */
test.describe('プロフィール選択フロー', () => {
  test('正常系: 未認証ユーザーが/select-profileにアクセスするとログインにリダイレクトされる', async ({ page }) => {
    await page.goto('/select-profile');
    // 未認証状態では /login にリダイレクトされる
    await expect(page).toHaveURL(/\/login/);
  });

  test('正常系: 未認証ユーザーが/dashboardにアクセスするとログインにリダイレクトされる', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('正常系: /select-profileページのURLが存在する（ログイン後のリダイレクト先として機能する）', async ({ page }) => {
    // 未認証状態でアクセスすると /login にリダイレクトされることを確認
    await page.goto('/select-profile');
    await expect(page).toHaveURL(/\/login/);
    // ログインページが表示されていることを確認
    await expect(page.getByRole('button', { name: /Googleでログイン/i })).toBeVisible();
  });

  test('モバイル: 未認証ユーザーがモバイルで/select-profileにアクセスするとログインにリダイレクトされる', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/select-profile');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /Googleでログイン/i })).toBeVisible();
  });
});

test.describe('ProfileSelectPage UI', () => {
  /**
   * 実際の認証を使ったテストはCI/CDでFirebase Emulatorを使用して実行することを推奨。
   * ここではページの構造・アクセシビリティを主に検証する。
   */
  test('正常系: ログインページからFamNoteブランドが確認できる', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('FamNote')).toBeVisible();
  });

  test('異常系: 存在しないルートにアクセスすると適切に処理される', async ({ page }) => {
    await page.goto('/select-profile/invalid');
    // 未認証なので /login にリダイレクトされる
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('ProfileSwitcher（ヘッダー）', () => {
  test('正常系: 未認証状態でダッシュボードにアクセスするとリダイレクトされる（ProfileSwitcherは非表示）', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    // ダッシュボードのヘッダー（ProfileSwitcherを含む）は表示されない
    await expect(page.locator('[aria-label*="現在のプロフィール"]')).not.toBeVisible();
  });

  test('モバイル: ダッシュボードへの未認証アクセスはモバイルでも同様にリダイレクトされる', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
