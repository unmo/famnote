---
name: run-tests
description: テストを実行して結果を報告する。実装後・コミット前に必ず使う。単体テストとE2Eテストの両方を実行する。
---

テストを実行して結果を報告してください。

## 実行対象

$ARGUMENTS

（指定がない場合は単体テスト + E2Eテストの全テストを実行する）

## 実行手順

### Step 1: 単体テスト（必須）
```
npm run test
```

### Step 2: E2Eテスト（必須）
```
npm run test:e2e
```

> E2Eテストは `tests/e2e/` 配下の `*.spec.ts` を対象とする。
> 認証が必要な画面のE2Eは Firebase モックまたは認証不要な画面のみテストする。

### Step 3: 新機能実装後のテスト追加確認

実装した機能に対応するテストが存在するか確認する：

- **単体テスト**: `tests/unit/` に対応ファイルがあるか
- **E2Eテスト**: `tests/e2e/` に対応ファイルがあるか

テストが不足している場合は**必ず追加してから**完了とすること。

## E2Eテスト作成規約

新機能を実装した場合、以下のテンプレートに従って `tests/e2e/[機能名].spec.ts` を作成する：

```typescript
import { test, expect } from '@playwright/test';

test.describe('[機能名]', () => {
  // 認証不要な画面・状態のテスト
  test('正常系: [シナリオ]', async ({ page }) => {
    await page.goto('/該当パス');
    await expect(page.locator('[data-testid="xxx"]')).toBeVisible();
  });

  // 未認証でのリダイレクト確認
  test('正常系: 未認証でアクセスするとログインにリダイレクト', async ({ page }) => {
    await page.goto('/protected-path');
    await expect(page).toHaveURL(/\/login/);
  });

  // モバイル表示確認
  test('モバイル: [シナリオ]', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/該当パス');
    await expect(page.locator('[data-testid="xxx"]')).toBeVisible();
  });
});
```

## 失敗時の対応

テストが失敗した場合：
1. 失敗したテストファイルとテスト名を特定する
2. エラーメッセージを読んで原因を診断する
3. **実装コードとテストコードのどちらに問題があるか**を判断する
   - 実装の変更によって既存テストが壊れた → 実装を修正する
   - テストが対応できていない新機能 → テストを追加・修正する
4. 修正してから再度テストを実行して全件パスを確認する

E2Eテストでアプリが起動しない場合は `npm run dev` が正常に動作するか確認する。

## 完了条件

- 単体テスト: `Test Files X passed` / `Tests X passed` と表示されること
- E2Eテスト: 全 spec ファイルがパスしていること
- 実装した機能に対応する単体テスト・E2Eテストが存在すること
