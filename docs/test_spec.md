# FamNote テスト仕様書

最終更新: 2026-05-01

---

## 自動テスト（Vitest）

### 実行コマンド
```bash
npx vitest run
```

### テストファイル一覧（21ファイル / 190テスト）

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
| `tests/unit/journals/journalCommentService.test.ts` | 10 | コメントサービス関数（addComment・deleteComment・subscribe） |
| `tests/unit/journals/JournalCommentForm.test.tsx` | 7 | コメント入力フォーム（管理者のみ表示・文字数制限） |
| `tests/unit/journals/JournalAccordionBlock.test.tsx` | 9 | ジャーナルアコーディオンブロック |
| `tests/unit/lib/inviteCode.test.ts` | 11 | 招待コード生成・検証 |
| `tests/unit/lib/streak.test.ts` | 14 | 連続記録計算ロジック |
| `tests/unit/theme/ThemeContext.test.tsx` | 8 | テーマコンテキスト（デフォルトテーマ: FamNote スカイブルー） |
| `tests/unit/theme/DarkModeContext.test.tsx` | 5 | ダークモードコンテキスト |
| `tests/unit/firebase/firestore-profile.test.ts` | 8 | Firestoreプロフィール操作 |
| `tests/unit/settings/ProfileManagementSection.test.tsx` | 13 | プロフィール管理セクション |
| `src/components/journals/JournalCommentItem.test.tsx` | 4 | ジャーナルコメントアイテムコンポーネント |
| `src/components/shared/RoleBadge.test.tsx` | 7 | ロールバッジコンポーネント |
| `src/components/shared/RoleSelector.test.tsx` | 7 | ロールセレクターコンポーネント |
| `src/routes/app/LandingPage.test.tsx` | 23 | ランディングページ（8セクション・i18n・レンダリング） |

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
