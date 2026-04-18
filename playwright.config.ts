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
  // E2Eテスト実行前にアプリを起動
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
