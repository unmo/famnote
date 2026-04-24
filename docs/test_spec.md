# FamNote テスト仕様書

最終更新: 2026-04-24

---

## 自動テスト（Vitest）

### 実行コマンド
```bash
npx vitest run
```

### テストファイル一覧（12ファイル / 102テスト）

| ファイル | テスト数 | 対象 |
|---------|---------|------|
| `tests/unit/store/profileStore.test.ts` | 11 | profileStore（sessionStorage・restoreFromSession） |
| `tests/unit/hooks/useActiveProfile.test.ts` | 7 | useActiveProfileフック（isManager判定） |
| `tests/unit/components/ProtectedRoute.test.tsx` | 9 | ProtectedRoute（requireProfile・requireGroupガード） |
| `tests/unit/components/BulletListInput.test.tsx` | 8 | BulletListInputコンポーネント |
| `tests/unit/components/JournalCard.test.tsx` | 4 | MatchJournalCardコンポーネント |
| `tests/unit/auth/LoginPage.test.tsx` | 7 | ログインページ |
| `tests/unit/auth/useAuth.test.ts` | 6 | useAuthフック |
| `tests/unit/journals/matchJournalSchema.test.ts` | 12 | 試合ジャーナルバリデーション |
| `tests/unit/lib/inviteCode.test.ts` | 11 | 招待コード生成・検証 |
| `tests/unit/lib/streak.test.ts` | 14 | 連続記録計算ロジック |
| `tests/unit/theme/ThemeContext.test.tsx` | 8 | テーマコンテキスト |
| `tests/unit/theme/DarkModeContext.test.tsx` | 5 | ダークモードコンテキスト |

### E2Eテスト（Playwright）

| ファイル | 状態 | 内容 |
|---------|------|------|
| `tests/e2e/profile-select.spec.ts` | 実装済み・実行環境整備中 | プロフィール選択フロー |

---

## profileStore テスト観点

- `setActiveProfile` → sessionStorageにUIDが保存される
- `clearActiveProfile` → activeProfileがnull・sessionStorage削除
- `restoreFromSession` → 一致するUIDのメンバーが復元される
- `restoreFromSession` → 存在しないUIDの場合nullになる
- sessionStorage利用不可環境でクラッシュしない

## ProtectedRoute テスト観点

- `requireProfile=true` + `activeProfile=null` → `/select-profile` にリダイレクト
- `requireProfile=true` + `activeProfile`あり → Outletを描画
- `requireGroup=true` + 未ログイン → `/login` にリダイレクト
- `requireGroup=true` + グループ未参加 → `/onboarding/profile` にリダイレクト
- 初期化中（`isInitialized=false`）→ ローディングスピナー表示
