# 仕様書: 認証フロー SkillSync準拠リファクタリング (auth-refactor)

作成日: 2026-04-18  
フェーズ: Planner 完了

---

## 1. 機能概要

### 目的・背景
現在のFamNoteはメール/パスワード認証とGoogle認証の両方に対応しており、ログインページとサインアップページの2画面構成になっている。
SkillSyncと同じく**Googleログインのみ・1画面完結**に統一することで、認証フローをシンプルにし、保守コストを削減する。
また、メール/パスワード認証に伴うセキュリティリスク（パスワード漏洩・弱いパスワード）を排除する。

### 対象ユーザー
FamNoteの全ユーザー（新規・既存問わず）

### 既存機能との関係
- ログイン・サインアップフローが変わるが、認証後の画面（オンボーディング・ダッシュボード）はそのまま維持する
- オンボーディングフロー（`/onboarding/profile` → `/onboarding/create-group` or `/onboarding/join-group`）は変更なし
- ProtectedRouteのリダイレクト先は `/login` のまま

---

## 2. 機能要件

### 削除する機能
- メール/パスワードによるログイン
- メール/パスワードによる新規アカウント作成（サインアップ）
- パスワードリセットメール送信

### 追加・変更する機能
- `/login` 1ページにGoogleログインボタンのみ配置
- `/signup` ルートを削除（アクセスした場合 `/login` にリダイレクト）
- 初回Googleログイン時に自動でFirestoreユーザードキュメントを作成（既存の `ensureUserDocument` の挙動を維持）
- ログイン成功後のリダイレクト:
  - `groupId` がある場合: `/dashboard`
  - `groupId` がない場合: `/onboarding/profile`

### 画面・コンポーネント一覧

| 区分 | ファイルパス | 変更種別 |
|------|------------|---------|
| ログインページ | `src/routes/auth/LoginPage.tsx` | 全面リニューアル |
| サインアップページ | `src/routes/auth/SignupPage.tsx` | 削除 |
| ルーター定義 | `src/routes/index.tsx` | `/signup` ルート削除、`/signup` → `/login` リダイレクト追加 |
| 認証フック | `src/hooks/useAuth.ts` | `loginWithEmail`・`signUp` メソッドを削除 |
| Firebase認証ユーティリティ | `src/lib/firebase/auth.ts` | `signInWithEmail`・`signUpWithEmail`・`sendResetEmail` を削除 |
| バリデーションスキーマ | `src/lib/validations/profileSchema.ts` | `loginSchema`・`signupSchema` を削除 |
| GoogleAuthButton | `src/components/auth/GoogleAuthButton.tsx` | 変更なし（そのまま利用） |

### ユーザーインタラクション
1. ユーザーが `/login` にアクセスする
2. 「Googleでログイン」ボタンをクリックする
3. Googleの認証ポップアップが開く
4. 認証成功 → `ensureUserDocument` でFirestoreドキュメントを確認・作成
5. `groupId` の有無で `/dashboard` または `/onboarding/profile` にリダイレクト
6. 認証失敗 → Sonnerトースト「Googleログインに失敗しました」を表示
7. 認証済みユーザーが `/login` にアクセスした場合 → 即座に `/dashboard` または `/onboarding/profile` にリダイレクト
8. 未認証ユーザーが保護ルートにアクセスした場合 → `/login` にリダイレクト（変更なし）

---

## 3. UI/UX要件（Designerへの引き継ぎ事項）

### 画面の目的とユーザーの感情体験
- シンプル・高速にログインできることが最優先
- 「家族で成長を記録する」というFamNoteの価値観をビジュアルで伝える
- Googleログインは信頼感があり、入力の手間がないことをポジティブに訴求する
- 不安感・迷いを排除した1ボタン完結UI

### デザインスタイル（SkillSync準拠）
- 背景: ダーク系（`bg-[#0a0a0b]`）
- グラス背景カード: `backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08]`
- FamNoteブランドカラー: `var(--color-brand-primary)` = `#E85513`（オレンジ）× `var(--color-brand-secondary)` = `#00133F`（ネイビー）
- 背景のアンビエントグロー: ブランドカラーベースのぼかし円（SkillSyncの実装を参考に）
- カード角丸: `rounded-[2rem]` または `rounded-[2.5rem]`
- フォント: Inter（見出し）+ Noto Sans JP（日本語テキスト）

### 重要なインタラクションポイント
- Googleボタンにはホバーシャイン（shimmer）エフェクトを実装する（SkillSync参考）
- ボタン押下時: `active:scale-[0.98]` のマイクロインタラクション
- カードホバー時: `border-white/[0.12]` に変化
- ロゴ（FamNote「F」アイコン）のホバー時: `scale-105`
- ページ全体のFadeIn: Framer Motion `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`

### モバイル対応要件
- 全幅ボタン（`w-full`）
- カード: モバイルでは `rounded-[2rem]`、sm以上で `rounded-[2.5rem]`
- パディング: モバイルは `p-8`、sm以上は `p-12`
- ビューポート: `min-h-screen` で縦方向中央配置

### ロゴ・ブランド表示
```
[F]アイコン（ブランドカラーグラデーション）
FamNote（h1）
家族で成長を記録しよう（サブタイトル）
```

### コピー（テキスト）
- ヘッドライン: `家族の記録を、` + アクセントカラーで `ひとつの場所に。`
- サブタイトル: `Googleアカウントで今すぐはじめましょう`
- ボタン: `Googleでログイン`（i18n対応: `auth.loginWithGoogle`）
- フッター: `プライバシーポリシーと利用規約に同意の上ご利用ください`

### エラー状態
- Google認証失敗: カード内に `bg-red-500/10 border border-red-500/20 text-red-400` のエラーバナー
- ネットワークエラー: 同上のバナー、またはSonnerトースト
- ローディング中: ボタン内にスピナーを表示し、ボタンを無効化（`disabled`）

### 空状態・ローディング状態
- ページ初期表示時: Framer Motionのフェードイン（遅延なし）
- Google認証処理中: ボタンをローディング状態にする（`isLoading` フラグ）

---

## 4. データモデル

### 変更なし
認証フローの変更に伴うFirestoreのデータモデル変更はなし。  
ユーザードキュメントの作成ロジック（`ensureUserDocument` → `createUserProfile`）は既存のまま維持。

### 参考: Firestoreユーザードキュメント（`users/{uid}`）
```typescript
interface User {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  sports: Sport[];
  groupId: string | null;
  themeId: string;
  subscriptionStatus: 'free' | 'premium';
  stripeCustomerId: string | null;
  totalNotes: number;
  totalMatches: number;
  currentStreak: number;
  longestStreak: number;
  lastRecordedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 5. API・サービス仕様

### Firebase Auth
- 利用メソッド: `signInWithPopup(auth, googleProvider)` のみ
- 削除するFirebase Authメソッド:
  - `signInWithEmailAndPassword`
  - `createUserWithEmailAndPassword`
  - `sendPasswordResetEmail`

### `src/lib/firebase/auth.ts` 変更仕様

**残す関数:**
- `signInWithGoogle(): Promise<FirebaseUser>` （変更なし）
- `logout(): Promise<void>` （変更なし）
- `createUserProfile(...)` （変更なし）
- `ensureUserDocument(...)` （変更なし・privateのまま）
- `updateUserProfile(...)` （変更なし）
- `getUserProfile(uid)` （変更なし）

**削除する関数:**
- `signInWithEmail(email, password)`
- `signUpWithEmail(email, password, displayName)`
- `sendResetEmail(email)`

**削除するimport:**
- `signInWithEmailAndPassword`
- `createUserWithEmailAndPassword`
- `sendPasswordResetEmail`

### `src/hooks/useAuth.ts` 変更仕様

**残すメソッド:**
- `loginWithGoogle()` （変更なし）
- `logOut()` （変更なし）

**削除するメソッド:**
- `loginWithEmail(email, password)`
- `signUp(email, password, displayName)`

**戻り値から削除するプロパティ:**
- `loginWithEmail`
- `signUp`

### Firestore・Storage
変更なし。

### Stripe
変更なし。

---

## 6. セキュリティ要件

### 認証・認可
- Googleログインのみに絞ることで、脆弱なパスワードや資格情報漏洩のリスクを排除する
- Firebase AuthのGoogleプロバイダーによるOAuth 2.0フローを使用する
- `signInWithPopup` によるポップアップ認証を使用する（リダイレクト方式ではない）

### Firestoreセキュリティルール
変更なし。ユーザードキュメントの作成・読み取り条件は既存のまま。

### 入力バリデーション
- メール/パスワードフォームが削除されるため、ログインページにおける入力バリデーションは不要になる
- `loginSchema`・`signupSchema` のZodスキーマを削除する

### 注意事項
- メール/パスワード認証のFirebase Authプロバイダー設定はFirebaseコンソール側でも無効化することを推奨する（本仕様書の範囲外・手動作業）
- 既存のメール/パスワードアカウントを持つユーザーへの移行案内は本リファクタリングのスコープ外とする

---

## 7. テスト観点

### ユニットテスト（Vitest）

#### `src/lib/firebase/auth.ts`
- `signInWithGoogle`: Googleポップアップが呼ばれること、`ensureUserDocument` が呼ばれること
- `signInWithGoogle`: 既存ユーザーの場合、`createUserProfile` が呼ばれないこと（ドキュメントが存在する場合）
- `signInWithGoogle`: 新規ユーザーの場合、`createUserProfile` が呼ばれること
- `logout`: `signOut` が呼ばれること

#### `src/hooks/useAuth.ts`
- `loginWithGoogle` 成功: Googleログイン関数が呼ばれること、エラーが投げられないこと
- `loginWithGoogle` 失敗: Sonnerトーストエラーが表示されること
- `logOut` 成功: `/login` にナビゲートされること、Sonnerトースト「ログアウトしました」が表示されること
- 削除されたメソッド（`loginWithEmail`・`signUp`）が戻り値に含まれないこと

#### `src/routes/auth/LoginPage.tsx`
- 未認証状態: Googleログインボタンが表示されること
- 認証済み状態（groupIdあり）: `/dashboard` にリダイレクトされること
- 認証済み状態（groupIdなし）: `/onboarding/profile` にリダイレクトされること
- Googleボタンクリック: `loginWithGoogle` が呼ばれること
- 認証エラー発生: エラーメッセージが表示されること
- ローディング中: ボタンが無効化されること

### E2Eテスト（Playwright）

#### シナリオ1: Googleログインフロー（モック使用）
1. `/login` にアクセスする
2. Googleログインボタンが表示されることを確認する
3. メール/パスワードフォームが表示されないことを確認する
4. Firebase AuthをモックしてGoogleログインを実行する
5. `/dashboard` または `/onboarding/profile` にリダイレクトされることを確認する

#### シナリオ2: `/signup` へのアクセス
1. `/signup` にアクセスする
2. `/login` にリダイレクトされることを確認する

#### シナリオ3: 未認証状態でのProtectedRoute
1. 未認証状態で `/dashboard` にアクセスする
2. `/login` にリダイレクトされることを確認する
3. Googleログインボタンが表示されることを確認する

#### シナリオ4: 認証済み状態でのLoginPageアクセス
1. Firebase Authをモックして認証済み状態にする
2. `/login` にアクセスする
3. `/dashboard` または `/onboarding/profile` にリダイレクトされることを確認する

### エッジケース
- Googleポップアップがユーザーによってキャンセルされた場合: エラーメッセージを表示するが、ページ遷移しない
- ネットワークエラー: Sonnerトーストにエラーを表示する
- Firestoreドキュメント作成失敗: エラーをコンソールに記録し、Sonnerトーストを表示する
- 同時に複数回ボタンをクリックされた場合: `isLoading` フラグで二重送信を防止する

---

## 8. 変更対象ファイル

### 削除するファイル
| ファイルパス | 理由 |
|------------|------|
| `src/routes/auth/SignupPage.tsx` | サインアップページ廃止 |

### 修正するファイル
| ファイルパス | 変更内容 |
|------------|---------|
| `src/routes/auth/LoginPage.tsx` | SkillSync準拠のGoogleログインのみのUIに全面リニューアル。メール/パスワードフォーム・区切り線・サインアップリンクを削除 |
| `src/routes/index.tsx` | `SignupPage` のimportを削除、`/signup` ルートを削除、`/signup` → `/login` へのリダイレクトルートを追加 |
| `src/lib/firebase/auth.ts` | `signInWithEmail`・`signUpWithEmail`・`sendResetEmail` を削除。不要なimportを削除 |
| `src/hooks/useAuth.ts` | `loginWithEmail`・`signUp` メソッドを削除。不要なimportを削除 |
| `src/lib/validations/profileSchema.ts` | `loginSchema`・`signupSchema`・関連型定義を削除 |

### 新規作成するファイル
なし（既存ファイルの修正のみ）

### テストファイル
| ファイルパス | 変更内容 |
|------------|---------|
| `src/routes/auth/LoginPage.test.tsx` | 新規作成またはリニューアル（既存テストがあれば刷新） |
| `src/hooks/useAuth.test.ts` | 削除メソッドのテストを削除、既存テストをメンテナンス |
| `src/lib/firebase/auth.test.ts` | 削除関数のテストを削除 |
| `e2e/auth.spec.ts` | 新規作成またはリニューアル |

---

## 9. 完了の定義

### ビルド確認
- `npm run build` がエラーなく完了すること
- TypeScript strictモードでの型エラーが0件であること

### テスト確認
- 全ユニットテスト（Vitest）がパスすること
- E2Eテスト（Playwright）の認証シナリオがパスすること
- 削除されたメソッド（`loginWithEmail`・`signUp`）を参照するコードが残っていないこと

### 動作確認（手動）
1. `/login` にアクセスすると、Googleログインボタンのみが表示される
2. メール/パスワードフォームが表示されない
3. 「Googleでログイン」ボタンをクリックするとGoogleの認証ポップアップが開く
4. 認証成功後、`groupId` の有無に応じて `/dashboard` または `/onboarding/profile` に遷移する
5. `/signup` にアクセスすると `/login` にリダイレクトされる
6. 未認証状態で `/dashboard` にアクセスすると `/login` にリダイレクトされる
7. 認証済み状態で `/login` にアクセスすると自動的に適切なページにリダイレクトされる

### コード品質
- 削除されたファイル・関数への参照が残っていないこと（`grep` で確認）
- `react-hook-form` の `useForm` がLoginPageで使われていないこと
- `zodResolver` がLoginPageで使われていないこと
- `Eye`・`EyeOff` アイコンがLoginPageでimportされていないこと
