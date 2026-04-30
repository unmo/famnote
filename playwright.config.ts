import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // E2Eテストのディレクトリ
  testDir: './tests/e2e',
  // 並列実行設定
  fullyParallel: true,
  // CI環境ではリトライなし
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  // レポーター設定
  reporter: 'html',
  // グローバル設定
  use: {
    // アプリのベースURL
    baseURL: 'http://localhost:3000',
    // テスト失敗時のスクリーンショット
    screenshot: 'only-on-failure',
    // トレース設定
    trace: 'on-first-retry',
    // ブラウザのロケールを日本語に固定（i18next の LanguageDetector が日本語を選択するよう）
    locale: 'ja-JP',
    // CI環境でアニメーションを無効化（Framer Motionのinitial opacity:0でtoBeVisibleが失敗するのを防ぐ）
    reducedMotion: 'reduce',
  },
  // CI環境でのアサーションタイムアウトを延長（Firebase初期化待ち）
  expect: {
    timeout: process.env.CI ? 15000 : 5000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  // E2Eテスト実行前にアプリを起動（CI環境ではビルド済みアセットをpreviewで配信）
  webServer: {
    command: process.env.CI ? 'npm run preview -- --port 3000' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
