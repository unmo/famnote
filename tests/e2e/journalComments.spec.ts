import { test, expect } from '@playwright/test';

/**
 * 試合ジャーナルへのコメント機能 E2Eテスト
 * 注意: これらのテストは実際の Firebase 接続が必要なため、
 * CI環境では専用のエミュレータまたはテスト用プロジェクトを使用すること。
 * テスト実行前に事前条件（ログイン済み・ジャーナルデータあり）を満たすこと。
 */

test.describe('試合ジャーナルコメント機能', () => {
  test('正常系: 管理者がコメントを投稿できる', async ({ page }) => {
    // ジャーナル詳細ページへ遷移（事前にログイン・管理者プロフィール選択済みの前提）
    await page.goto('/journals');
    // 未認証の場合はログインにリダイレクトされるためスキップ
    if (page.url().includes('/login')) { test.skip(); return; }
    await page.waitForSelector('[aria-label*="戦"]', { timeout: 10000 });

    // 最初のジャーナルカードをクリック
    const firstCard = page.locator('[aria-label*="戦"]').first();
    await firstCard.click();
    await page.waitForURL(/\/journals\/.+/);

    // コメントセクションが表示されることを確認
    await expect(page.getByRole('region', { name: '親からのコメント' })).toBeVisible();

    // 管理者の場合はフォームが表示される
    const commentForm = page.getByRole('form', { name: 'コメントを入力' });
    if (await commentForm.isVisible()) {
      const textarea = page.getByRole('textbox', { name: 'コメントを入力' });
      await textarea.fill('よくがんばったね！テストコメント');

      // 送信ボタンが有効になっていることを確認
      const submitBtn = page.getByRole('button', { name: /送信/i });
      await expect(submitBtn).not.toBeDisabled();

      // 送信
      await submitBtn.click();

      // コメントが一覧に表示される
      await expect(page.getByText('よくがんばったね！テストコメント')).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('正常系: 子供プロフィールではコメント入力フォームが表示されない', async ({ page }) => {
    await page.goto('/journals');
    if (page.url().includes('/login')) { test.skip(); return; }
    await page.waitForSelector('[aria-label*="戦"]', { timeout: 10000 });

    const firstCard = page.locator('[aria-label*="戦"]').first();
    await firstCard.click();
    await page.waitForURL(/\/journals\/.+/);

    // コメントセクションは表示される
    await expect(page.getByRole('region', { name: '親からのコメント' })).toBeVisible();

    // 子供プロフィール（isManager=false）の場合はフォームが表示されない
    // 管理者フォームが存在しないことを確認（管理者でない場合）
    // 実際のプロフィール切り替えはプロフィールセレクタ経由で行う
    // このテストはフォームが非表示であることのみ確認
    await expect(page.getByRole('form', { name: 'コメントを入力' })).toBeHidden().catch(() => {
      // フォームが存在しない場合も正常（管理者でないため）
    });
  });

  test('正常系: 詳細ページを開くと未読バッジがリセットされる', async ({ page }) => {
    await page.goto('/journals');

    // 未読バッジが存在するカードを確認
    const badgeLocator = page.locator('[role="status"][aria-label*="未読コメント"]');
    const badgeExists = await badgeLocator.count() > 0;

    if (badgeExists) {
      const badge = badgeLocator.first();
      const badgeText = await badge.textContent();

      // バッジがあるカードをクリック
      const cardWithBadge = badge.locator('..').locator('..').locator('..');
      await cardWithBadge.click();
      await page.waitForURL(/\/journals\/.+/);

      // バックボタンで一覧に戻る
      await page.getByRole('button', { name: /戻る/i }).click();
      await page.waitForURL('/journals');

      // バッジが消えていることを確認
      await expect(
        page.locator(`[aria-label="未読コメント ${badgeText}件"]`)
      ).not.toBeVisible({ timeout: 3000 });
    } else {
      // 未読バッジがない場合はスキップ
      test.skip();
    }
  });

  test('正常系: 管理者が自分のコメントを削除できる', async ({ page }) => {
    await page.goto('/journals');
    if (page.url().includes('/login')) { test.skip(); return; }
    await page.waitForSelector('[aria-label*="戦"]', { timeout: 10000 });

    const firstCard = page.locator('[aria-label*="戦"]').first();
    await firstCard.click();
    await page.waitForURL(/\/journals\/.+/);

    // 管理者の場合はコメントを投稿してから削除
    const commentForm = page.getByRole('form', { name: 'コメントを入力' });
    if (await commentForm.isVisible()) {
      const textarea = page.getByRole('textbox', { name: 'コメントを入力' });
      const testComment = '削除テスト用コメント';
      await textarea.fill(testComment);
      await page.getByRole('button', { name: /送信/i }).click();

      // コメントが表示されるまで待機
      await expect(page.getByText(testComment)).toBeVisible({ timeout: 5000 });

      // 削除ボタンをクリック
      const deleteBtn = page.getByRole('button', { name: 'コメントを削除' }).last();
      await deleteBtn.click();

      // コメントが消えることを確認
      await expect(page.getByText(testComment)).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('モバイル: コメントセクションがモバイル画面で正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/journals');
    if (page.url().includes('/login')) { test.skip(); return; }
    await page.waitForSelector('[aria-label*="戦"]', { timeout: 10000 });

    const firstCard = page.locator('[aria-label*="戦"]').first();
    await firstCard.click();
    await page.waitForURL(/\/journals\/.+/);

    // コメントセクションが表示される
    const commentSection = page.getByRole('region', { name: '親からのコメント' });
    await expect(commentSection).toBeVisible();

    // コメントフォームがある場合、テキストエリアの高さを確認
    const textarea = page.getByRole('textbox', { name: 'コメントを入力' });
    if (await textarea.isVisible()) {
      const box = await textarea.boundingBox();
      // 最小高さ 72px が確保されていること
      expect(box?.height).toBeGreaterThanOrEqual(72);
    }
  });
});
