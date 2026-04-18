# FamNote MVP 詳細仕様書 (Phase 1)

**バージョン:** 2.0.0
**作成日:** 2026-04-17
**更新日:** 2026-04-17
**作成者:** Plannerエージェント
**ステータス:** Generator実装待ち

---

## 目次

1. [アプリ概要・コンセプト](#1-アプリ概要コンセプト)
2. [技術スタック](#2-技術スタック)
3. [ディレクトリ構造](#3-ディレクトリ構造)
4. [画面一覧・ルーティング](#4-画面一覧ルーティング)
5. [全機能の詳細仕様](#5-全機能の詳細仕様)
6. [テーマシステム仕様](#6-テーマシステム仕様)
7. [Firestoreデータモデル](#7-firestoreデータモデル)
8. [Firebaseセキュリティルール](#8-firebaseセキュリティルール)
9. [クライアントサービス仕様](#9-クライアントサービス仕様)
10. [Stripe課金フロー（将来拡張用）](#10-stripe課金フロー将来拡張用)
11. [環境変数一覧](#11-環境変数一覧)
12. [テスト観点](#12-テスト観点)
13. [実装フェーズ](#13-実装フェーズ)
14. [UI/UXデザイン仕様](#14-uiuxデザイン仕様)
15. [完了の定義](#15-完了の定義)

---

## 1. アプリ概要・コンセプト

### 1.1 概要

FamNoteは「家族でスポーツの成長を記録・共有するプレミアムノートアプリ」です。子供のスポーツ活動を中心に、家族全員が練習記録・試合結果をリアルタイムで共有し、成長を可視化・応援し合えるプラットフォームを提供します。

### 1.2 コアバリュー

- **記録の継続**: ストリーク（連続日数）とバッジでモチベーションを維持
- **家族のつながり**: タイムラインとリアクションで離れていても応援できる
- **成長の可視化**: グラフ・統計で努力が数字として見える
- **スポーツ特化**: サッカー・野球・バスケ・テニスなどのスポーツ固有フィールドに対応

### 1.3 対象ユーザー

- **主要ユーザー（子供）**: 小学生〜高校生のスポーツ活動者
- **サブユーザー（保護者）**: 子供の活動を見守りたい親
- **グループ単位**: 家族（最大10名）が1グループを構成

---

## 2. 技術スタック

### 2.1 フロントエンド

| 技術 | バージョン | 用途 |
|-----|-----------|------|
| React | 19.x | UIコンポーネント |
| Vite | 8.x | ビルドツール・開発サーバー |
| TypeScript | 5.x (strict mode) | 型安全性 |
| React Router | v7 | クライアントサイドルーティング |
| Tailwind CSS | v4 | スタイリング |
| Framer Motion | 11.x (`motion/react`からインポート) | アニメーション |
| TanStack Query | v5 | サーバー状態管理・キャッシュ |
| Zustand | v5 | クライアント状態管理 |
| Recharts | latest | グラフ・統計可視化 |
| Sonner | latest | トースト通知 |
| i18next | latest | 多言語対応 |
| Zod | latest | バリデーション |

### 2.2 バックエンド・インフラ

| 技術 | バージョン | 用途 |
|-----|-----------|------|
| Firebase Auth | latest | 認証（Google + メール/パスワード） |
| Firestore | latest | ドキュメントDB |
| Firebase Storage | latest | 画像ストレージ |
| Stripe | latest | 課金（Phase 2以降） |
| GCP Cloud Run | latest | コンテナホスティング |
| Cloudflare | latest | CDN・DNS |
| GitHub Actions | latest | CI/CD |

### 2.3 テスト

| 技術 | 用途 |
|-----|------|
| Vitest | ユニットテスト・コンポーネントテスト |
| Playwright | E2Eテスト |
| Testing Library | Reactコンポーネントテスト |

### 2.4 Vite設定ファイル（`vite.config.ts`）

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'vendor': ['react', 'react-dom', 'react-router'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test-setup.ts'],
    },
  },
});
```

---

## 3. ディレクトリ構造

```
famnote/
├── .claude/
│   ├── CLAUDE.md
│   ├── specs/
│   │   └── famnote-mvp.md
│   └── loop_state.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── src/
│   ├── routes/                           # React Router v7 ルート定義
│   │   ├── index.tsx                     # ルーター設定（createBrowserRouter）
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── onboarding/
│   │   │   ├── ProfileSetupPage.tsx
│   │   │   ├── CreateGroupPage.tsx
│   │   │   └── JoinGroupPage.tsx
│   │   └── app/
│   │       ├── DashboardPage.tsx
│   │       ├── notes/
│   │       │   ├── NotesListPage.tsx
│   │       │   ├── NoteNewPage.tsx
│   │       │   ├── NoteDetailPage.tsx
│   │       │   └── NoteEditPage.tsx
│   │       ├── matches/
│   │       │   ├── MatchesListPage.tsx
│   │       │   ├── MatchNewPage.tsx
│   │       │   ├── MatchDetailPage.tsx
│   │       │   └── MatchEditPage.tsx
│   │       ├── TimelinePage.tsx
│   │       ├── goals/
│   │       │   ├── GoalsListPage.tsx
│   │       │   └── GoalNewPage.tsx
│   │       ├── profile/
│   │       │   ├── MyProfilePage.tsx
│   │       │   └── MemberProfilePage.tsx
│   │       └── SettingsPage.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── GoogleAuthButton.tsx
│   │   ├── onboarding/
│   │   │   ├── ProfileSetupForm.tsx
│   │   │   ├── CreateGroupForm.tsx
│   │   │   ├── JoinGroupForm.tsx
│   │   │   └── InviteCodeDisplay.tsx
│   │   ├── dashboard/
│   │   │   ├── StreakCard.tsx
│   │   │   ├── RecentNotesList.tsx
│   │   │   ├── QuickRecordButton.tsx
│   │   │   └── FamilyMemberList.tsx
│   │   ├── notes/
│   │   │   ├── NoteForm.tsx
│   │   │   ├── NoteCard.tsx
│   │   │   ├── NoteDetail.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   └── SportSelector.tsx
│   │   ├── matches/
│   │   │   ├── MatchForm.tsx
│   │   │   ├── MatchCard.tsx
│   │   │   └── MatchDetail.tsx
│   │   ├── timeline/
│   │   │   ├── TimelineItem.tsx
│   │   │   ├── ReactionBar.tsx
│   │   │   └── CommentSection.tsx
│   │   ├── goals/
│   │   │   ├── GoalCard.tsx
│   │   │   ├── GoalForm.tsx
│   │   │   └── ConfettiAnimation.tsx
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── BadgeList.tsx
│   │   └── shared/
│   │       ├── AppLayout.tsx
│   │       ├── BottomNav.tsx           # モバイル用ボトムナビ
│   │       ├── SideNav.tsx             # デスクトップ用サイドナビ
│   │       ├── Avatar.tsx
│   │       ├── SportBadge.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── ProtectedRoute.tsx      # 認証ガード
│   │       └── OnboardingGuard.tsx     # オンボーディングガード
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useGroup.ts
│   │   ├── useNotes.ts
│   │   ├── useMatches.ts
│   │   ├── useTimeline.ts
│   │   ├── useGoals.ts
│   │   ├── useStreak.ts
│   │   └── useImageUpload.ts
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts
│   │   │   ├── auth.ts
│   │   │   ├── firestore.ts
│   │   │   └── storage.ts
│   │   ├── stripe/
│   │   │   └── config.ts
│   │   ├── validations/
│   │   │   ├── noteSchema.ts
│   │   │   ├── matchSchema.ts
│   │   │   ├── profileSchema.ts
│   │   │   └── groupSchema.ts
│   │   └── utils/
│   │       ├── date.ts
│   │       ├── streak.ts
│   │       └── inviteCode.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── groupStore.ts
│   │   └── uiStore.ts
│   ├── theme/
│   │   ├── ThemeContext.tsx             # テーマContext・Provider
│   │   ├── themes.ts                   # テーマ定義（20種類）
│   │   └── useTheme.ts                 # テーマ操作Hook
│   ├── types/
│   │   ├── user.ts
│   │   ├── group.ts
│   │   ├── note.ts
│   │   ├── match.ts
│   │   ├── goal.ts
│   │   ├── reaction.ts
│   │   ├── sport.ts
│   │   └── theme.ts
│   ├── i18n/
│   │   ├── index.ts                    # i18next設定
│   │   └── locales/
│   │       ├── ja.json
│   │       └── en.json
│   ├── App.tsx                         # アプリエントリー（RouterProvider）
│   ├── main.tsx                        # Viteエントリーポイント
│   └── test-setup.ts                   # Vitestセットアップ
├── public/
│   ├── icons/
│   │   └── sports/                     # スポーツアイコンSVG
│   └── images/
├── tests/
│   ├── unit/                           # Vitestユニットテスト
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── components/
│   └── e2e/                            # Playwright E2Eテスト
│       ├── auth.spec.ts
│       ├── onboarding.spec.ts
│       ├── notes.spec.ts
│       ├── matches.spec.ts
│       └── timeline.spec.ts
├── .env.local
├── .env.example
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── README.md
```

---

## 4. 画面一覧・ルーティング

### 4.1 画面一覧

| 画面名 | パス | 認証要否 | 説明 |
|--------|------|---------|------|
| ランディングページ | `/` | 不要 | アプリ紹介・CTAボタン |
| ログイン | `/login` | 不要 | Google認証・メール/パスワード |
| サインアップ | `/signup` | 不要 | 新規アカウント作成 |
| プロフィール設定 | `/onboarding/profile` | 要（グループ未参加） | 初回プロフィール設定 |
| グループ作成 | `/onboarding/create-group` | 要（グループ未参加） | 新規家族グループ作成 |
| グループ参加 | `/onboarding/join-group` | 要（グループ未参加） | 招待コードでグループ参加 |
| ダッシュボード | `/dashboard` | 要 | ホーム画面 |
| ノート一覧 | `/notes` | 要 | 自分のノート一覧 |
| ノート新規作成 | `/notes/new` | 要 | 練習ノート作成フォーム |
| ノート詳細 | `/notes/:id` | 要 | ノート詳細表示 |
| ノート編集 | `/notes/:id/edit` | 要 | ノート編集フォーム |
| 試合記録一覧 | `/matches` | 要 | 試合記録一覧 |
| 試合記録新規 | `/matches/new` | 要 | 試合記録作成フォーム |
| 試合記録詳細 | `/matches/:id` | 要 | 試合詳細表示 |
| 試合記録編集 | `/matches/:id/edit` | 要 | 試合記録編集フォーム |
| 家族タイムライン | `/timeline` | 要 | 家族全員の投稿タイムライン |
| 目標一覧 | `/goals` | 要 | 目標一覧・進捗 |
| 目標新規作成 | `/goals/new` | 要 | 目標設定フォーム |
| 自プロフィール | `/profile` | 要 | 自分の統計・バッジ |
| 他メンバープロフィール | `/profile/:userId` | 要 | 家族メンバーのプロフィール |
| 設定 | `/settings` | 要 | アプリ設定・グループ管理・テーマ変更 |

### 4.2 React Router v7 ルーター構成

```typescript
// src/routes/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/onboarding',
    element: <ProtectedRoute requireGroup={false} />,
    children: [
      { path: 'profile', element: <ProfileSetupPage /> },
      { path: 'create-group', element: <CreateGroupPage /> },
      { path: 'join-group', element: <JoinGroupPage /> },
    ],
  },
  {
    element: <ProtectedRoute requireGroup={true} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/notes', element: <NotesListPage /> },
          { path: '/notes/new', element: <NoteNewPage /> },
          { path: '/notes/:id', element: <NoteDetailPage /> },
          { path: '/notes/:id/edit', element: <NoteEditPage /> },
          { path: '/matches', element: <MatchesListPage /> },
          { path: '/matches/new', element: <MatchNewPage /> },
          { path: '/matches/:id', element: <MatchDetailPage /> },
          { path: '/matches/:id/edit', element: <MatchEditPage /> },
          { path: '/timeline', element: <TimelinePage /> },
          { path: '/goals', element: <GoalsListPage /> },
          { path: '/goals/new', element: <GoalNewPage /> },
          { path: '/profile', element: <MyProfilePage /> },
          { path: '/profile/:userId', element: <MemberProfilePage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
```

### 4.3 ルーティングフロー

```
未認証ユーザー
  → / (ランディング)
  → /login または /signup
  → Firebase Auth 認証完了
  → グループ未参加？ → /onboarding/profile → /onboarding/create-group or /onboarding/join-group
  → グループ参加済み？ → /dashboard

認証済みユーザー（グループ参加済み）
  → /dashboard (デフォルト)
  → ボトムナビ/サイドナビで各セクションへ遷移

ProtectedRoute コンポーネントでルート保護
  - 未認証 → /login にリダイレクト
  - 認証済み・グループ未参加 → /onboarding/profile にリダイレクト
  - 認証済み・グループ参加済み → 通常アクセス許可
```

---

## 5. 全機能の詳細仕様

### 5.1 認証・オンボーディング

#### 5.1.1 ログイン画面 (`/login`)

**UI要素:**
- FamNoteロゴ（上部中央）
- 「Googleでログイン」ボタン（Googleアイコン付き）
- メールアドレス入力フィールド
- パスワード入力フィールド（表示/非表示トグル）
- 「ログイン」ボタン
- 「パスワードを忘れた方」リンク（将来実装）
- 「アカウント作成はこちら」リンク → `/signup`

**バリデーション:**
- メールアドレス: RFC5322形式チェック
- パスワード: 8文字以上

**エラー状態:**
- 認証失敗: 「メールアドレスまたはパスワードが正しくありません」Sonnerトースト（赤）
- ネットワークエラー: 「通信に失敗しました。再試行してください」Sonnerトースト（赤）

**処理フロー:**
1. Googleログイン: `signInWithPopup(auth, googleProvider)` → Firestore userドキュメント確認 → グループ参加状況確認 → リダイレクト
2. メール/パスワード: `signInWithEmailAndPassword` → 同上

#### 5.1.2 サインアップ画面 (`/signup`)

**UI要素:**
- FamNoteロゴ
- 「Googleで登録」ボタン
- 名前入力フィールド（表示名）
- メールアドレス入力フィールド
- パスワード入力フィールド（強度インジケーター付き）
- パスワード確認フィールド
- 「利用規約・プライバシーポリシーに同意する」チェックボックス
- 「アカウント作成」ボタン

**バリデーション:**
- 名前: 1〜20文字
- メール: RFC5322形式
- パスワード: 8文字以上、大文字・小文字・数字を含む
- パスワード確認: パスワードと一致
- 利用規約同意: チェック必須

**処理フロー:**
1. `createUserWithEmailAndPassword` 実行
2. Firestore `users/{uid}` ドキュメント作成（初期値）
3. `/onboarding/profile` へリダイレクト

#### 5.1.3 プロフィール設定 (`/onboarding/profile`)

**UI要素:**
- ステップインジケーター（1/3）
- アバター選択（画像アップロード or デフォルトアバター12種から選択）
- 表示名入力（デフォルト: Googleアカウント名 or 入力した名前）
- 担当スポーツ選択（複数選択可、スポーツアイコン付きボタン）
  - サッカー、野球、バスケットボール、テニス、バレーボール、水泳、陸上、その他
- 「次へ」ボタン

**スポーツ選択UI:**
- 8種類のスポーツをグリッド表示（2列×4行）
- 選択済みはチェックマーク+カラーハイライト
- 最低1種選択必須

#### 5.1.4 グループ作成 (`/onboarding/create-group`)

**UI要素:**
- ステップインジケーター（2/3）
- グループ名入力フィールド（例: 「田中家」）
- グループアイコン選択（任意、画像アップロード）
- 「グループを作成」ボタン
- 「既存のグループに参加する」リンク → `/onboarding/join-group`

**処理フロー:**
1. Firestore `groups` コレクションに新規ドキュメント作成
2. 6桁英数字の招待コードを自動生成（重複チェック付き）
3. ユーザーの `groupId` を更新
4. 招待コード表示画面へ進む（3/3ステップ）

**招待コード表示:**
- 6桁コードを大きく表示（コピーボタン付き）
- 共有ボタン（ネイティブシェアAPI使用）
- 「ダッシュボードへ」ボタン

#### 5.1.5 グループ参加 (`/onboarding/join-group`)

**UI要素:**
- ステップインジケーター（2/3）
- 招待コード入力（6マス個別入力フィールド、自動フォーカス移動）
- 「参加する」ボタン
- 「新しいグループを作成する」リンク

**処理フロー:**
1. 入力コードで Firestore `groups` を検索
2. グループ存在確認・人数上限チェック（最大10名）
3. グループメンバーとして追加
4. `/dashboard` へリダイレクト

**エラー状態:**
- コード不一致: 「招待コードが正しくありません」
- 人数上限: 「このグループは満員です（最大10名）」

---

### 5.2 ダッシュボード (`/dashboard`)

#### 5.2.1 ストリークカード

**表示内容:**
- 炎アイコン（Framer Motionで揺らめくアニメーション）
- 現在の連続日数（大きな数字）
- 「連続練習中！」テキスト
- 最終記録日時
- ストリークバー（週7日分の●/○表示）

**計算ロジック:**
- 当日または昨日に練習ノートまたは試合記録が存在すればストリーク継続
- UTCではなくユーザーのタイムゾーン（Asia/Tokyo）で日付判定

#### 5.2.2 最近のノート一覧

- 自分と家族メンバーの最新10件を表示
- NoteCard / MatchCard コンポーネントを使用
- 「もっと見る」→ `/timeline`

#### 5.2.3 クイック記録ボタン

- 「練習ノート」ボタン → `/notes/new`
- 「試合記録」ボタン → `/matches/new`
- FAB（Floating Action Button）スタイル、モバイルでは画面右下固定
- ボタンカラーは `var(--color-brand-primary)` を使用

#### 5.2.4 家族メンバー一覧

- 家族メンバーのアバター + 名前 + 直近アクティビティ日時
- 緑ドット = 今日記録あり、グレー = 記録なし
- タップでメンバーのプロフィール `/profile/:userId` へ

---

### 5.3 練習ノート

#### 5.3.1 ノート新規作成 (`/notes/new`)

**フォームフィールド:**

| フィールド名 | 型 | 必須 | 説明 |
|------------|------|------|------|
| 日付 | date picker | 必須 | デフォルト: 今日 |
| スポーツ種目 | select | 必須 | プロフィールの担当スポーツから選択 |
| 練習時間 | number | 任意 | 分単位（例: 90分） |
| 場所 | text | 任意 | 例: 「市営グラウンド」 |
| 今日の目標 | textarea | 任意 | 最大200文字 |
| 練習内容 | textarea | 必須 | 最大1000文字 |
| 振り返り | textarea | 任意 | 最大500文字 |
| 体調 | 1-5スライダー | 任意 | 1=最悪 5=最高 |
| 画像 | file upload | 任意 | 最大5枚、各10MB以下、JPEG/PNG/WebP |
| 公開設定 | toggle | 必須 | 「家族に公開」または「自分のみ」 |

**画像アップロード:**
- ドラッグ&ドロップ対応
- プレビューサムネイル表示
- アップロード進捗バー
- Firebase Storage `notes/{noteId}/{filename}` に保存
- 画像はWebP形式に変換・リサイズ（最大1920px）してから保存

**下書き保存:**
- 「下書き保存」ボタンで `isDraft: true` で保存
- 次回アクセス時に下書きが存在すれば「下書きを再開しますか？」ダイアログ表示

**バリデーション:**
- 練習内容は必須（空文字不可）
- 画像は合計5枚以内
- 日付は未来日不可

#### 5.3.2 ノート詳細 (`/notes/:id`)

**表示内容:**
- スポーツバッジ（カラー付き）
- 日付・場所・練習時間
- 体調バッジ（1-5、色分け）
- 今日の目標・練習内容・振り返り
- 画像ギャラリー（タップでフルスクリーン表示）
- 作成者情報（名前・アバター）
- 編集ボタン（自分の投稿のみ）・削除ボタン（自分の投稿のみ）

#### 5.3.3 ノート一覧 (`/notes`)

- 自分のノートを日付降順で表示
- フィルター: スポーツ種目、期間（今週/今月/全期間）
- 無限スクロール（20件ずつ）
- 統計カード: 今月の記録数・合計練習時間

---

### 5.4 試合記録

#### 5.4.1 試合記録作成 (`/matches/new`)

**フォームフィールド:**

| フィールド名 | 型 | 必須 | 説明 |
|------------|------|------|------|
| 日付 | date picker | 必須 | デフォルト: 今日 |
| スポーツ種目 | select | 必須 | |
| 対戦相手 | text | 必須 | 例: 「○○FC」 |
| 会場 | text | 任意 | |
| 自チームスコア | number | 任意 | |
| 相手スコア | number | 任意 | |
| 勝敗 | radio | 任意 | 勝ち/引き分け/負け（スコアから自動判定も可） |
| ポジション | text | 任意 | |
| 出場時間 | number | 任意 | 分単位 |
| パフォーマンス評価 | 1-5星 | 任意 | 星評価UI |
| ハイライトメモ | textarea | 任意 | 最大500文字 |
| 改善点 | textarea | 任意 | 最大500文字 |
| 画像 | file upload | 任意 | 最大5枚 |
| 公開設定 | toggle | 必須 | |

#### 5.4.2 試合記録詳細 (`/matches/:id`)

**表示内容:**
- スコアボード（大きく表示、勝敗に応じてカラー変化）
  - 勝利: グリーン背景
  - 引き分け: イエロー背景
  - 敗北: レッド背景
- スポーツバッジ・対戦相手・会場
- ポジション・出場時間
- パフォーマンス評価（星表示）
- ハイライトメモ・改善点
- 画像ギャラリー

---

### 5.5 家族タイムライン (`/timeline`)

#### 5.5.1 タイムライン表示

- 家族メンバー全員のノート・試合記録を日時降順で表示
- ノートと試合記録を区別するアイコン表示
- 無限スクロール（15件ずつ）
- フィルター: メンバー選択、スポーツ種目、記録タイプ（ノート/試合）

#### 5.5.2 TimelineItemコンポーネント

**表示内容:**
- 投稿者アバター + 名前
- 記録タイプバッジ（練習ノート/試合記録）
- スポーツバッジ（カラー付き）
- 日付・場所
- 内容プレビュー（150文字で省略）
- 「続きを読む」展開
- 添付画像サムネイル（最大3枚表示、残り枚数表示）
- リアクションバー
- コメントセクション

#### 5.5.3 リアクション機能

**使用可能なリアクション:**
- 👏 (applause) - 拍手
- 🔥 (fire) - 熱い！
- ⭐ (star) - すごい！
- 💪 (muscle) - がんばれ！

**仕様:**
- 1ユーザー1投稿につき複数リアクション可能（各絵文字1回まで）
- リアクション数をリアルタイム表示（Firestoreリスナー）
- タップでトグル（追加/削除）
- 自分のリアクションはハイライト表示

#### 5.5.4 コメント機能

**仕様:**
- コメント入力フォーム（最大200文字）
- コメント一覧（最新3件表示 → 「すべて見る」で展開）
- 自分のコメントは削除可能
- リアルタイム更新（Firestoreリスナー）

---

### 5.6 UX強化機能

#### 5.6.1 ストリーク機能

**バッジ一覧:**

| バッジ名 | 条件 | アイコン |
|---------|------|---------|
| はじめの一歩 | 最初の記録 | 👟 |
| 3日坊主脱出 | 3日連続 | 🔥 |
| 1週間の戦士 | 7日連続 | ⚔️ |
| 月間チャンピオン | 30日連続 | 🏆 |
| 100日達人 | 100日連続 | 💎 |
| 記録魔 | 合計50件記録 | 📝 |
| チームプレイヤー | 10回リアクション | 🤝 |

**バッジ取得時UI:**
- フルスクリーンオーバーレイでバッジ表示
- Framer Motionでスケールアップアニメーション
- confetti（紙吹雪）エフェクト
- 「共有する」ボタン（将来実装）

#### 5.6.2 目標設定機能

**目標フォームフィールド:**

| フィールド名 | 型 | 必須 | 説明 |
|------------|------|------|------|
| タイトル | text | 必須 | 例: 「週3回練習する」 |
| 詳細 | textarea | 任意 | 最大300文字 |
| スポーツ種目 | select | 必須 | |
| 目標タイプ | radio | 必須 | 練習回数/試合出場/スキル習得 |
| 目標値 | number | 任意 | 例: 12（回） |
| 期限 | date picker | 必須 | |
| 公開設定 | toggle | 必須 | |

**目標達成時:**
- Framer Motionの confetti エフェクト（紙吹雪アニメーション）
- 「おめでとうございます！」フルスクリーンモーダル
- バッジ付与（目標タイプに応じたバッジ）
- 達成日時の記録

---

## 6. テーマシステム仕様

### 6.1 概要

FamNoteはCSS変数ベースのテーマシステムを採用します。ユーザーは設定画面で好みのカラーテーマを選択できます（有料プランのみ20種類全て選択可、無料プランはデフォルトのShimizuテーマのみ）。

### 6.2 CSS変数定義

```css
/* src/index.css */
:root {
  --color-brand-primary: #E85513;
  --color-brand-secondary: #00133F;
  --color-brand-primary-light: color-mix(in srgb, var(--color-brand-primary) 15%, white);
  --color-brand-primary-dark: color-mix(in srgb, var(--color-brand-primary) 80%, black);
}
```

### 6.3 テーマ定義（20種類）

```typescript
// src/theme/themes.ts
export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  isPremium: boolean;
}

export const THEMES: Theme[] = [
  { id: 'shimizu',   name: 'Shimizu',   primary: '#E85513', secondary: '#00133F', isPremium: false },
  { id: 'kashima',   name: 'Kashima',   primary: '#B30024', secondary: '#002244', isPremium: true },
  { id: 'urawa',     name: 'Urawa',     primary: '#E60012', secondary: '#000000', isPremium: true },
  { id: 'kashiwa',   name: 'Kashiwa',   primary: '#FFE500', secondary: '#000000', isPremium: true },
  { id: 'verdy',     name: 'Verdy',     primary: '#006934', secondary: '#B2933D', isPremium: true },
  { id: 'kawasaki',  name: 'Kawasaki',  primary: '#23B7E5', secondary: '#000000', isPremium: true },
  { id: 'kyoto',     name: 'Kyoto',     primary: '#800080', secondary: '#CCA300', isPremium: true },
  { id: 'cerezo',    name: 'Cerezo',    primary: '#F06292', secondary: '#000080', isPremium: true },
  { id: 'okayama',   name: 'Okayama',   primary: '#B2003F', secondary: '#002244', isPremium: true },
  { id: 'fukuoka',   name: 'Fukuoka',   primary: '#002A5C', secondary: '#8A8D8F', isPremium: true },
  { id: 'mito',      name: 'Mito',      primary: '#0028A0', secondary: '#000000', isPremium: true },
  { id: 'chiba',     name: 'Chiba',     primary: '#FFE400', secondary: '#008638', isPremium: true },
  { id: 'fctokyo',   name: 'FCTokyo',   primary: '#0038A8', secondary: '#E60012', isPremium: true },
  { id: 'machida',   name: 'Machida',   primary: '#002366', secondary: '#D4AF37', isPremium: true },
  { id: 'marinos',   name: 'Marinos',   primary: '#003F80', secondary: '#E60012', isPremium: true },
  { id: 'nagoya',    name: 'Nagoya',    primary: '#E60012', secondary: '#000000', isPremium: true },
  { id: 'gamba',     name: 'Gamba',     primary: '#0021A5', secondary: '#000000', isPremium: true },
  { id: 'kobe',      name: 'Kobe',      primary: '#990000', secondary: '#000000', isPremium: true },
  { id: 'hiroshima', name: 'Hiroshima', primary: '#4B0082', secondary: '#D4AF37', isPremium: true },
  { id: 'nagasaki',  name: 'Nagasaki',  primary: '#F39800', secondary: '#00519A', isPremium: true },
];

export const DEFAULT_THEME = THEMES[0]; // Shimizu
```

### 6.4 ThemeContext実装

```typescript
// src/theme/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, THEMES, DEFAULT_THEME } from './themes';

const STORAGE_KEY = 'famnote_theme';

interface ThemeContextValue {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.find((t) => t.id === stored) ?? DEFAULT_THEME;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-brand-primary', currentTheme.primary);
    root.style.setProperty('--color-brand-secondary', currentTheme.secondary);
    localStorage.setItem(STORAGE_KEY, currentTheme.id);
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (theme) setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
}
```

### 6.5 localStorageキー

- キー名: `famnote_theme`
- 値: テーマID文字列（例: `"shimizu"`, `"kashima"`）
- 未設定時のデフォルト: `"shimizu"`

### 6.6 設定画面でのテーマ選択UI

- テーマ一覧をカラーチップ（丸型）グリッドで表示
- 選択中のテーマはリングでハイライト
- 有料テーマ（`isPremium: true`）はロックアイコンを重ねて表示
- 無料ユーザーがプレミアムテーマをクリック → アップグレード誘導モーダル表示

---

## 7. Firestoreデータモデル

### 7.1 コレクション構成図

```
Firestore
├── users/
│   └── {uid}/
│       ├── (フィールド)
│       └── streaks/ (サブコレクション)
│           └── {year}/
├── groups/
│   └── {groupId}/
│       ├── (フィールド)
│       └── members/ (サブコレクション)
│           └── {uid}/
├── notes/
│   └── {noteId}/
│       ├── (フィールド)
│       ├── images/ (サブコレクション)
│       │   └── {imageId}/
│       └── comments/ (サブコレクション)
│           └── {commentId}/
├── matches/
│   └── {matchId}/
│       ├── (フィールド)
│       └── comments/ (サブコレクション)
│           └── {commentId}/
├── reactions/
│   └── {reactionId}/
├── goals/
│   └── {goalId}/
└── inviteCodes/
    └── {code}/
```

### 7.2 TypeScript型定義

```typescript
// src/types/theme.ts
export interface UserTheme {
  themeId: string;             // localStorageに保存、Firestoreにも同期
}
```

```typescript
// src/types/sport.ts
export const SPORTS = [
  'soccer',
  'baseball',
  'basketball',
  'tennis',
  'volleyball',
  'swimming',
  'athletics',
  'other',
] as const;

export type Sport = typeof SPORTS[number];

export const SPORT_LABELS: Record<Sport, string> = {
  soccer: 'サッカー',
  baseball: '野球',
  basketball: 'バスケットボール',
  tennis: 'テニス',
  volleyball: 'バレーボール',
  swimming: '水泳',
  athletics: '陸上',
  other: 'その他',
};

// スポーツカラーはテーマシステムとは独立して管理（スポーツバッジ用）
export const SPORT_COLORS: Record<Sport, { bg: string; text: string; border: string }> = {
  soccer:     { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-500' },
  baseball:   { bg: 'bg-indigo-700',  text: 'text-indigo-700',  border: 'border-indigo-700'  },
  basketball: { bg: 'bg-orange-500',  text: 'text-orange-600',  border: 'border-orange-500'  },
  tennis:     { bg: 'bg-yellow-400',  text: 'text-yellow-600',  border: 'border-yellow-400'  },
  volleyball: { bg: 'bg-sky-500',     text: 'text-sky-600',     border: 'border-sky-500'     },
  swimming:   { bg: 'bg-cyan-500',    text: 'text-cyan-600',    border: 'border-cyan-500'    },
  athletics:  { bg: 'bg-red-500',     text: 'text-red-600',     border: 'border-red-500'     },
  other:      { bg: 'bg-slate-600',   text: 'text-slate-600',   border: 'border-slate-600'   },
};
```

```typescript
// src/types/user.ts
import { Sport } from './sport';
import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  sports: Sport[];
  groupId: string | null;
  themeId: string;                   // テーマID（デフォルト: 'shimizu'）
  subscriptionStatus: 'free' | 'family' | 'premium';
  stripeCustomerId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  totalNotes: number;
  totalMatches: number;
  currentStreak: number;
  longestStreak: number;
  lastRecordedAt: Timestamp | null;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  acquiredAt: Timestamp;
}

export interface UserBadge extends Badge {
  userId: string;
}
```

```typescript
// src/types/group.ts
import { Sport } from './sport';
import { Timestamp } from 'firebase/firestore';

export interface Group {
  id: string;
  name: string;
  iconUrl: string | null;
  inviteCode: string;
  ownerUid: string;
  memberCount: number;
  maxMembers: number;               // 固定: 10
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GroupMember {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  sports: Sport[];
  joinedAt: Timestamp;
  role: 'owner' | 'member';
  lastActiveAt: Timestamp | null;
}

export interface InviteCode {
  code: string;
  groupId: string;
  createdAt: Timestamp;
  expiresAt: Timestamp | null;
}
```

```typescript
// src/types/note.ts
import { Sport } from './sport';
import { Timestamp } from 'firebase/firestore';
import { ReactionType } from './reaction';

export interface Note {
  id: string;
  userId: string;
  groupId: string;
  sport: Sport;
  date: Timestamp;
  durationMinutes: number | null;
  location: string | null;
  todayGoal: string | null;
  content: string;
  reflection: string | null;
  condition: 1 | 2 | 3 | 4 | 5 | null;
  imageUrls: string[];
  isDraft: boolean;
  isPublic: boolean;
  reactionCounts: Record<ReactionType, number>;
  commentCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NoteComment {
  id: string;
  noteId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  text: string;
  createdAt: Timestamp;
}
```

```typescript
// src/types/match.ts
import { Sport } from './sport';
import { Timestamp } from 'firebase/firestore';
import { ReactionType } from './reaction';

export type MatchResult = 'win' | 'draw' | 'loss' | null;

export interface Match {
  id: string;
  userId: string;
  groupId: string;
  sport: Sport;
  date: Timestamp;
  opponent: string;
  venue: string | null;
  myScore: number | null;
  opponentScore: number | null;
  result: MatchResult;
  position: string | null;
  playingTimeMinutes: number | null;
  performance: 1 | 2 | 3 | 4 | 5 | null;
  highlight: string | null;
  improvements: string | null;
  imageUrls: string[];
  isDraft: boolean;
  isPublic: boolean;
  reactionCounts: Record<ReactionType, number>;
  commentCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

```typescript
// src/types/reaction.ts
import { Timestamp } from 'firebase/firestore';

export const REACTION_TYPES = ['applause', 'fire', 'star', 'muscle'] as const;
export type ReactionType = typeof REACTION_TYPES[number];

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  applause: '👏',
  fire: '🔥',
  star: '⭐',
  muscle: '💪',
};

export interface Reaction {
  id: string;
  targetType: 'note' | 'match';
  targetId: string;
  userId: string;
  groupId: string;
  reactionType: ReactionType;
  createdAt: Timestamp;
}
```

```typescript
// src/types/goal.ts
import { Sport } from './sport';
import { Timestamp } from 'firebase/firestore';

export type GoalType = 'practice_count' | 'match_appearance' | 'skill_acquisition';
export type GoalStatus = 'active' | 'completed' | 'expired';

export interface Goal {
  id: string;
  userId: string;
  groupId: string;
  title: string;
  description: string | null;
  sport: Sport;
  goalType: GoalType;
  targetValue: number | null;
  currentValue: number;
  deadline: Timestamp;
  status: GoalStatus;
  isPublic: boolean;
  completedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 7.3 Firestoreインデックス定義

```json
{
  "indexes": [
    {
      "collectionGroup": "notes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "groupId", "order": "ASCENDING" },
        { "fieldPath": "isPublic", "order": "ASCENDING" },
        { "fieldPath": "isDraft", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isDraft", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "groupId", "order": "ASCENDING" },
        { "fieldPath": "isPublic", "order": "ASCENDING" },
        { "fieldPath": "isDraft", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "targetId", "order": "ASCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "goals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "deadline", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 8. Firebaseセキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isSameGroup(groupId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.groupId == groupId;
    }

    function isGroupMember(groupId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid));
    }

    function isGroupOwner(groupId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid)).data.role == 'owner';
    }

    function isValidNote(data) {
      return data.content is string && data.content.size() > 0 && data.content.size() <= 1000 &&
             data.sport in ['soccer', 'baseball', 'basketball', 'tennis', 'volleyball', 'swimming', 'athletics', 'other'] &&
             data.isPublic is bool &&
             data.isDraft is bool;
    }

    function isValidMatch(data) {
      return data.opponent is string && data.opponent.size() > 0 &&
             data.sport in ['soccer', 'baseball', 'basketball', 'tennis', 'volleyball', 'swimming', 'athletics', 'other'] &&
             data.isPublic is bool;
    }

    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && request.resource.data.uid == userId;
      allow update: if isOwner(userId) &&
                       !request.resource.data.diff(resource.data).affectedKeys()
                         .hasAny(['uid', 'createdAt', 'totalNotes', 'totalMatches', 'currentStreak', 'longestStreak']);
      allow delete: if false;
    }

    match /groups/{groupId} {
      allow read: if isGroupMember(groupId);
      allow create: if isAuthenticated() &&
                       request.resource.data.ownerUid == request.auth.uid &&
                       request.resource.data.memberCount == 1 &&
                       request.resource.data.maxMembers == 10;
      allow update: if isGroupOwner(groupId) &&
                       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['id', 'createdAt', 'ownerUid']);
      allow delete: if false;

      match /members/{memberId} {
        allow read: if isGroupMember(groupId);
        allow create: if isAuthenticated() && memberId == request.auth.uid;
        allow update: if isOwner(memberId);
        allow delete: if isOwner(memberId) || isGroupOwner(groupId);
      }
    }

    match /inviteCodes/{code} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isGroupOwner(request.resource.data.groupId);
      allow update, delete: if false;
    }

    match /notes/{noteId} {
      allow read: if isOwner(resource.data.userId) ||
                     (isSameGroup(resource.data.groupId) && resource.data.isPublic == true && resource.data.isDraft == false);
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       isValidNote(request.resource.data) &&
                       request.resource.data.imageUrls.size() <= 5;
      allow update: if isOwner(resource.data.userId) &&
                       request.resource.data.userId == resource.data.userId &&
                       isValidNote(request.resource.data) &&
                       request.resource.data.imageUrls.size() <= 5;
      allow delete: if isOwner(resource.data.userId);

      match /comments/{commentId} {
        allow read: if isOwner(get(/databases/$(database)/documents/notes/$(noteId)).data.userId) ||
                       isSameGroup(get(/databases/$(database)/documents/notes/$(noteId)).data.groupId);
        allow create: if isAuthenticated() &&
                         request.resource.data.userId == request.auth.uid &&
                         request.resource.data.text is string &&
                         request.resource.data.text.size() > 0 &&
                         request.resource.data.text.size() <= 200;
        allow delete: if isOwner(resource.data.userId);
        allow update: if false;
      }
    }

    match /matches/{matchId} {
      allow read: if isOwner(resource.data.userId) ||
                     (isSameGroup(resource.data.groupId) && resource.data.isPublic == true && resource.data.isDraft == false);
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       isValidMatch(request.resource.data) &&
                       request.resource.data.imageUrls.size() <= 5;
      allow update: if isOwner(resource.data.userId) &&
                       request.resource.data.userId == resource.data.userId &&
                       isValidMatch(request.resource.data);
      allow delete: if isOwner(resource.data.userId);

      match /comments/{commentId} {
        allow read: if isOwner(get(/databases/$(database)/documents/matches/$(matchId)).data.userId) ||
                       isSameGroup(get(/databases/$(database)/documents/matches/$(matchId)).data.groupId);
        allow create: if isAuthenticated() &&
                         request.resource.data.userId == request.auth.uid &&
                         request.resource.data.text.size() <= 200;
        allow delete: if isOwner(resource.data.userId);
        allow update: if false;
      }
    }

    match /reactions/{reactionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.reactionType in ['applause', 'fire', 'star', 'muscle'];
      allow delete: if isOwner(resource.data.userId);
      allow update: if false;
    }

    match /goals/{goalId} {
      allow read: if isOwner(resource.data.userId) ||
                     (isSameGroup(resource.data.groupId) && resource.data.isPublic == true);
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.title.size() <= 100;
      allow update: if isOwner(resource.data.userId) &&
                       request.resource.data.userId == resource.data.userId;
      allow delete: if isOwner(resource.data.userId);
    }
  }
}

service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }

    match /notes/{noteId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.resource.size < 10 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null;
    }

    match /groups/{groupId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.resource.size < 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 9. クライアントサービス仕様

Vite + クライアントサイドレンダリングのため、Server Actions・API Routesは使用しません。Firebase SDKを直接クライアントから呼び出します。

### 9.1 認証サービス (`src/lib/firebase/auth.ts`)

```typescript
// ユーザープロファイル作成
export async function createUserProfile(
  uid: string,
  displayName: string,
  email: string,
  avatarUrl: string | null
): Promise<void>

// プロフィール更新
export async function updateUserProfile(
  uid: string,
  data: { displayName?: string; avatarUrl?: string; sports?: Sport[]; themeId?: string }
): Promise<void>
```

### 9.2 グループサービス (`src/lib/firebase/firestore.ts`)

```typescript
// グループ作成
export async function createGroup(
  ownerUid: string,
  groupName: string,
  iconUrl: string | null
): Promise<{ groupId: string; inviteCode: string }>

// グループ参加
export async function joinGroup(
  uid: string,
  inviteCode: string
): Promise<{ groupId: string; groupName: string }>

// 招待コード再生成
export async function regenerateInviteCode(
  groupId: string,
  ownerUid: string
): Promise<{ inviteCode: string }>
```

### 9.3 ノートサービス

```typescript
// ノート作成
export async function createNote(
  data: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'reactionCounts' | 'commentCount'>
): Promise<{ noteId: string }>

// ノート更新
export async function updateNote(
  noteId: string,
  userId: string,
  data: Partial<Omit<Note, 'id' | 'userId' | 'groupId' | 'createdAt'>>
): Promise<void>

// ノート削除（Storage画像も削除）
export async function deleteNote(
  noteId: string,
  userId: string
): Promise<void>
```

### 9.4 リアクションサービス

```typescript
// リアクション追加/削除（トグル）
export async function toggleReaction(
  targetType: 'note' | 'match',
  targetId: string,
  userId: string,
  groupId: string,
  reactionType: ReactionType
): Promise<{ added: boolean }>
```

### 9.5 Stripe（Phase 2用）

Stripe決済はCloud Functions経由で処理します。クライアントからは `VITE_STRIPE_PUBLISHABLE_KEY` を使用して Stripe.js を読み込みます。

---

## 10. Stripe課金フロー（将来拡張用）

### 10.1 課金プラン（Phase 2で実装予定）

| プラン | 月額 | 内容 |
|--------|------|------|
| Free | 無料 | グループ1つ、メンバー3名、ノート50件/月、テーマ: Shimizuのみ |
| Family | ¥480/月 | グループ1つ、メンバー10名、ノート無制限、テーマ: 全20種類 |
| Premium | ¥980/月 | グループ3つ、メンバー無制限、テーマ: 全20種類、AI分析機能 |

### 10.2 Phase 1での準備事項

- `users` コレクションに `subscriptionStatus: 'free' | 'family' | 'premium'` フィールドを追加
- `stripeCustomerId: string | null` フィールドを追加
- Stripe SDKをインストールしAPIキーを環境変数で管理
- テーマ変更時に `subscriptionStatus` を確認し、有料テーマへのアクセスを制御

---

## 11. 環境変数一覧

```bash
# .env.local (必須)
# VITE_ プレフィックスはクライアントサイドで公開される（公開可能な値のみ）

# Firebase（クライアントSDK用）
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Stripe（Phase 2用）
VITE_STRIPE_PUBLISHABLE_KEY=

# アプリ設定
VITE_APP_URL=http://localhost:3000
```

### 11.1 Firebase設定ファイル (`src/lib/firebase/config.ts`)

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 11.2 環境変数の注意事項

- `VITE_` プレフィックスはクライアントサイドで公開される（`import.meta.env.VITE_*` でアクセス）
- Firebase Admin SDK等のサーバー専用秘密情報はクライアントに含めないこと
- `.env.local` は `.gitignore` に必ず含めること
- `.env.example` に値なしで全キーを記載しリポジトリに含めること

---

## 12. テスト観点

### 12.1 Vitestユニットテスト

#### `tests/unit/lib/inviteCode.test.ts`

```
正常系:
- 6桁の英数字コードが生成される
- 生成されるコードは一意性を持つ（100回生成して重複なし）
- コードはすべて大文字英字と数字のみで構成される

異常系:
- 空文字・undefinedを渡した場合のバリデーションエラー
```

#### `tests/unit/lib/streak.test.ts`

```
正常系:
- 連続した日付のリストでストリーク数が正しく計算される
- 当日と昨日の記録がある場合、ストリーク継続と判定される
- 空配列の場合、ストリーク0を返す

異常系:
- 2日以上空いた場合、ストリークがリセットされる
- タイムゾーン（Asia/Tokyo）を跨ぐ場合の正しい判定
```

#### `tests/unit/theme/ThemeContext.test.tsx`

```
正常系:
- デフォルトテーマ（shimizu）が適用される
- setTheme呼び出しでCSS変数が更新される
- localStorageにテーマIDが保存される
- ページリロード後にlocalStorageから復元される

異常系:
- 存在しないテーマIDを設定してもデフォルトテーマが保持される
- ThemeProvider外でuseThemeContextを使用するとエラーが発生する
```

#### `tests/unit/components/NoteForm.test.tsx`

```
正常系:
- 必須フィールド入力後に送信ボタンが有効化される
- 画像5枚まで添付できる
- 下書き保存ボタンが機能する

異常系:
- 必須フィールド未入力で送信するとエラーメッセージ表示
- 画像6枚目の添付試行でエラーメッセージ表示
- 未来日付選択でエラーメッセージ表示
- 練習内容が1000文字を超えるとバリデーションエラー
```

#### `tests/unit/components/MatchForm.test.tsx`

```
正常系:
- スコア入力で勝敗が自動判定される（マイスコア > 相手: 勝ち）
- パフォーマンス評価（星）が正しく選択できる

異常系:
- 対戦相手未入力で送信するとエラーメッセージ表示
- スコアにマイナス値を入力するとバリデーションエラー
```

#### `tests/unit/components/ReactionBar.test.tsx`

```
正常系:
- リアクションボタンをクリックすると即座にUI更新（オプティミスティック更新）
- 同じリアクションを再クリックすると解除される

異常系:
- Firebase書き込みエラー時にUI状態がロールバックされる
```

#### `tests/unit/components/InviteCodeInput.test.tsx`

```
正常系:
- 6マス入力フィールドへの1文字入力で次のフィールドに自動フォーカス移動
- ペーストで6文字が各フィールドに分配される

異常系:
- 英数字以外の入力を拒否する
- 5文字以下での送信はエラーメッセージ表示
```

### 12.2 Playwright E2Eテスト

#### `tests/e2e/auth.spec.ts`

```
シナリオ1: 新規ユーザー登録フロー
1. /signup にアクセス
2. 名前・メール・パスワードを入力
3. 利用規約チェックボックスをチェック
4. 「アカウント作成」ボタンをクリック
5. /onboarding/profile にリダイレクトされることを確認

シナリオ2: ログインフロー
1. /login にアクセス
2. メール・パスワードを入力
3. 「ログイン」ボタンをクリック
4. /dashboard にリダイレクトされることを確認

シナリオ3: 未認証リダイレクト
1. /dashboard に直接アクセス
2. /login にリダイレクトされることを確認
```

#### `tests/e2e/onboarding.spec.ts`

```
シナリオ1: グループ作成フロー
1. /onboarding/profile でプロフィール設定・スポーツ選択
2. /onboarding/create-group でグループ名入力
3. 招待コードが6桁で表示されることを確認
4. /dashboard にリダイレクト確認

シナリオ2: グループ参加フロー
1. /onboarding/join-group にアクセス
2. 6桁の招待コードを入力
3. /dashboard にリダイレクトされることを確認
```

#### `tests/e2e/notes.spec.ts`

```
シナリオ1: 練習ノート作成
1. /notes/new にアクセス
2. スポーツ種目を選択
3. 練習内容を入力
4. 「公開して保存」をクリック
5. /notes/:id にリダイレクトされることを確認

シナリオ2: 下書き保存と再開
1. /notes/new でフォームを部分入力
2. 「下書き保存」をクリック
3. /notes/new に再アクセス
4. 「下書きを再開しますか？」ダイアログが表示されることを確認
```

#### `tests/e2e/theme.spec.ts`

```
シナリオ1: テーマ変更（有料ユーザー）
1. /settings にアクセス
2. テーマ選択でKashimaを選択
3. ブランドカラーがKashimaの primary (#B30024) に変わることを確認
4. ページリロード後もテーマが維持されることを確認

シナリオ2: 無料ユーザーによるプレミアムテーマ選択
1. /settings にアクセス
2. プレミアムテーマをクリック
3. アップグレード誘導モーダルが表示されることを確認
```

#### `tests/e2e/timeline.spec.ts`

```
シナリオ1: タイムライン表示・無限スクロール
シナリオ2: リアクション追加・解除
シナリオ3: コメント投稿
```

### 12.3 エッジケース

- オフライン時のFirestore書き込み（オフラインキャッシュ使用）
- 画像アップロード中のネットワーク切断（リトライUI表示）
- 招待コード入力フィールドへのペースト（スペースを自動除去）
- 同時に同じリアクションをクリックした場合の競合（Firestoreトランザクション）
- グループメンバー10名上限での参加試行
- 画像が5枚以上の状態でノート更新しようとする場合
- localStorageが利用不可な場合のテーマ適用（デフォルトフォールバック）

---

## 13. 実装フェーズ

### Phase 1: MVP（本仕様書の対象）

**実装期間:** 8週間

**Week 1-2: 基盤構築**
- [ ] Vite 8.x + React 19.x + TypeScript プロジェクト初期化
- [ ] React Router v7 セットアップ
- [ ] Tailwind CSS v4 セットアップ
- [ ] Firebase SDK 初期化（Auth/Firestore/Storage）
- [ ] 認証フロー実装（Google + メール/パスワード）
- [ ] ProtectedRoute / OnboardingGuard 実装
- [ ] Zustand / TanStack Query セットアップ
- [ ] テーマシステム実装（ThemeContext + CSS変数）
- [ ] 共通コンポーネント（レイアウト・ナビゲーション・Sonnerトースト）
- [ ] i18next セットアップ

**Week 3: オンボーディング**
- [ ] プロフィール設定画面
- [ ] グループ作成画面（招待コード生成）
- [ ] グループ参加画面（招待コード入力）
- [ ] Firestoreへのデータ書き込み

**Week 4-5: 練習ノート・試合記録**
- [ ] 練習ノート CRUD（作成・読取・更新・削除）
- [ ] 試合記録 CRUD
- [ ] 画像アップロード（Firebase Storage）
- [ ] 下書き保存機能

**Week 6: タイムライン・リアクション**
- [ ] 家族タイムライン（無限スクロール）
- [ ] リアクション機能（リアルタイム更新）
- [ ] コメント機能

**Week 7: UX強化**
- [ ] ダッシュボード（ストリーク・メンバー表示）
- [ ] バッジ・ストリーク機能
- [ ] 目標設定・達成アニメーション
- [ ] 設定画面（テーマ選択・グループ管理）

**Week 8: テスト・品質**
- [ ] Vitestユニットテスト実装
- [ ] Playwright E2Eテスト実装
- [ ] Firestoreセキュリティルール設定
- [ ] パフォーマンス最適化
- [ ] CI/CD (GitHub Actions) 設定

### Phase 2: 拡張機能（MVP後）

- Stripe課金フロー実装（Familyプラン / Premiumプラン）
- プッシュ通知（Firebase Cloud Messaging）
- 統計・グラフ（Recharts）
- AI練習アドバイス（Vertex AI / Gemini API）
- PWA対応（オフラインモード）
- 招待コード有効期限設定
- 複数グループ対応（Premiumプラン）

### Phase 3: グロース

- ソーシャルシェア機能（SNSへの投稿）
- チーム機能（家族を超えたチームでの共有）
- コーチアカウント（外部コーチが家族グループを指導）
- 動画添付対応
- スポーツ別専用テンプレート（サッカー: 得点・アシスト記録など）
- 月次レポート自動生成（PDF）

---

## 14. UI/UXデザイン仕様

### 14.1 デザインシステム

**カラーパレット（ベース）:**
```
Brand Primary:   var(--color-brand-primary)   デフォルト: #E85513
Brand Secondary: var(--color-brand-secondary) デフォルト: #00133F
Background:      #0F172A (slate-900) / #F8FAFC (slate-50)
Surface:         #1E293B (slate-800) / #FFFFFF
Text:            #F1F5F9 (slate-100) / #0F172A (slate-900)
Muted:           #64748B (slate-500)
Danger:          #EF4444 (red-500)
Warning:         #F59E0B (amber-500)
```

ブランドカラーを使用する箇所は Tailwind の任意値記法（`bg-[color:var(--color-brand-primary)]`）または CSS変数を直接参照します。

**タイポグラフィ:**
```css
font-family: 'Inter', 'Noto Sans JP', sans-serif;
/* 見出し: font-weight: 700-800 */
/* 本文: font-weight: 400 */
/* ラベル: font-weight: 500-600 */
```

### 14.2 モバイル対応要件

- ブレークポイント: `sm: 640px`, `md: 768px`, `lg: 1024px`
- モバイル（〜767px）: ボトムナビゲーション（5タブ）
- タブレット・デスクトップ（768px〜）: サイドナビゲーション
- タッチターゲット最小サイズ: 44px × 44px
- フォームフィールド: モバイルで `font-size: 16px`（iOSズーム防止）

**ボトムナビゲーション項目:**
1. ホーム（ダッシュボード）
2. タイムライン
3. ＋（クイック記録、中央・強調）
4. ノート一覧
5. プロフィール

### 14.3 アニメーション仕様（Framer Motion）

Framer Motion は `motion/react` からインポートします。

```typescript
import { motion } from 'motion/react';
```

**ページ遷移:**
```typescript
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};
```

**ストリーク炎アニメーション:**
```typescript
const flameVariants = {
  animate: {
    rotate: [-3, 3, -3],
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
  },
};
```

**バッジ取得アニメーション:**
```typescript
const badgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};
```

**紙吹雪（目標達成）:**
- `canvas-confetti` ライブラリを使用
- 色: `var(--color-brand-primary)` + `var(--color-brand-secondary)` + ゴールド
- 持続時間: 3秒

**リアクションボタン:**
```typescript
whileTap={{ scale: 0.85 }}
whileHover={{ scale: 1.1 }}
```

### 14.4 ダークモード

- システム設定に従う（デフォルト）
- ユーザーが設定から切り替え可能
- Tailwind `dark:` クラスで対応
- ダークモード状態は Zustand の `uiStore` で管理

---

## 15. 完了の定義

### Phase 1 MVP の完了条件

1. **ビルドが通ること**
   ```bash
   npm run build
   # エラー・型エラー・Lintエラーがゼロであること
   ```

2. **全ユニットテストがパスすること**
   ```bash
   npm run test
   # Vitest: 全テストケースがPASS
   # カバレッジ: 主要ロジック（lib/utils, hooks, theme）70%以上
   ```

3. **E2Eテストがパスすること**
   ```bash
   npm run test:e2e
   # Playwright: 全シナリオがPASS（ヘッドレスブラウザ）
   ```

4. **ユーザー操作による動作確認**
   - 新規ユーザーが登録→オンボーディング→ダッシュボードまで到達できる
   - 練習ノートを作成し、家族タイムラインに表示される
   - 試合記録を作成し、スコアボードが正しく表示される
   - リアクション・コメントがリアルタイムで更新される
   - 7日連続記録でバッジが取得できる
   - 目標達成時に紙吹雪アニメーションが再生される
   - テーマ変更でブランドカラーが即座に変わる（CSS変数）
   - ページリロード後もテーマが維持される（localStorage）
   - モバイル（375px幅）でレイアウトが崩れない

5. **セキュリティ確認**
   - Firestoreセキュリティルールで他グループのデータにアクセスできないこと
   - 未認証ユーザーがダッシュボードにアクセスできないこと
   - 他ユーザーのノートを編集・削除できないこと
   - XSS対策（入力のサニタイズ）が機能すること
   - Firebase APIキーが `VITE_` プレフィックスのみでクライアント公開を制御していること

6. **パフォーマンス確認**
   - Lighthouse スコア: Performance 80以上、Accessibility 90以上
   - 初回ページロード: 3秒以内（LCP）
   - Core Web Vitals: CLS < 0.1, FID < 100ms

---

*本仕様書はGeneratorエージェントへの実装指示として使用されます。不明点がある場合はPlannerエージェントに確認してください。*
