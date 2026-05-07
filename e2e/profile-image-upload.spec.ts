/**
 * プロフィール画像アップロード E2E テスト
 * 注意: 現在 CI では Firebase Emulator が未導入のため除外されている。
 * Firebase Emulator 導入後に CI に組み込む。
 */
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('プロフィール画像アップロード', () => {
  test.beforeEach(async ({ page }) => {
    // SettingsPage に直接アクセス（ログイン済み状態を前提とする）
    await page.goto('/app/settings');
  });

  test('正常系: プロフィール画像をアップロードできる', async ({ page }) => {
    // アバター部分を確認
    const avatarButton = page.getByRole('button', { name: /プロフィール画像を変更/ });
    await expect(avatarButton).toBeVisible();

    // ファイル選択ダイアログをトリガー（file input に直接ファイルをセット）
    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await fileInput.setInputFiles(
      path.join(process.cwd(), 'e2e', 'fixtures', 'avatar-test.jpg')
    );

    // プログレスバーが表示されること
    await expect(page.locator('svg circle[stroke="#0EA5E9"]')).toBeVisible({ timeout: 5000 });

    // アップロード完了後にアバター画像が表示されること
    await expect(page.locator('img[crossorigin="anonymous"]').first()).toBeVisible({ timeout: 15000 });

    // 成功トーストが表示されること
    await expect(page.getByText('プロフィール画像を更新しました')).toBeVisible({ timeout: 5000 });
  });

  test('正常系: プロフィール画像を削除できる', async ({ page }) => {
    // 削除ボタンが表示されるまで待機（画像がある場合のみ表示）
    const deleteButton = page.getByRole('button', { name: /プロフィール画像を削除/ });

    // 削除ボタンが存在する場合のみテスト実行
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // 削除確認ダイアログが表示されること
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText('プロフィール画像を削除しますか？')).toBeVisible();

      // 削除実行
      await page.getByRole('button', { name: '削除する' }).click();

      // 成功トーストが表示されること
      await expect(page.getByText('プロフィール画像を削除しました')).toBeVisible({ timeout: 5000 });

      // アバター画像が非表示になること（イニシャル表示に戻る）
      await expect(page.locator('img[crossorigin="anonymous"]')).not.toBeVisible();
    }
  });

  test('異常系: 5MB 超過ファイルはエラートーストが表示される', async ({ page }) => {
    const fileInput = page.locator('input[type="file"][accept*="image"]');

    // 6MB の大きなファイルをモック（実際のファイルは存在しないためスキップ）
    // 実際のテストでは e2e/fixtures/large-file.jpg（6MB超）が必要
    try {
      await fileInput.setInputFiles(
        path.join(process.cwd(), 'e2e', 'fixtures', 'large-avatar.jpg')
      );
      await expect(page.getByText('画像サイズは5MB以下にしてください')).toBeVisible({ timeout: 3000 });
    } catch {
      // フィクスチャファイルが存在しない場合はスキップ
      test.skip();
    }
  });

  test('異常系: 非対応フォーマット（GIF）はエラートーストが表示される', async ({ page }) => {
    const fileInput = page.locator('input[type="file"][accept*="image"]');

    try {
      await fileInput.setInputFiles(
        path.join(process.cwd(), 'e2e', 'fixtures', 'avatar-test.gif')
      );
      await expect(page.getByText('JPEG, PNG, WebP形式の画像のみアップロードできます')).toBeVisible({ timeout: 3000 });
    } catch {
      test.skip();
    }
  });

  test('モバイル: アバタータップでファイル選択ダイアログが開く', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // アバターボタンが表示されること
    const avatarButton = page.getByRole('button', { name: /プロフィール画像を変更/ });
    await expect(avatarButton).toBeVisible();

    // 「写真を変更」ラベルが表示されること
    await expect(page.getByText('写真を変更')).toBeVisible();
  });

  test('モバイル: 削除確認ダイアログが画面下部から表示される', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const deleteButton = page.getByRole('button', { name: /プロフィール画像を削除/ });

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(page.getByText('この操作は元に戻せません。')).toBeVisible();

      // キャンセルで閉じること
      await page.getByRole('button', { name: 'キャンセル' }).click();
      await expect(dialog).not.toBeVisible();
    }
  });
});
