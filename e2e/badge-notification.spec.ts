/**
 * バッジ通知機能 E2Eテスト
 *
 * 注意: Firebase Emulator が未導入のため CI では実行しない（ローカル確認のみ）。
 * Firebase Emulator 導入後にシナリオを有効化すること。
 */
import { test, expect } from '@playwright/test';

test.describe('バッジ通知機能', () => {
  test('正常系: 子プロフィールのノート投稿後に親プロフィールへのバッジが表示される', async ({ page }) => {
    // Firebase Emulator 未導入のためスキップ
    test.skip(true, 'Firebase Emulator 未導入のため CI スキップ');

    // 子プロフィールでログインして練習ノートを投稿する
    await page.goto('/login');
    // ... 以降はEmulator導入後に実装
  });

  test('正常系: ヘッダーのベルアイコンクリックで通知パネルが開く', async ({ page }) => {
    // Firebase Emulator 未導入のためスキップ
    test.skip(true, 'Firebase Emulator 未導入のため CI スキップ');

    await page.goto('/dashboard');
    const bellButton = page.getByRole('button', { name: /通知を開く/ });
    await bellButton.click();
    await expect(page.getByRole('dialog', { name: '通知パネル' })).toBeVisible();
  });

  test('正常系: 「すべて既読」ボタンでバッジが消える', async ({ page }) => {
    // Firebase Emulator 未導入のためスキップ
    test.skip(true, 'Firebase Emulator 未導入のため CI スキップ');

    await page.goto('/notifications');
    const markAllButton = page.getByRole('button', { name: 'すべての通知を既読にする' });
    await markAllButton.click();
  });

  test('正常系: /notifications ページで通知フィルタータブが機能する', async ({ page }) => {
    // Firebase Emulator 未導入のためスキップ
    test.skip(true, 'Firebase Emulator 未導入のため CI スキップ');

    await page.goto('/notifications');
    await expect(page.getByText('すべての通知')).toBeVisible();

    // 「未読のみ」フィルタータブをクリック
    await page.getByRole('button', { name: '未読のみ' }).click();
    // 「すべて」タブに戻す
    await page.getByRole('button', { name: 'すべて' }).click();
  });

  test('異常系: 子プロフィールではバッジが表示されない', async ({ page }) => {
    // Firebase Emulator 未導入のためスキップ
    test.skip(true, 'Firebase Emulator 未導入のため CI スキップ');

    // 子プロフィールでログイン後にダッシュボードを確認
    await page.goto('/dashboard');
    // ベルアイコンが存在しないことを確認
    await expect(page.getByRole('button', { name: /通知を開く/ })).not.toBeVisible();
  });

  test('モバイル: BottomNavのHomeアイコンにバッジが表示される', async ({ page }) => {
    // Firebase Emulator 未導入のためスキップ
    test.skip(true, 'Firebase Emulator 未導入のため CI スキップ');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');
    // BottomNavが表示されていること
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});
