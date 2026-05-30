/**
 * 成長の見える化（/stats）E2Eテスト
 *
 * 注意: Firebase Emulator が未導入のため CI では実行しない（ローカル確認のみ）。
 * Firebase Emulator 導入後にシナリオを有効化すること。
 */
import { test, expect } from '@playwright/test';

test.describe('成長の見える化 (/stats)', () => {
  test('正常系: /stats ページが表示される', async ({ page }) => {
    test.skip(true, 'Firebase Emulator 未導入のため CI スキップ');

    // ログイン済みユーザーで /stats にアクセスする
    await page.goto('/stats');

    // ヘッダー「成長の記録」が表示されることを確認する
    await expect(page.getByRole('banner').getByText('成長の記録')).toBeVisible();

    // 統計サマリーカードが4枚表示されることを確認する
    const cards = page.getByRole('region', { name: /の統計$/ });
    await expect(cards).toHaveCount(4);
  });

  test('正常系: タブ切り替えが機能する', async ({ page }) => {
    test.skip(true, 'Firebase Emulator 未導入のため CI スキップ');

    await page.goto('/stats');

    // 「試合」タブをクリックする
    await page.getByRole('tab', { name: '試合' }).click();

    // 試合グラフが表示されることを確認する
    await expect(page.getByText('月別試合結果')).toBeVisible();

    // 「練習」タブをクリックして練習グラフが表示されることを確認する
    await page.getByRole('tab', { name: '練習' }).click();
    await expect(page.getByText('月別練習回数と体調')).toBeVisible();
  });

  test('異常系: データ0件の空状態が表示される', async ({ page }) => {
    test.skip(true, 'Firebase Emulator 未導入のため CI スキップ');

    // 記録が0件のテストユーザーで /stats にアクセスする
    await page.goto('/stats');

    // 空状態メッセージが表示されることを確認する
    await expect(page.getByText('まだ記録がありません')).toBeVisible();
    await expect(page.getByText('練習ノートを書く')).toBeVisible();
  });

  test('正常系: BottomNav から /stats に遷移できる', async ({ page }) => {
    test.skip(true, 'Firebase Emulator 未導入のため CI スキップ');

    await page.goto('/dashboard');

    // BottomNav の「統計」タブをタップする
    await page.getByRole('link', { name: '統計' }).click();

    // /stats に遷移することを確認する
    await expect(page).toHaveURL('/stats');
    await expect(page.getByRole('banner').getByText('成長の記録')).toBeVisible();
  });

  test('モバイル: /stats ページがモバイルで正しく表示される', async ({ page }) => {
    test.skip(true, 'Firebase Emulator 未導入のため CI スキップ');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/stats');

    // ヘッダーが表示されることを確認する
    await expect(page.getByRole('banner').getByText('成長の記録')).toBeVisible();

    // サマリーカードが2列グリッドで表示されることを確認する（モバイルレイアウト）
    const gridContainer = page.locator('.grid-cols-2');
    await expect(gridContainer).toBeVisible();
  });
});
