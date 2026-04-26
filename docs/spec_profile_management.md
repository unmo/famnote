# プロフィール管理UX修正 仕様書

**バージョン:** 1.0  
**作成日:** 2026-04-25  
**担当エージェント:** Planner  
**ステータス:** 仕様確定

---

## 1. 機能概要

### 目的・背景

FamNoteはグループ内に複数のメンバープロフィールを持てる構成をとっているが、以下の3つの問題が発生している。

1. **GroupMember の displayName 空バグ:** `createGroup()` でオーナーのメンバードキュメントを `displayName: ''` でハードコード作成しているため、コメント送信時に名前が空になり、アバターが「?」と表示される。
2. **プロフィール管理画面が存在しない:** 以前 SettingsPage にあったメンバー管理セクションが UX 整理で削除され、子プロフィール（メンバー）を追加・編集・削除する手段がない。
3. **オーナー名が memberドキュメントに反映されない:** オンボーディングで設定した displayName が `users/{uid}` には保存されるが、`groups/{gid}/members/{uid}` には反映されない。

### 対象ユーザー

- **オーナー:** グループ作成者。自分のプロフィールと子プロフィールを管理できる。
- **メンバー:** 招待コードで参加したユーザー。自分のプロフィールのみ編集できる。

### 既存機能との関係

- **ProfileSwitchPage (`/profile-select`):** プロフィール選択画面。修正後に「編集」ボタン（オーナー限定）を追加する。
- **SettingsPage (`/settings`):** 設定画面。プロフィール管理セクションを新規追加する。
- **CreateGroupPage (`/onboarding/create-group`):** グループ作成オンボーディング。`createGroup()` 呼び出し引数を修正する。
- **AuthContext:** onSnapshot のメンバー受信時に displayName 自動補完マイグレーションを追加する。

---

## 2. 機能要件

### A. バグ修正（必須）

#### A-1. createGroup の displayName 修正

- `src/lib/firebase/firestore.ts` の `createGroup(ownerUid, groupName, iconUrl)` 関数のシグネチャを `createGroup(ownerUid, groupName, iconUrl, displayName, avatarUrl)` に拡張する。
- GroupMember 作成時に `displayName` と `avatarUrl` を引数の値で設定する。
- `src/routes/onboarding/CreateGroupPage.tsx` の呼び出し箇所を修正し、`useAuthStore` から `userProfile.displayName` と `userProfile.avatarUrl` を取得して渡す。
- `joinGroup()` 関数も同様に修正し、参加ユーザーの `displayName` を渡せるようにする（同じく呼び出し元で `userProfile` から取得）。

#### A-2. 既存オーナーの displayName 自動マイグレーション

- `src/contexts/AuthContext.tsx` の `onSnapshot(membersRef)` コールバック内で、自分自身のメンバードキュメント（`uid === firebaseUser.uid`）の `displayName` が空文字の場合に、`userProfile.displayName` で Firestore を更新する。
- マイグレーション処理は `updateDoc()` を用いてバックグラウンドで行い、エラーが発生してもアプリの起動を妨げない（`catch` で握りつぶし、コンソールに警告を出すのみ）。
- 一度補完済みの場合は再度書き込まない（displayName が空文字の場合のみ実行）。

### B. プロフィール管理画面（SettingsPage への追加）

#### B-1. オーナー向け機能

- **自分のプロフィール編集:** 表示名（displayName）の編集フォーム。保存時に `users/{uid}` と `groups/{gid}/members/{uid}` を同時更新する。
- **子プロフィール一覧:** グループメンバーのうち自分以外のメンバーをカード形式で一覧表示する。各カードに「編集」「削除」ボタンを設ける。
- **子プロフィール追加:** 「追加」ボタンからインラインフォームを表示し、名前のみ入力して新しいメンバードキュメントを `groups/{gid}/members/{新規uid}` に作成する。子プロフィールは Firebase Auth アカウントとは紐づかない仮想プロフィールとして扱う。
- **子プロフィール名前編集:** インラインまたはモーダルで名前を編集し、`groups/{gid}/members/{uid}` の `displayName` を更新する。
- **子プロフィール削除:** 確認ダイアログを経てメンバードキュメントを削除する。削除対象が `activeProfile`（profileStore）の場合はセッションをクリアして再選択を促す。

#### B-2. メンバー向け機能

- **自分のプロフィール名編集:** `displayName` の編集フォームのみ表示する。保存時に `users/{uid}` と `groups/{gid}/members/{uid}` を同時更新する。
- 子プロフィールの追加・削除ボタンはメンバーには表示しない。

### C. プロフィール選択画面の改善（ProfileSwitchPage）

- 各プロフィールカードに「編集」アイコンボタンを追加する（オーナーのみ表示）。
- 「編集」ボタンタップでインラインフォームまたはボトムシートを開き、名前を直接変更できる。
- 変更後はリアルタイムで Firestore の onSnapshot を通じてカードが更新される（楽観的 UI 更新不要）。

---

## 3. UI/UX 要件（Designerへの引き継ぎ事項）

### 画面の目的とユーザーの感情体験

- **SettingsPage プロフィール管理セクション:** 家族全員のプロフィールを安心して管理できる「コントロールパネル」感。複雑さを感じさせず、シンプルで明快なリスト + フォームの構成にする。
- **プロフィール選択画面（ProfileSwitchPage）の編集ボタン:** 「ここで素早く直せる」という気軽さ。ページ遷移せずインプレース編集で完結させる。

### 重要なインタラクションポイント

- 子プロフィール追加フォームはアコーディオン展開で表示する（ページ遷移なし）。
- 子プロフィール削除は誤操作防止のため確認ダイアログを必ず挟む。
- 名前編集フォームの保存ボタンはローディングスピナー付きで非同期を明示する。
- フォームはタップ・フォーカス時にボーダーハイライトのマイクロインタラクションを付ける。

### モバイル対応要件

- 全操作をモバイル画面（幅 375px 以上）で完結できること。
- 子プロフィール一覧は縦スクロールのカードリスト形式とする。
- 削除確認ダイアログはボトムシートではなくセンターモーダルで表示し、誤タップを防ぐ。

### エラー状態・空状態・ローディング状態

- **空状態（子プロフィールなし）:** 「まだ子プロフィールがありません。追加して家族みんなで使いましょう」などのガイダンステキストを表示する。
- **ローディング状態:** メンバー一覧読み込み中はスケルトンカードを2〜3枚表示する。
- **エラー状態:** 保存・削除失敗時は Sonner トースト（`toast.error`）で通知する。成功時は `toast.success` で確認する。
- **バリデーションエラー:** 名前が空または20文字超の場合はフォーム直下に赤字でエラーメッセージを表示する。

---

## 4. データモデル

### 既存 Firestore コレクション

```
users/{uid}
  - uid: string
  - displayName: string
  - email: string
  - avatarUrl: string | null
  - groupId: string | null
  - subscriptionStatus: 'free' | 'premium'

groups/{gid}/members/{uid}
  - uid: string
  - displayName: string
  - avatarUrl: string | null
  - sports: string[]
  - role: 'owner' | 'member'
  - joinedAt: Timestamp
  - lastActiveAt: Timestamp | null
```

### 子プロフィール（仮想メンバー）の扱い

- 子プロフィールは Firebase Auth アカウントを持たない仮想的なメンバー。
- `uid` は `child_{nanoid(10)}` などのプレフィックス付き文字列で生成し、Auth UID と区別できるようにする。
- `role` は `'member'` 固定。`email` フィールドは持たない（子プロフィールは User ドキュメントを持たない）。

### TypeScript interface 定義

```typescript
// 既存の GroupMember に変更なし
// groups/{gid}/members/{uid}
interface GroupMember {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  sports: string[];
  role: 'owner' | 'member';
  joinedAt: Timestamp;
  lastActiveAt: Timestamp | null;
  isChildProfile?: boolean; // 子プロフィール判定フラグ（新規追加）
}

// プロフィール編集フォーム用
interface ProfileEditFormData {
  displayName: string;
}

// 子プロフィール追加フォーム用
interface AddChildProfileFormData {
  displayName: string;
}
```

### 既存データモデルとの関係

- `users/{uid}` の `displayName` と `groups/{gid}/members/{uid}` の `displayName` は原則同期する。
- 子プロフィール（`isChildProfile: true`）は `users/{uid}` ドキュメントを持たないため、`groups/{gid}/members/{uid}` のみ更新する。

---

## 5. API・サービス仕様

### 修正対象: `src/lib/firebase/firestore.ts`

#### `createGroup` 関数シグネチャ変更

```typescript
export async function createGroup(
  ownerUid: string,
  groupName: string,
  iconUrl: string | null,
  ownerDisplayName: string,      // 追加
  ownerAvatarUrl: string | null  // 追加
): Promise<{ groupId: string; inviteCode: string }>
```

変更点: GroupMember 作成時の `displayName: ''` を `displayName: ownerDisplayName` に変更し、`avatarUrl: ownerAvatarUrl` を設定する。

#### `joinGroup` 関数シグネチャ変更

```typescript
export async function joinGroup(
  uid: string,
  inviteCode: string,
  displayName: string,       // 追加
  avatarUrl: string | null   // 追加
): Promise<{ groupId: string; groupName: string }>
```

#### 新規追加: `updateMemberDisplayName`

```typescript
export async function updateMemberDisplayName(
  groupId: string,
  memberUid: string,
  displayName: string,
  isChildProfile: boolean
): Promise<void>
// isChildProfile が false の場合: users/{memberUid} も同時に更新する
// isChildProfile が true の場合: groups/{gid}/members/{memberUid} のみ更新する
```

#### 新規追加: `addChildProfile`

```typescript
export async function addChildProfile(
  groupId: string,
  displayName: string
): Promise<string> // 作成した child uid を返す
// uid = 'child_' + nanoid(10) で生成
// groups/{gid}/members/{uid} に isChildProfile: true で作成
// groups/{gid} の memberCount をインクリメント
```

#### 新規追加: `deleteChildProfile`

```typescript
export async function deleteChildProfile(
  groupId: string,
  memberUid: string
): Promise<void>
// groups/{gid}/members/{memberUid} を削除
// groups/{gid} の memberCount をデクリメント
// 削除対象の uid が sessionStorage の activeProfile と一致する場合の処理は呼び出し元で行う
```

### Firestoreクエリ仕様

- メンバー一覧取得: `collection(db, 'groups', groupId, 'members')` を `onSnapshot` でリアルタイム購読（AuthContext の既存ロジックを流用）。
- 子プロフィール一覧: groupStore の `members` から `isChildProfile === true` でフィルタリングする（クエリ不要）。

### Firebase Storage

今回の修正では画像アップロードは対象外とする。avatarUrl は将来拡張として null のまま対応する（フォームに画像フィールドを設けない）。

---

## 6. セキュリティ要件

### 認証・認可

- `updateMemberDisplayName`: 呼び出し前に `useAuthStore` の `userProfile` が存在すること、かつグループに所属していることを確認する。
- 他人のプロフィール編集（非子プロフィールメンバー）はクライアント側でロールチェックを行い、`role !== 'owner'` の場合はボタン自体を非表示にする。
- `addChildProfile` / `deleteChildProfile` はオーナーのみ実行可能。クライアント側でロールチェックを行い、サーバー側は Firestore セキュリティルールで保護する。

### Firestoreセキュリティルールの変更

以下のルール追加が必要（`firestore.rules` の変更が必要）。

```
// groups/{gid}/members/{memberId}
// オーナーのみ子プロフィールの作成・削除を許可
match /groups/{gid}/members/{memberId} {
  allow create: if request.auth != null
    && get(/databases/$(database)/documents/groups/$(gid)/members/$(request.auth.uid)).data.role == 'owner';
  allow delete: if request.auth != null
    && get(/databases/$(database)/documents/groups/$(gid)/members/$(request.auth.uid)).data.role == 'owner'
    && resource.data.isChildProfile == true;
  allow update: if request.auth != null
    && (
      request.auth.uid == memberId  // 自分のプロフィール更新
      || get(/databases/$(database)/documents/groups/$(gid)/members/$(request.auth.uid)).data.role == 'owner'  // オーナーによる更新
    );
}
```

**ルールの権限緩和を含む変更のため、実装前にユーザー確認を取ること。**

### 入力バリデーション仕様（Zod）

```typescript
const profileEditSchema = z.object({
  displayName: z
    .string()
    .min(1, '名前は必須です')
    .max(20, '名前は20文字以内で入力してください')
    .trim(),
});
```

### Stripe Webhook

今回の修正では Stripe 連携は不要。

---

## 7. テスト観点

### ユニットテスト

#### `createGroup` 関数

- 正常系: `ownerDisplayName` が正しく GroupMember ドキュメントの `displayName` に保存されること。
- 正常系: `ownerAvatarUrl` が正しく保存されること。
- 異常系: Firestore のバッチ書き込み失敗時に例外がスローされること。

#### `updateMemberDisplayName` 関数

- 正常系（非子プロフィール）: `users/{uid}` と `groups/{gid}/members/{uid}` の両方が更新されること。
- 正常系（子プロフィール）: `groups/{gid}/members/{uid}` のみ更新され、`users/{uid}` は更新されないこと。
- 異常系: `displayName` が空文字の場合にバリデーションエラーが発生すること（呼び出し元 Zod による）。

#### `addChildProfile` 関数

- 正常系: `uid` が `child_` プレフィックスで始まること。
- 正常系: `isChildProfile: true` が設定されること。
- 正常系: `groups/{gid}` の `memberCount` がインクリメントされること。

#### `deleteChildProfile` 関数

- 正常系: メンバードキュメントが削除されること。
- 正常系: `memberCount` がデクリメントされること。
- 異常系: `isChildProfile: false` のメンバーを削除しようとした場合にエラーがスローされること（Firestore ルールで弾かれる）。

#### AuthContext の displayName マイグレーション

- 正常系: `displayName` が空文字のオーナーのメンバードキュメントが `userProfile.displayName` で補完されること。
- 正常系: `displayName` が既に設定されている場合は `updateDoc` が呼ばれないこと。

### E2E（Playwright）テストシナリオ

1. **グループ作成後に名前が反映される:**  
   オンボーディングでグループを作成し、コメントを投稿すると送信者名が正しく表示されること。

2. **SettingsPage でプロフィール名を編集できる:**  
   `/settings` にアクセス → プロフィール管理セクション → 名前を変更 → 保存 → プロフィール選択画面で変更が反映されていること。

3. **オーナーが子プロフィールを追加できる:**  
   `/settings` → プロフィール管理セクション → 「追加」ボタン → 名前入力 → 保存 → プロフィール選択画面に新しいカードが表示されること。

4. **子プロフィールの名前を編集できる:**  
   子プロフィールカードの「編集」ボタン → 名前変更 → 保存 → カードの名前が更新されること。

5. **子プロフィールを削除できる:**  
   子プロフィールカードの「削除」ボタン → 確認ダイアログで「削除」 → カードが一覧から消えること。

6. **メンバーロールは子プロフィール追加・削除ボタンが表示されない:**  
   メンバーロールのユーザーで `/settings` にアクセスし、子プロフィール追加・削除ボタンが表示されないこと。

### エッジケース

- グループ最大人数（10人）に達している場合に子プロフィール追加を試みると、適切なエラーメッセージが表示されること。
- 削除しようとした子プロフィールが `activeProfile` である場合、削除後にセッションがクリアされてプロフィール選択画面にリダイレクトされること。
- `userProfile` が null の状態（取得中）に保存操作が実行された場合、ボタンが無効化されていること。
- ネットワーク切断時に保存を実行した場合、エラートーストが表示されること。

---

## 8. 変更対象ファイル

### 新規作成

| ファイルパス | 内容 |
|------------|------|
| `src/components/settings/ProfileManagementSection.tsx` | プロフィール管理セクション本体（SettingsPage 内の新セクション） |
| `src/components/settings/ProfileEditForm.tsx` | 名前編集フォームコンポーネント（オーナー・自分自身用） |
| `src/components/settings/ChildProfileList.tsx` | 子プロフィール一覧コンポーネント |
| `src/components/settings/AddChildProfileForm.tsx` | 子プロフィール追加フォームコンポーネント |
| `src/lib/validations/profileSchema.ts` | Zod バリデーションスキーマ（profileEditSchema, addChildProfileSchema） |
| `tests/unit/settings/ProfileManagementSection.test.tsx` | プロフィール管理セクションのユニットテスト |
| `tests/unit/firebase/firestore-profile.test.ts` | firestore.ts の新規関数ユニットテスト |

### 修正対象

| ファイルパス | 修正内容 |
|------------|---------|
| `src/lib/firebase/firestore.ts` | `createGroup` / `joinGroup` シグネチャ変更、`updateMemberDisplayName` / `addChildProfile` / `deleteChildProfile` 追加 |
| `src/contexts/AuthContext.tsx` | displayName 空文字マイグレーション処理を追加 |
| `src/routes/onboarding/CreateGroupPage.tsx` | `createGroup()` 呼び出し時に `userProfile.displayName` / `avatarUrl` を渡すよう修正 |
| `src/routes/onboarding/JoinGroupPage.tsx` | `joinGroup()` 呼び出し時に `userProfile.displayName` / `avatarUrl` を渡すよう修正 |
| `src/routes/app/SettingsPage.tsx` | `ProfileManagementSection` コンポーネントを追加 |
| `src/routes/app/ProfileSwitchPage.tsx` | オーナー限定で各カードに「編集」ボタンを追加 |
| `src/store/groupStore.ts` | `updateMember` アクションを追加（ローカルステート更新用） |
| `firestore.rules` | 子プロフィール作成・削除・更新ルールを追加 |

---

## 9. 完了の定義

### 必須確認事項

1. **ビルドが通ること:** `npm run build` がエラーなし・型エラーなしで完了する。
2. **全ユニットテストがパスすること:** `npm run test` で新規・既存テスト全件グリーン。
3. **E2E テストがパスすること:** Playwright の上記シナリオ6件が全件パス。

### 具体的なユーザー操作での確認

- **バグ修正確認:** 新規ユーザーがオンボーディングを完了してグループを作成し、試合ノートにコメントを投稿すると、送信者の名前が正しく表示される（空・「?」にならない）。
- **プロフィール管理確認:** `/settings` 画面に「プロフィール管理」セクションが表示され、オーナーは子プロフィールの追加・編集・削除が行える。
- **既存ユーザーの自動補完確認:** displayName が空のまま残っている既存オーナーがアプリを開くと、次の onSnapshot 受信時に displayName が自動補完される。
- **メンバーロール制限確認:** メンバーロールのユーザーには子プロフィール管理 UI が表示されない。
