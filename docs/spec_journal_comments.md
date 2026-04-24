# 仕様書: 試合振り返りノートへの親コメント機能

**作成日**: 2026-04-22  
**フェーズ**: Planner  
**ステータス**: 確定

---

## 1. 機能概要

### 目的・背景

子供が記録した試合ジャーナル（matchJournals）に対して、管理者プロフィール（role=owner）の親が励ましや気づきのフィードバックをコメントとして投稿できる機能。子供はアプリを開いたときに未読コメントのバッジを確認でき、親からのメッセージを受け取れる体験を提供する。

### 対象ユーザー

- **コメント投稿者**: グループ内で `role=owner` のプロフィールを選択中のユーザー（親）
- **コメント閲覧者**: ジャーナルを作成したユーザー（子供）および同グループメンバー全員
- **未読バッジ受信者**: ジャーナルの所有者（子供）

### 既存機能との関係

- `matchJournals/{journalId}/comments` サブコレクションはFirestoreルール上すでに定義されているが、現在はUIが未実装
- `JournalComment` 型は `src/types/matchJournal.ts` に定義済み（`role` フィールドあり）
- `MatchJournal.commentCount` フィールドは定義済みだが更新処理が未実装
- コメント投稿者の `role` 判定は `useActiveProfile` の `isManager` フラグを使用する

---

## 2. 機能要件

### 誰がコメントできるか

- `isManager === true`（activeProfile.role === 'owner'）のユーザーのみコメントを投稿できる
- 閲覧はジャーナルオーナー本人および同グループメンバー全員が可能
- コメントの削除は投稿者本人のみ可能

### 動作の詳細

- `JournalDetailPage` のコンテンツ最下部にコメントセクションを追加する
- コメントは時系列順（`createdAt` 昇順）で表示する
- コメント1件あたりの文字数上限は200文字
- コメント投稿時に `matchJournals/{journalId}` の `commentCount` をインクリメントする
- コメント投稿時に `matchJournals/{journalId}` の `unreadCommentCount` をインクリメントする（未読フラグ）
- ジャーナル詳細ページを子供が開いたとき（ジャーナルオーナーが閲覧したとき）に `unreadCommentCount` を 0 にリセットする
- BottomNav または ジャーナル一覧カードにバッジを表示する（後述）

### 画面・コンポーネント一覧

| コンポーネント | ファイルパス | 役割 |
|---|---|---|
| `JournalCommentSection` | `src/components/journals/JournalCommentSection.tsx` | コメント一覧＋投稿フォームをまとめたセクション |
| `JournalCommentItem` | `src/components/journals/JournalCommentItem.tsx` | コメント1件の表示（アバター・名前・本文・日時・削除ボタン） |
| `JournalCommentForm` | `src/components/journals/JournalCommentForm.tsx` | コメント入力フォーム（管理者のみ表示） |
| `UnreadCommentBadge` | `src/components/journals/UnreadCommentBadge.tsx` | 未読件数バッジ（MatchJournalCard内に組み込む） |

### ユーザーインタラクション

1. 子供がジャーナル詳細ページを開く
   - `unreadCommentCount > 0` の場合、既読処理（`unreadCommentCount = 0` に更新）を実行
   - コメント一覧をリアルタイムで表示（`onSnapshot` を使用）
2. 管理者（親）がジャーナル詳細ページを開く
   - ページ最下部にコメント入力フォームを表示
   - テキストエリアに入力し「送信」ボタンをタップ
   - 投稿完了後、入力フォームをリセットし、一覧にコメントが追加される
3. ジャーナル一覧ページ（`/journals`）
   - 未読コメントがあるカードに件数バッジを表示

---

## 3. UI/UX要件（Designerへの引き継ぎ事項）

### 画面の目的とユーザーの感情体験

- 子供にとって: 「親が見てくれている・応援してくれている」という安心感を与える
- 親にとって: 子供の記録に寄り添い、励ましの言葉を残せる温かみのある体験
- コメントセクションはジャーナル本文の続きとして自然に表示し、別ページ遷移は不要

### 重要なインタラクションポイント

- コメント一覧は `JournalDetailPage` の最下部・削除確認ダイアログの前に配置
- 管理者のコメント入力フォームはスクロール時に画面下部に fixed 表示しない（フォーム位置は一覧の直下・インライン）
- コメントのアバター表示: `GroupMember.avatarUrl` がある場合は画像、ない場合はイニシャルアイコン
- 投稿ボタンは入力が空の場合は disabled
- 未読バッジは `MatchJournalCard` のカード右上に赤い丸バッジで件数を表示（件数が 0 の場合は非表示）

### モバイル対応要件

- コメント入力フォームのテキストエリア: 最小高さ 72px、最大高さ 160px（auto-resize）
- タップターゲット最小サイズ: 44px × 44px
- キーボード表示時にフォームが隠れないよう、スクロール位置を自動調整（`scrollIntoView`）

### 状態の要件

| 状態 | 表示内容 |
|---|---|
| ローディング | スケルトンローダー（コメント2件分の高さ） |
| 空状態（管理者） | 「まだコメントはありません。最初のコメントを送りましょう！」 |
| 空状態（子供） | 「まだコメントはありません」 |
| エラー | Sonnerトーストで「コメントの取得に失敗しました」 |
| 投稿エラー | Sonnerトーストで「コメントの送信に失敗しました」 |

---

## 4. データモデル

### matchJournals/{journalId}/comments サブコレクション

既存の `JournalComment` 型（`src/types/matchJournal.ts` L64-76）をそのまま使用する。

```typescript
// 既存定義（変更なし）
export interface JournalComment {
  id: string;
  journalId: string;
  userId: string;           // 投稿者の Firebase Auth UID
  displayName: string;      // 投稿時のプロフィール表示名
  avatarUrl: string | null; // 投稿時のアバターURL
  role: 'parent' | 'child' | 'member'; // 投稿時のロール
  text: string;             // コメント本文（最大200文字）
  parentCommentId: string | null; // 今回はnull固定（スレッド返信は対象外）
  replyCount: number;       // 今回は0固定
  createdAt: Timestamp;
}
```

**Firestoreに保存する際のフィールド**（id は Firestore が自動生成）:

| フィールド | 型 | 説明 |
|---|---|---|
| `journalId` | string | 親ジャーナルのID |
| `userId` | string | 投稿者のFirebase Auth UID |
| `displayName` | string | 投稿時のプロフィール表示名 |
| `avatarUrl` | string \| null | 投稿時のアバターURL |
| `role` | `'parent' \| 'child' \| 'member'` | `isManager ? 'parent' : 'child'` |
| `text` | string | コメント本文（1〜200文字） |
| `parentCommentId` | null | 今回はスレッド返信なし |
| `replyCount` | number | 固定値 0 |
| `createdAt` | Timestamp | サーバータイムスタンプ |

### matchJournals/{journalId} に追加するフィールド

| フィールド | 型 | デフォルト | 説明 |
|---|---|---|---|
| `unreadCommentCount` | number | 0 | 未読コメント件数（ジャーナルオーナーへの未読） |

**既存の `commentCount` フィールドはそのまま維持し、コメント投稿・削除時に合わせて更新する。**

### TypeScript interface 追記

```typescript
// src/types/matchJournal.ts の MatchJournal interface に追加
unreadCommentCount: number; // 追加フィールド
```

### 既存データモデルとの関係

- `MatchJournal.commentCount` (既存): コメント総数。一覧カードで表示用。
- `MatchJournal.unreadCommentCount` (新規追加): 未読コメント数。バッジ表示用。

---

## 5. API・サービス仕様

### 新規作成: `src/lib/firebase/journalCommentService.ts`

#### `addJournalComment(journalId, comment): Promise<void>`

```
引数:
  journalId: string
  comment: {
    userId: string
    displayName: string
    avatarUrl: string | null
    role: 'parent' | 'child' | 'member'
    text: string
  }
処理:
  1. matchJournals/{journalId}/comments に addDoc
  2. matchJournals/{journalId} の commentCount を +1、unreadCommentCount を +1 (increment)
```

#### `deleteJournalComment(journalId, commentId, userId): Promise<void>`

```
引数:
  journalId: string
  commentId: string
  userId: string (投稿者確認用)
処理:
  1. comments/{commentId} を getDoc して userId が一致するか確認
  2. 一致しない場合は Error('UNAUTHORIZED') をスロー
  3. deleteDoc 実行
  4. matchJournals/{journalId} の commentCount を -1 (0以下にならないよう制御)
  ※ unreadCommentCount は削除時に変更しない（既読済みコメントの削除のみを想定）
```

#### `subscribeJournalComments(journalId, callback): Unsubscribe`

```
処理:
  matchJournals/{journalId}/comments を orderBy('createdAt', 'asc') でリアルタイム購読
  callback: (comments: JournalComment[]) => void
戻り値: Firestore の unsubscribe 関数
```

#### `markCommentsAsRead(journalId): Promise<void>`

```
引数: journalId: string
処理:
  matchJournals/{journalId} の unreadCommentCount を 0 に更新
  ※ ジャーナルオーナーが詳細ページを開いた時のみ呼び出す
```

### 新規作成: `src/hooks/useJournalComments.ts`

#### `useJournalComments(journalId): { comments, isLoading, error }`

- `useEffect` + `subscribeJournalComments` でリアルタイム購読
- コンポーネントのアンマウント時に `unsubscribe` を呼ぶ

#### `useAddJournalComment(): MutationResult`

- `addJournalComment` を呼ぶ TanStack Query mutation
- 成功時: Sonnerトースト「コメントを送信しました」
- 失敗時: Sonnerトースト「コメントの送信に失敗しました」
- 成功時に `queryClient.invalidateQueries(['matchJournal', journalId])` を実行

#### `useDeleteJournalComment(): MutationResult`

- `deleteJournalComment` を呼ぶ TanStack Query mutation
- 成功時: Sonnerトースト「コメントを削除しました」

### Firestoreクエリの仕様

```typescript
// コメント取得クエリ
query(
  collection(db, 'matchJournals', journalId, 'comments'),
  orderBy('createdAt', 'asc')
)

// commentCount・unreadCommentCount の更新
// increment を使用してアトミックに加算
import { increment } from 'firebase/firestore';
updateDoc(journalRef, {
  commentCount: increment(1),
  unreadCommentCount: increment(1),
});
```

### Firebase Storage

今回のコメント機能では Storage は使用しない。

### Stripe連携

今回のコメント機能では Stripe 連携は不要。

---

## 6. セキュリティ要件

### 認証・認可

- コメント投稿: 認証済みユーザーのみ。ただしUIレベルでは `isManager === true` の場合のみフォームを表示する
  - Firestoreルールでは現在 `isAuthenticated()` のみの制限だが、ビジネスロジック上は管理者のみが投稿する
  - 将来的にルールで `role=owner` を強制する場合はルール変更が必要（現状は不要）
- コメント閲覧: ジャーナルオーナー本人または同グループメンバー
- コメント削除: 投稿者本人のみ
- `markCommentsAsRead`: ジャーナルオーナー本人のみ呼び出す（サービス関数内でチェック）

### Firestoreセキュリティルールの変更

**現行ルール（`matchJournals/{journalId}/comments`）の問題点と修正が必要な箇所:**

```
// 現行 (firestore.rules L190-198)
match /comments/{commentId} {
  allow read: if isOwner(get(...).data.userId) || isSameGroup(get(...).data.groupId);
  allow create: if isAuthenticated() &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.text.size() <= 200;  // ← text.size() > 0 の下限チェックが欠落
  allow delete: if isOwner(resource.data.userId);
  allow update: if false;
}
```

**修正内容:**
1. `create` ルールに `request.resource.data.text.size() > 0` の下限チェックを追加
2. `create` ルールに `request.resource.data.role in ['parent', 'child', 'member']` のバリデーションを追加
3. `matchJournals/{journalId}` の `update` ルールで `unreadCommentCount` フィールドの更新を許可
   - 現行の update ルールは `isSameGroup` でグループメンバーなら更新可能なため、既読処理（`markCommentsAsRead`）は現行ルールで対応可能

**確認が必要な既存ルール:**

```
// matchJournals の update ルール (L185-187)
allow update: if (isOwner(resource.data.userId) || isSameGroup(resource.data.groupId)) &&
               resource.data.userId == request.resource.data.userId;
```

`unreadCommentCount` の更新は「コメント投稿者（管理者）がジャーナルドキュメントを更新する」ケースと「ジャーナルオーナーが既読処理する」ケースの両方がある。いずれも `isSameGroup` で許可されるが、`resource.data.userId == request.resource.data.userId` の制約（userId の書き換え不可）は維持されているため問題なし。

### 入力バリデーション仕様

- `text`: 1文字以上200文字以下（Zod schema で検証）
- `text`: XSSを防ぐため表示時は `textContent` / React の JSX テキストノードとして表示（`dangerouslySetInnerHTML` は使用しない）
- `displayName`, `avatarUrl`: `activeProfile` から取得するためユーザー直接入力ではない

### Stripe Webhook署名検証

今回のコメント機能では Stripe 連携なし。

---

## 7. テスト観点

### ユニットテスト（Vitest）

#### `journalCommentService.ts` のテスト: `tests/unit/journals/journalCommentService.test.ts`

| テストケース | 種別 |
|---|---|
| `addJournalComment`: 正常投稿でサブコレクションに追加・commentCount/unreadCommentCount がインクリメントされる | 正常系 |
| `addJournalComment`: text が空文字列の場合はエラーをスロー | 異常系 |
| `addJournalComment`: text が201文字の場合はエラーをスロー | 異常系 |
| `deleteJournalComment`: 投稿者本人の場合は削除成功・commentCount がデクリメントされる | 正常系 |
| `deleteJournalComment`: 別ユーザーの場合は UNAUTHORIZED エラーをスロー | 異常系 |
| `markCommentsAsRead`: unreadCommentCount が 0 に更新される | 正常系 |

#### `useJournalComments.ts` のテスト: `tests/unit/journals/useJournalComments.test.ts`

| テストケース | 種別 |
|---|---|
| コメント一覧が正しく取得・表示される | 正常系 |
| 投稿成功時にトーストが表示される | 正常系 |
| 投稿失敗時にエラートーストが表示される | 異常系 |
| 削除成功時にトーストが表示される | 正常系 |

#### `JournalCommentForm.tsx` のテスト

| テストケース | 種別 |
|---|---|
| `isManager=true` のとき入力フォームが表示される | 正常系 |
| `isManager=false` のとき入力フォームが表示されない | 正常系 |
| テキストが空の時は送信ボタンが disabled | 正常系 |
| 200文字超入力時に送信できない | 異常系 |

### E2Eテスト（Playwright）: `tests/e2e/journalComments.spec.ts`

| シナリオ | 手順 |
|---|---|
| 管理者がコメントを投稿できる | 1. 管理者プロフィールでログイン 2. ジャーナル詳細ページへ遷移 3. コメント入力フォームに文字を入力 4. 送信ボタンをタップ 5. コメントが一覧に表示される |
| 子供プロフィールではコメント入力フォームが表示されない | 1. 子供プロフィールでログイン 2. ジャーナル詳細ページへ遷移 3. コメント入力フォームが存在しないことを確認 |
| 詳細ページを開くと未読バッジがリセットされる | 1. 未読コメントがあるジャーナルカードのバッジを確認 2. 詳細ページへ遷移 3. バッジが消えることを確認 |
| コメントを削除できる | 1. 管理者がコメント投稿 2. コメントの削除ボタンをタップ 3. コメントが一覧から消える |

### エッジケース

- groupId が null のジャーナル（グループ未所属）へのコメント: 閲覧はオーナーのみ、投稿はオーナー本人かつ管理者のみ
- ジャーナル削除時のコメントの扱い: `matchJournalService.deleteMatchJournal` にサブコレクションの削除は含まれない（Firestore はサブコレクションを自動削除しないため、Cloud Functions による削除が推奨だが今回のスコープ外）
- `commentCount` が 0 未満にならないよう `Math.max(0, ...)` による保護
- オフライン時のコメント投稿: Firebase SDK のオフラインキャッシュに依存（特別な対応なし）

---

## 8. 変更対象ファイル

### 新規作成するファイル

| ファイルパス | 内容 |
|---|---|
| `src/lib/firebase/journalCommentService.ts` | コメントCRUD・既読処理のFirebaseサービス |
| `src/hooks/useJournalComments.ts` | コメント取得・投稿・削除のカスタムフック |
| `src/components/journals/JournalCommentSection.tsx` | コメントセクション全体のコンポーネント |
| `src/components/journals/JournalCommentItem.tsx` | コメント1件のコンポーネント |
| `src/components/journals/JournalCommentForm.tsx` | コメント入力フォームコンポーネント |
| `src/components/journals/UnreadCommentBadge.tsx` | 未読件数バッジコンポーネント |
| `tests/unit/journals/journalCommentService.test.ts` | サービスのユニットテスト |
| `tests/unit/journals/useJournalComments.test.ts` | フックのユニットテスト |
| `tests/e2e/journalComments.spec.ts` | E2Eテスト |

### 修正するファイル

| ファイルパス | 変更内容 |
|---|---|
| `src/types/matchJournal.ts` | `MatchJournal` interface に `unreadCommentCount: number` フィールドを追加 |
| `src/routes/app/journals/JournalDetailPage.tsx` | コメントセクション（`JournalCommentSection`）を追加・既読処理を呼び出す |
| `src/components/journals/MatchJournalCard.tsx` | `UnreadCommentBadge` を追加 |
| `firestore.rules` | `matchJournals/comments` の create ルールに下限・role バリデーションを追加 |
| `src/lib/firebase/matchJournalService.ts` | `deleteMatchJournal` 内でのコメント削除（スコープ外とするが要確認） |

---

## 9. 完了の定義

- `npm run build` が成功すること（TypeScriptエラーなし）
- `src/types/matchJournal.ts` の `MatchJournal` に `unreadCommentCount` フィールドが追加されていること
- ユニットテストが全件パスすること（`npm run test`）
- E2Eテストが全件パスすること（`npx playwright test tests/e2e/journalComments.spec.ts`）
- 以下の操作で動作を確認できること:
  1. 管理者プロフィールに切り替え → ジャーナル詳細ページでコメント入力フォームが表示される
  2. コメントを入力して送信 → 一覧にコメントが追加される
  3. 子供プロフィールに切り替え → 同じジャーナル詳細ページでコメント入力フォームが表示されない
  4. ジャーナル一覧ページで該当カードに未読バッジ（件数）が表示されている
  5. 子供プロフィールでジャーナル詳細を開く → バッジが消える
  6. 管理者プロフィールで自分のコメントを削除 → 一覧から消える
- Firestoreセキュリティルールの変更が `firestore.rules` に反映されていること

---

## 付録: 未決事項（Designerへの確認事項）

1. コメント入力フォームの表示位置: ページ最下部インライン固定か、スティッキーフッターか
2. 管理者が複数いる場合（グループに owner が複数いる場合）の対応: 全 owner がコメント可能で問題ないか
3. コメント件数の上限設定: 無制限で良いか、または1ジャーナルあたり最大件数を設けるか
4. プッシュ通知との連携: 今回は未読バッジのみで、プッシュ通知は対象外か確認
