# FamNote コアコンセプト変更仕様書 v1
## 「試合ジャーナル × 親子コミュニケーションツール」

**バージョン:** 1.0.0
**作成日:** 2026-04-18
**更新日:** 2026-04-18
**作成者:** Plannerエージェント
**ステータス:** Designer引き継ぎ待ち

---

## 目次

1. [コアコンセプト変更の定義](#1-コアコンセプト変更の定義)
2. [機能要件](#2-機能要件)
3. [UI/UX要件](#3-uiux要件)
4. [データモデル](#4-データモデル)
5. [APIサービス仕様](#5-apiサービス仕様)
6. [セキュリティ要件](#6-セキュリティ要件)
7. [テスト観点](#7-テスト観点)
8. [変更対象ファイル](#8-変更対象ファイル)
9. [実装優先順位](#9-実装優先順位)
10. [完了の定義](#10-完了の定義)

---

## 1. コアコンセプト変更の定義

### 1.1 変更の概要

| 観点 | 変更前 | 変更後 |
|------|--------|--------|
| コアコンセプト | 練習記録アプリ | 試合ジャーナル × 親子コミュニケーションツール |
| メイン機能 | 練習ノート（毎日の練習記録） | 試合ジャーナル（試合前後のセット記録） |
| サブ機能 | 試合記録（スコア・ハイライト） | 練習メモ（シンプルな箇条書き） |
| 記録スタイル | 自由テキスト中心 | 箇条書き（bullet形式）中心 |
| 親の関与 | リアクション・コメント | スタンプ + スレッドコメント + ハイライトピン閲覧 |
| 振り返り | 統計グラフ中心 | ハイライトピン集約 + 月別タイムライン |

### 1.2 既存機能との関係

- **既存の `matches` コレクション**: 廃止せず、新しい `MatchJournal` の基盤として再設計する。既存データは `matchType: 'legacy'` でマーキングして保持する。
- **既存の `notes` コレクション**: `PracticeNote`（練習メモ）として縮小継続。既存データはそのまま保持する。
- **既存のリアクション機能**: そのまま活用。絵文字スタンプ（👏🔥⭐💪）は変更しない。
- **既存のコメント機能**: スレッド形式に拡張する。
- **既存のゴール機能**: 今回の変更スコープ外（Phase 2以降で「試合目標」と統合を検討）。

### 1.3 背景・目的

子供がスポーツを通じて成長する過程で最も重要な体験は「試合」です。試合前に目標を設定し、試合後に振り返ることで自己成長を実感できます。また、親が子供の気づきにスタンプやコメントで反応することで、家族の絆が深まります。本変更はこの体験に最適化します。

### 1.4 対象ユーザー

- **子供（主要ユーザー）**: 小学生〜高校生。試合前後に自分のジャーナルを記録する。
- **保護者（サブユーザー）**: 子供の記録を閲覧し、スタンプ・コメントで応援する。

---

## 2. 機能要件

### 2.1 試合ジャーナル（メイン機能）

#### 2.1.1 概念モデル

試合ジャーナルは「試合前ノート」と「試合後ノート」を1セットとして扱う。

```
MatchJournal（1試合 = 1セット）
├── PreMatchNote（試合前ノート）  ← 試合前に記録
│   ├── 目標リスト（箇条書き）
│   └── チャレンジしたいこと（箇条書き）
└── PostMatchNote（試合後ノート）← 試合後に記録
    ├── 目標ごとの振り返り（箇条書き）
    ├── できたこと（箇条書き）
    ├── できなかったこと / 課題（箇条書き）
    └── もっと探求したいこと（箇条書き）
```

#### 2.1.2 試合前ノートの記録

**フィールド一覧:**

| フィールド | 入力形式 | 必須 | 上限 | 説明 |
|-----------|---------|------|------|------|
| 試合日 | date picker | 必須 | - | デフォルト: 今日 |
| スポーツ種目 | select | 必須 | - | ユーザーのスポーツから選択 |
| 対戦相手 | text | 必須 | 50文字 | 例: 「○○FC」 |
| 会場 | text | 任意 | 50文字 | 例: 「市営グラウンド」 |
| 今日の目標（箇条書き） | bullet list | 必須 | 各項目100文字、最大10項目 | 試合で達成したいこと |
| チャレンジしたいこと（箇条書き） | bullet list | 任意 | 各項目100文字、最大5項目 | 今日初めて試したいこと |
| 公開設定 | toggle | 必須 | - | 家族に公開 or 自分のみ |

**箇条書き入力UI仕様:**
- 1行 = 1アイテム
- Enterキーで次のアイテムを追加
- Backspaceで空アイテムを削除（前の行に戻る）
- 各アイテムの左端に📌ピンボタンを表示
- アイテムのドラッグ並び替えは不要（シンプルさ優先）

**処理フロー:**
1. フォーム送信 → Firestore `matchJournals` コレクションに `status: 'pre'` で保存
2. 試合後ノート未記入の間は「試合後の振り返りを記録する」ボタンをカード上に常時表示

#### 2.1.3 試合後ノートの記録

**前提:** 試合前ノートが存在するジャーナルIDを引き継いで記録する。試合前ノートなしで試合後のみ記録することも可能（`preNote: null`）。

**フィールド一覧:**

| フィールド | 入力形式 | 必須 | 上限 | 説明 |
|-----------|---------|------|------|------|
| 試合結果 | 勝/分/負/ボタン | 任意 | - | |
| 自チームスコア | number | 任意 | - | |
| 相手スコア | number | 任意 | - | |
| 目標の振り返り（箇条書き） | 試合前目標に対応する評価 | 任意 | - | 各目標に「できた/できなかった/部分的に」チェック + コメント（任意）50文字 |
| できたこと（箇条書き） | bullet list | 任意 | 各項目100文字、最大10項目 | |
| できなかったこと/課題（箇条書き） | bullet list | 任意 | 各項目100文字、最大10項目 | |
| もっと探求したいこと（箇条書き） | bullet list | 任意 | 各項目100文字、最大5項目 | 次の練習や試合で試したいこと |
| パフォーマンス評価 | 1-5星 | 任意 | - | 自己評価 |
| 写真 | file upload | 任意 | 5枚、各10MB | |
| 公開設定 | toggle | 必須 | - | |

**処理フロー:**
1. 試合前ノートのジャーナルIDから `matchJournals/{journalId}` を更新
2. `status: 'completed'` に変更
3. タイムラインに「試合後ノートが追加されました」として表示

#### 2.1.4 試合ジャーナル表示

**ジャーナル詳細画面の構成:**
- ヘッダー: 試合基本情報（日付・相手・スコア・勝敗）
- セクション1: 「試合前の目標」（箇条書き表示、ピン済みアイコン付き）
- セクション2: 「試合後の振り返り」（目標達成状況 + できたこと/できなかったこと/探求したいこと）
- セクション3: 写真ギャラリー
- セクション4: 親からのリアクション・コメント

**ステータス表示:**
- `status: 'pre'`: 「試合前ノート記録済 - 試合後の振り返りを待っています」バッジ（アンバー）
- `status: 'completed'`: 「振り返り完了」バッジ（グリーン）
- `status: 'post_only'`: 「試合後ノートのみ」バッジ（スレート）

---

### 2.2 練習メモ（サブ機能）

既存の練習ノートを大幅に縮小する。詳細な記録ではなく「ちょっとしたメモ」として位置づける。

#### 2.2.1 練習メモの記録

**フィールド一覧（縮小後）:**

| フィールド | 入力形式 | 必須 | 上限 | 説明 |
|-----------|---------|------|------|------|
| 日付 | date picker | 必須 | - | デフォルト: 今日 |
| スポーツ種目 | select | 必須 | - | |
| メモ（箇条書き） | bullet list | 必須 | 各項目100文字、最大5項目 | 今日気づいたこと・やったこと |
| 公開設定 | toggle | 必須 | - | |

**削除するフィールド（既存から）:**
- 練習時間（durationMinutes）
- 場所（location）
- 今日の目標（todayGoal）
- 振り返り（reflection）
- 体調（condition）
- 画像添付

**後方互換性:** 既存の `notes` コレクションの旧フィールドは読み取り専用で表示する。新規作成は新フォームのみ。

---

### 2.3 ハイライトピン機能

#### 2.3.1 概要

箇条書きの各アイテムに📌ピンボタンを配置し、特に印象に残った一文・気づきをピン留めできる機能。ピンされたアイテムはプロフィールページと振り返りページに集約表示される。

#### 2.3.2 ピン操作

- 各箇条書きアイテムの左端に📌ボタンを表示
- ボタンをタップ/クリックでピン追加（ピン済みはハイライト表示）
- 再タップでピン解除
- 1つのジャーナルにピンできる数の上限: 制限なし
- ピン済みアイテムは詳細画面でも📌アイコン付きで表示

#### 2.3.3 ハイライトピン集約表示

**プロフィールページのハイライトセクション:**
- 「気づきのかけら」コレクションとして表示
- 最新10件をカード形式で表示
- 「すべて見る」→ 振り返りページのピン一覧へ

**振り返りページのピン一覧:**
- 全ピン済みアイテムを日付降順で表示
- 絞り込み: スポーツ種目、期間（今月/3ヶ月/全期間）、ノートタイプ（試合前/試合後/練習）
- 各カードには出典（どのジャーナルの何番目のアイテムか）を表示
- タップで元のジャーナル/ノートへリンク

---

### 2.4 親子コミュニケーション強化

#### 2.4.1 スタンプ（リアクション）

既存機能を変更なしで継続使用。

- 使用可能スタンプ: 👏（applause）/ 🔥（fire）/ ⭐（star）/ 💪（muscle）
- 対象: 試合ジャーナル・練習メモ（既存の note / match タイプも継続対応）
- 1ユーザー1投稿につき各絵文字1回まで

#### 2.4.2 スレッドコメント（既存コメント機能の拡張）

**現状:** フラットなコメントリスト（`text` フィールドのみ）

**変更後:** 親コメント + 子コメント（返信）のスレッド形式

**フィールド追加:**
- `parentCommentId: string | null` — nullの場合は親コメント、IDがある場合は返信
- `replyCount: number` — 返信数カウント（親コメントのみ）

**UI仕様:**
- 親コメントの下に最大2件の返信を折りたたみ表示
- 「返信を見る（n件）」で全件展開
- 各コメントに「返信する」ボタンを配置
- 返信入力時は「@表示名 への返信」とプレースホルダー表示
- 親コメントの最大文字数: 200文字（変更なし）
- 返信の最大文字数: 200文字

**親ユーザーの特別表示:**
- グループのオーナーまたは `role: 'parent'` のユーザーのコメントには「親」バッジを表示
- 親コメントは子供がひと目で識別できるようスタイルを差別化（アクセントカラー枠）

---

### 2.5 振り返りビュー（新規）

#### 2.5.1 月別タイムライン

- `/review` ページとして新設
- デフォルト: 当月の試合ジャーナルを時系列表示
- 月切り替えナビゲーション（左右矢印）
- 各アイテムは試合カード（ミニ表示: 日付・相手・スコア・達成率）
- 練習メモも含めて表示（小さめのカードで区別）

#### 2.5.2 ハイライトピン一覧

- `/review/highlights` ページとして新設
- 全ピン済みアイテムの集約表示
- 絞り込みフィルター付き（スポーツ・期間・ノートタイプ）

#### 2.5.3 達成率サマリー

- 月次サマリーカード: 試合数・勝率・目標達成率（試合前目標のうちできた割合）
- 数値はシンプルな数字表示（グラフ化はPhase 2）

---

## 3. UI/UX要件

### 3.1 Designerへの引き継ぎ事項

#### 3.1.1 各画面の目的とユーザーの感情体験

| 画面 | 目的 | 期待する感情体験 |
|------|------|----------------|
| 試合前ノート入力 | 集中力と意図を高める | 「よし、今日の試合で何をやるか決めた！」という前向きな緊張感 |
| 試合後ノート入力 | 成長の気づきを言語化する | 「今日学んだことを整理できた」という達成感と内省 |
| ジャーナル詳細 | 振り返りと親への共有 | 「自分の成長が見える」「親に見てもらえる」という誇り |
| ハイライトピン集約 | 気づきのコレクション体験 | 「こんなにたくさん気づいたんだ」という自己肯定感 |
| 親コメント閲覧 | 親からの応援を受け取る | 「お父さん/お母さんが見てくれている」という安心感 |
| 振り返りビュー | 過去の自分との対話 | 「あの試合から成長した」という時間軸での自己認識 |

#### 3.1.2 重要なインタラクションポイント

- **箇条書き入力**: Enterで次の行、スムーズなフォーカス移動。モバイルでは縦スペース確保。
- **📌ピンボタン**: 軽いタップ感（scale animation）。ピン済みは色付きハイライト。
- **試合前→後の流れ**: ジャーナル詳細画面で「試合後の振り返りを書く」ボタンを目立たせる。試合前ノートの目標リストが試合後フォームに引き継がれる。
- **親コメントの特別感**: 子供が親のコメントを受け取る喜びを演出するため、親コメント追加時にアプリ内通知（Sonner）を表示。
- **スレッドコメント展開**: アニメーション付きでスムーズに展開/折りたたみ。

#### 3.1.3 モバイル対応要件

- 箇条書き入力フォームはモバイルで快適に使えること（フォントサイズ16px、タッチターゲット44px以上）
- 📌ピンボタンは左端に固定（スワイプや誤タップを防ぐ）
- 試合前/試合後のタブ切り替えはボトムエリアに固定ナビとして配置
- スレッドコメントは縦方向にコンパクトに表示

#### 3.1.4 エラー状態・空状態・ローディング状態

| 状態 | 画面/コンポーネント | 表示内容 |
|------|------------------|---------|
| 空状態（試合ジャーナルなし） | ジャーナル一覧 | 「最初の試合を記録しよう！」+ CTAボタン。サッカーボール等のイラスト。 |
| 空状態（練習メモなし） | 練習メモ一覧 | 「今日の練習で気づいたことをメモしよう」+ CTAボタン |
| 空状態（ピンなし） | ハイライト一覧 | 「気づきを📌ピンしてコレクションを作ろう」 |
| ローディング | ジャーナル一覧・詳細 | スケルトンスクリーン（カード形状） |
| 試合後ノート未記入 | ジャーナルカード | アンバーバッジ「振り返り待ち」+ 「書く」ボタン |
| 保存エラー | フォーム送信時 | Sonnerトースト（赤）「保存に失敗しました。再試行してください」 |
| 試合前ノート削除確認 | 削除ボタン押下時 | 確認ダイアログ「このジャーナルを削除すると試合後ノートも削除されます」 |

---

## 4. データモデル

### 4.1 Firestoreコレクション構成（変更後）

```
Firestore
├── users/            （変更なし）
├── groups/           （変更なし）
├── matchJournals/    ← 新規コレクション（メイン）
│   └── {journalId}/
│       ├── (フィールド)
│       └── comments/ （サブコレクション、スレッド対応）
│           └── {commentId}/
├── notes/            ← 縮小継続（練習メモ）
│   └── {noteId}/
│       └── comments/
├── highlights/       ← 新規コレクション（ハイライトピン）
│   └── {highlightId}/
├── reactions/        （変更なし）
├── goals/            （変更なし）
└── inviteCodes/      （変更なし）
```

**廃止するコレクション:** `matches/` コレクションは廃止せず読み取り専用として保持する。

### 4.2 TypeScript interface定義

#### 4.2.1 試合ジャーナル

```typescript
// src/types/matchJournal.ts
import { Timestamp } from 'firebase/firestore';
import { Sport } from './sport';
import { ReactionType } from './reaction';

export type JournalStatus = 'pre' | 'completed' | 'post_only';
export type GoalAchievement = 'achieved' | 'partial' | 'not_achieved';

// 箇条書きの1アイテム
export interface BulletItem {
  id: string;          // nanoidで生成
  text: string;        // 最大100文字
  isPinned: boolean;   // ハイライトピン状態
}

// 試合前目標の振り返り
export interface GoalReview {
  goalItemId: string;         // 対応する試合前 BulletItem の id
  achievement: GoalAchievement;
  comment: string | null;     // 最大50文字
}

// 試合ジャーナル本体
export interface MatchJournal {
  id: string;
  userId: string;
  groupId: string;
  sport: Sport;
  date: Timestamp;
  opponent: string;
  venue: string | null;
  status: JournalStatus;
  isDraft: boolean;
  isPublic: boolean;

  // 試合前ノート
  preNote: {
    goals: BulletItem[];        // 今日の目標（必須、最大10項目）
    challenges: BulletItem[];   // チャレンジしたいこと（任意、最大5項目）
    recordedAt: Timestamp;
  } | null;

  // 試合後ノート
  postNote: {
    result: 'win' | 'draw' | 'loss' | null;
    myScore: number | null;
    opponentScore: number | null;
    goalReviews: GoalReview[];   // 試合前目標の振り返り
    achievements: BulletItem[];  // できたこと（最大10項目）
    improvements: BulletItem[];  // できなかったこと/課題（最大10項目）
    explorations: BulletItem[];  // もっと探求したいこと（最大5項目）
    performance: 1 | 2 | 3 | 4 | 5 | null;
    imageUrls: string[];
    recordedAt: Timestamp;
  } | null;

  reactionCounts: Record<ReactionType, number>;
  commentCount: number;
  pinnedCount: number;   // ピン済みアイテム合計数（集計用）
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ジャーナルコメント（スレッド対応）
export interface JournalComment {
  id: string;
  journalId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'parent' | 'child' | 'member';   // グループ内の役割
  text: string;                          // 最大200文字
  parentCommentId: string | null;        // null = 親コメント
  replyCount: number;                    // 親コメントのみ使用
  createdAt: Timestamp;
}

// フォームデータ型（試合前）
export interface PreMatchFormData {
  sport: Sport;
  date: string;       // ISO文字列
  opponent: string;
  venue: string | null;
  goals: string[];    // テキスト配列（BulletItemへの変換はフック側で）
  challenges: string[];
  isPublic: boolean;
}

// フォームデータ型（試合後）
export interface PostMatchFormData {
  result: 'win' | 'draw' | 'loss' | null;
  myScore: number | null;
  opponentScore: number | null;
  goalReviews: { goalItemId: string; achievement: GoalAchievement; comment: string | null }[];
  achievements: string[];
  improvements: string[];
  explorations: string[];
  performance: 1 | 2 | 3 | 4 | 5 | null;
  isPublic: boolean;
}
```

#### 4.2.2 練習メモ（縮小後）

```typescript
// src/types/note.ts（変更後）
// 既存フィールドはそのまま保持。新規作成時は下記のみ使用。

export interface PracticeNote {
  id: string;
  userId: string;
  groupId: string;
  sport: Sport;
  date: Timestamp;
  bullets: BulletItem[];   // 箇条書きメモ（最大5項目）
  isDraft: boolean;
  isPublic: boolean;
  reactionCounts: Record<ReactionType, number>;
  commentCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 後方互換: 既存の Note 型は変更しない（読み取り専用表示用）
```

#### 4.2.3 ハイライトピン

```typescript
// src/types/highlight.ts（新規）
import { Timestamp } from 'firebase/firestore';
import { Sport } from './sport';

export type HighlightSourceType = 'journal_pre_goal' | 'journal_pre_challenge' |
  'journal_post_achievement' | 'journal_post_improvement' | 'journal_post_exploration' |
  'practice_bullet';

export interface Highlight {
  id: string;
  userId: string;
  groupId: string;
  sport: Sport;
  sourceType: HighlightSourceType;
  sourceId: string;          // journalId または noteId
  bulletItemId: string;      // BulletItem の id
  text: string;              // ピン時のテキストコピー（元テキストが変わっても保持）
  sourceDate: Timestamp;     // 元のジャーナル/メモの日付
  createdAt: Timestamp;
}
```

#### 4.2.4 コメント（スレッド対応）の既存型への追加

既存の `NoteComment` および `MatchComment` を以下のフィールドで拡張する（後方互換を保つため `?` で定義）:

```typescript
// 既存の NoteComment / MatchComment に追加するフィールド
parentCommentId?: string | null;
replyCount?: number;
role?: 'parent' | 'child' | 'member';
```

### 4.3 Firestoreインデックス追加定義

```json
{
  "indexes": [
    {
      "collectionGroup": "matchJournals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "groupId", "order": "ASCENDING" },
        { "fieldPath": "isPublic", "order": "ASCENDING" },
        { "fieldPath": "isDraft", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matchJournals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isDraft", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matchJournals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "highlights",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "sourceDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "highlights",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "sport", "order": "ASCENDING" },
        { "fieldPath": "sourceDate", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 5. APIサービス仕様

Vite + クライアントサイドレンダリングのため、Firebase SDK をクライアントから直接呼び出す。Server Actions は使用しない。

### 5.1 試合ジャーナルサービス (`src/lib/firebase/matchJournalService.ts`)

```typescript
// 試合前ノート作成（新規ジャーナル生成）
export async function createPreMatchNote(
  userId: string,
  groupId: string,
  data: PreMatchFormData
): Promise<{ journalId: string }>

// 試合後ノート追加（既存ジャーナルに追記）
export async function addPostMatchNote(
  journalId: string,
  userId: string,
  data: PostMatchFormData,
  imageFiles?: File[]
): Promise<void>

// 試合後ノートのみ作成（試合前なし）
export async function createPostMatchOnly(
  userId: string,
  groupId: string,
  baseData: { sport: Sport; date: string; opponent: string; venue: string | null },
  postData: PostMatchFormData,
  imageFiles?: File[]
): Promise<{ journalId: string }>

// ジャーナル更新（試合前/後それぞれ）
export async function updatePreMatchNote(
  journalId: string,
  userId: string,
  data: Partial<PreMatchFormData>
): Promise<void>

export async function updatePostMatchNote(
  journalId: string,
  userId: string,
  data: Partial<PostMatchFormData>
): Promise<void>

// ジャーナル削除（Storage画像も削除）
export async function deleteMatchJournal(
  journalId: string,
  userId: string
): Promise<void>

// グループのジャーナル一覧取得（タイムライン用、ページネーション対応）
export async function fetchGroupJournals(
  groupId: string,
  limit: number,
  startAfter?: DocumentSnapshot
): Promise<MatchJournal[]>

// ユーザー自身のジャーナル一覧（月別フィルター対応）
export async function fetchUserJournals(
  userId: string,
  year: number,
  month: number
): Promise<MatchJournal[]>
```

### 5.2 ハイライトピンサービス (`src/lib/firebase/highlightService.ts`)

```typescript
// ピン追加
export async function pinHighlight(
  userId: string,
  groupId: string,
  sport: Sport,
  sourceType: HighlightSourceType,
  sourceId: string,
  bulletItem: BulletItem,
  sourceDate: Timestamp
): Promise<{ highlightId: string }>

// ピン解除（BulletItemのisPinnedも更新）
export async function unpinHighlight(
  highlightId: string,
  userId: string,
  sourceId: string,
  bulletItemId: string,
  sourceType: HighlightSourceType
): Promise<void>

// ユーザーのハイライト一覧取得（フィルター付き）
export async function fetchUserHighlights(
  userId: string,
  options?: {
    sport?: Sport;
    sourceType?: HighlightSourceType;
    limit?: number;
    startAfter?: DocumentSnapshot;
  }
): Promise<Highlight[]>
```

### 5.3 スレッドコメントサービス (`src/lib/firebase/commentService.ts`)

既存のコメント機能を拡張する。

```typescript
// コメント投稿（親コメントまたは返信）
export async function postComment(
  targetType: 'journal' | 'note',
  targetId: string,
  userId: string,
  displayName: string,
  avatarUrl: string | null,
  role: 'parent' | 'child' | 'member',
  text: string,
  parentCommentId?: string   // 返信の場合は親コメントID
): Promise<{ commentId: string }>

// コメント削除
export async function deleteComment(
  targetType: 'journal' | 'note',
  targetId: string,
  commentId: string,
  userId: string,
  parentCommentId?: string   // 返信の場合: 親コメントのreplyCountを更新
): Promise<void>

// コメント一覧取得（親コメントのみ）
export async function fetchParentComments(
  targetType: 'journal' | 'note',
  targetId: string,
  limit?: number
): Promise<JournalComment[]>

// 返信一覧取得
export async function fetchReplies(
  targetType: 'journal' | 'note',
  targetId: string,
  parentCommentId: string
): Promise<JournalComment[]>
```

### 5.4 Firestoreクエリ仕様

#### タイムライン用クエリ（試合ジャーナル）

```typescript
// groupId + isPublic + isDraft + date 複合インデックス使用
query(
  collection(db, 'matchJournals'),
  where('groupId', '==', groupId),
  where('isPublic', '==', true),
  where('isDraft', '==', false),
  orderBy('date', 'desc'),
  limit(15)
)
```

#### ハイライト一覧クエリ

```typescript
// userId + sourceDate インデックス使用
query(
  collection(db, 'highlights'),
  where('userId', '==', userId),
  orderBy('sourceDate', 'desc'),
  limit(20)
)
```

### 5.5 Firebase Storage

- 試合後ノートの写真: `matchJournals/{journalId}/{filename}`
- 練習メモの画像: 今回は添付なし（縮小後のスコープ外）

### 5.6 Stripe連携

今回の変更スコープ外。既存のStripe設定に変更なし。

---

## 6. セキュリティ要件

### 6.1 認証・認可

- `matchJournals` の作成・更新・削除: `request.auth.uid == resource.data.userId` を必須条件とする
- `matchJournals` の読み取り: 自分のドキュメント（isPublic問わず）または同グループメンバー（isPublic == true かつ isDraft == false）
- `highlights` の操作: 自分のハイライトのみ（`userId == request.auth.uid`）
- `highlights` の読み取り: 自分のハイライトのみ（他メンバーのピンは非公開）
- コメントの作成: 同グループメンバーのみ
- コメントの削除: 自分のコメントのみ

### 6.2 Firestoreセキュリティルールの変更

新規追加が必要なルール:

```javascript
// matchJournals コレクション
match /matchJournals/{journalId} {
  allow read: if isOwner(resource.data.userId) ||
                 (isSameGroup(resource.data.groupId) &&
                  resource.data.isPublic == true &&
                  resource.data.isDraft == false);
  allow create: if isAuthenticated() &&
                   request.resource.data.userId == request.auth.uid &&
                   isValidJournal(request.resource.data);
  allow update: if isOwner(resource.data.userId) &&
                   request.resource.data.userId == resource.data.userId;
  allow delete: if isOwner(resource.data.userId);

  match /comments/{commentId} {
    allow read: if isOwner(get(/databases/$(database)/documents/matchJournals/$(journalId)).data.userId) ||
                   isSameGroup(get(/databases/$(database)/documents/matchJournals/$(journalId)).data.groupId);
    allow create: if isAuthenticated() &&
                     request.resource.data.userId == request.auth.uid &&
                     request.resource.data.text.size() <= 200;
    allow delete: if isOwner(resource.data.userId);
    allow update: if false;
  }
}

// highlights コレクション
match /highlights/{highlightId} {
  allow read: if isOwner(resource.data.userId);
  allow create: if isAuthenticated() &&
                   request.resource.data.userId == request.auth.uid;
  allow delete: if isOwner(resource.data.userId);
  allow update: if false;
}
```

`isValidJournal` 関数の定義:

```javascript
function isValidJournal(data) {
  return data.opponent is string && data.opponent.size() > 0 && data.opponent.size() <= 50 &&
         data.sport in ['soccer', 'baseball', 'basketball', 'tennis', 'volleyball', 'swimming', 'athletics', 'other'] &&
         data.isPublic is bool &&
         data.isDraft is bool;
}
```

### 6.3 入力バリデーション仕様

Zodスキーマで定義する (`src/lib/validations/matchJournalSchema.ts`):

```typescript
const bulletItemSchema = z.object({
  text: z.string().min(1).max(100),
  isPinned: z.boolean(),
});

const preMatchSchema = z.object({
  sport: z.enum(SPORTS),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // YYYY-MM-DD
  opponent: z.string().min(1).max(50),
  venue: z.string().max(50).nullable(),
  goals: z.array(z.string().min(1).max(100)).min(1).max(10),
  challenges: z.array(z.string().max(100)).max(5),
  isPublic: z.boolean(),
});

const postMatchSchema = z.object({
  result: z.enum(['win', 'draw', 'loss']).nullable(),
  myScore: z.number().int().min(0).nullable(),
  opponentScore: z.number().int().min(0).nullable(),
  achievements: z.array(z.string().max(100)).max(10),
  improvements: z.array(z.string().max(100)).max(10),
  explorations: z.array(z.string().max(100)).max(5),
  performance: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).nullable(),
  isPublic: z.boolean(),
});
```

### 6.4 XSS対策

- ReactのJSX自動エスケープを活用。`dangerouslySetInnerHTML` は使用しない。
- ユーザー入力テキストはFirestoreに保存前にZodでバリデーション済み。
- Storage URLはFirebase発行のURLのみ使用。

### 6.5 Stripe Webhook

今回のスコープ外。変更なし。

---

## 7. テスト観点

### 7.1 ユニットテスト（Vitest）

#### `tests/unit/lib/matchJournalService.test.ts`

**正常系:**
- 試合前ノート作成後、`status: 'pre'` でFirestoreに保存される
- 試合後ノート追加後、`status: 'completed'` に更新される
- 試合後ノートのみ作成時、`status: 'post_only'` で保存される
- ジャーナル削除時、Storageの画像URLも削除処理が呼ばれる

**異常系:**
- 対戦相手が空文字の場合にバリデーションエラー
- 目標が0件でフォーム送信するとエラー
- 目標が11件以上の場合にバリデーションエラー
- 未来の日付で試合後ノートを保存しようとするとエラー（日付は当日以前）

#### `tests/unit/lib/highlightService.test.ts`

**正常系:**
- ピン追加時に `highlights` コレクションに保存され、元の `BulletItem.isPinned` が `true` になる
- ピン解除時に `highlights` ドキュメントが削除され、元の `BulletItem.isPinned` が `false` になる
- 同じアイテムを二重ピンしようとしても重複しない

**異常系:**
- 他のユーザーのアイテムをピンしようとするとエラー

#### `tests/unit/components/BulletListInput.test.tsx`

**正常系:**
- Enterキーで次のアイテム入力欄が追加される
- 空のアイテムでBackspaceを押すと前の行に戻り削除される
- 📌ボタンをクリックするとisPinnedがトグルされる
- max上限（例: 10項目）に達したらEnterで追加できなくなる

**異常系:**
- 最大文字数（100文字）を超えた入力を拒否する

#### `tests/unit/components/JournalCard.test.tsx`

**正常系:**
- `status: 'pre'` のカードに「振り返りを書く」ボタンが表示される
- `status: 'completed'` のカードに勝敗バッジが表示される
- `status: 'post_only'` のカードに「試合前ノートなし」バッジが表示される

#### `tests/unit/components/ThreadComments.test.tsx`

**正常系:**
- 親コメントに「返信する」ボタンが表示される
- 返信入力欄に「@表示名 への返信」プレースホルダーが表示される
- 「返信を見る（n件）」クリックで返信リストが展開される

**異常系:**
- 200文字を超えるコメント送信でバリデーションエラー

### 7.2 E2Eテスト（Playwright）

#### `tests/e2e/matchJournal.spec.ts`

**シナリオ1: 試合前ノート → 試合後ノートの完全フロー**
1. `/journals/new` にアクセス（または「試合記録」FABタップ → 「試合前ノートを書く」）
2. 試合日・スポーツ・対戦相手を入力
3. 目標を3件箇条書き入力（Enterキーで追加）
4. 「公開して保存」ボタンをクリック
5. ジャーナル詳細画面にリダイレクト、「振り返り待ち」バッジが表示されることを確認
6. 「試合後の振り返りを書く」ボタンをクリック
7. 試合結果・できたこと・できなかったことを入力
8. 保存後、「振り返り完了」バッジが表示されることを確認

**シナリオ2: ハイライトピン操作**
1. ジャーナル詳細画面で箇条書きアイテムの📌ボタンをクリック
2. ボタンがハイライト表示になることを確認
3. `/review/highlights` にアクセスしてピンがリストに表示されることを確認
4. 📌ボタンを再クリックしてピン解除、リストから消えることを確認

**シナリオ3: スレッドコメント**
1. ジャーナル詳細画面でコメントを投稿
2. 「返信する」ボタンをクリック
3. 返信を入力して送信
4. 「返信を見る（1件）」が表示されることを確認
5. クリックして返信が展開されることを確認

**シナリオ4: 振り返りビュー**
1. `/review` にアクセス
2. 当月の試合ジャーナルが表示されることを確認
3. 月切り替えナビで前月に遷移できることを確認

### 7.3 エッジケース

- 試合前ノートを作成後、試合がキャンセルになった場合（試合後ノートなしのまま）
- 複数の目標のうち一部のみ達成した場合の `GoalAchievement: 'partial'` の表示
- ピン済みアイテムのテキストを後から編集した場合（`highlights` コレクションのテキストは編集時点のスナップショットのため変わらない）
- コメント削除時に返信が存在する場合（親コメントのテキストを「削除されたコメント」に置き換えて返信は保持する）
- グループメンバーが10名上限でコメント投稿しようとした場合（ルール上許可、人数制限はグループ参加のみ）
- オフライン時のジャーナル保存（Firestoreオフラインキャッシュを使用。再接続時に同期）

---

## 8. 変更対象ファイル

### 8.1 新規作成するファイル

| ファイルパス | 説明 |
|------------|------|
| `src/types/matchJournal.ts` | 試合ジャーナル関連の全TypeScript型定義 |
| `src/types/highlight.ts` | ハイライトピンのTypeScript型定義 |
| `src/lib/firebase/matchJournalService.ts` | 試合ジャーナルのFirestoreサービス |
| `src/lib/firebase/highlightService.ts` | ハイライトピンのFirestoreサービス |
| `src/lib/firebase/commentService.ts` | スレッドコメントサービス（共通化） |
| `src/lib/validations/matchJournalSchema.ts` | 試合ジャーナルのZodバリデーション |
| `src/hooks/useMatchJournals.ts` | 試合ジャーナルのTanStack Queryフック |
| `src/hooks/useHighlights.ts` | ハイライトピンのTanStack Queryフック |
| `src/hooks/useThreadComments.ts` | スレッドコメントのTanStack Queryフック |
| `src/components/journals/JournalCard.tsx` | 試合ジャーナルカードコンポーネント |
| `src/components/journals/JournalDetail.tsx` | 試合ジャーナル詳細コンポーネント |
| `src/components/journals/PreMatchForm.tsx` | 試合前ノートフォーム |
| `src/components/journals/PostMatchForm.tsx` | 試合後ノートフォーム |
| `src/components/journals/BulletListInput.tsx` | 箇条書き入力コンポーネント（汎用） |
| `src/components/journals/GoalReviewItem.tsx` | 目標振り返りアイテムコンポーネント |
| `src/components/highlights/HighlightCard.tsx` | ハイライトピンカードコンポーネント |
| `src/components/highlights/HighlightCollection.tsx` | ハイライトピン集約表示コンポーネント |
| `src/components/comments/ThreadComments.tsx` | スレッドコメントコンポーネント |
| `src/components/comments/CommentItem.tsx` | 1件のコメント表示コンポーネント |
| `src/routes/app/journals/JournalsListPage.tsx` | 試合ジャーナル一覧ページ |
| `src/routes/app/journals/JournalNewPage.tsx` | 試合ジャーナル新規作成ページ |
| `src/routes/app/journals/JournalDetailPage.tsx` | 試合ジャーナル詳細ページ |
| `src/routes/app/journals/JournalEditPage.tsx` | 試合ジャーナル編集ページ |
| `src/routes/app/ReviewPage.tsx` | 振り返りページ（月別タイムライン） |
| `src/routes/app/HighlightsPage.tsx` | ハイライトピン一覧ページ |
| `tests/unit/lib/matchJournalService.test.ts` | 試合ジャーナルサービスのユニットテスト |
| `tests/unit/lib/highlightService.test.ts` | ハイライトサービスのユニットテスト |
| `tests/unit/components/BulletListInput.test.tsx` | 箇条書き入力コンポーネントのテスト |
| `tests/unit/components/JournalCard.test.tsx` | 試合ジャーナルカードのテスト |
| `tests/unit/components/ThreadComments.test.tsx` | スレッドコメントのテスト |
| `tests/e2e/matchJournal.spec.ts` | 試合ジャーナルのE2Eテスト |

### 8.2 修正するファイル

| ファイルパス | 変更内容 |
|------------|---------|
| `src/types/note.ts` | `PracticeNote` 型追加、`BulletItem` インポート、既存 `Note` 型は保持 |
| `src/types/reaction.ts` | `targetType` に `'journal'` を追加 |
| `src/routes/app/notes/NotesListPage.tsx` | 縮小された練習メモUIに変更 |
| `src/components/notes/NoteForm.tsx` | 箇条書きフォームに変更（既存フィールド削減） |
| `src/components/notes/NoteCard.tsx` | 練習メモカード表示に変更 |
| `src/components/timeline/CommentSection.tsx` | スレッドコメント対応に拡張 |
| `src/components/profile/MyProfilePage.tsx` | ハイライトピンコレクションセクション追加 |
| `src/components/shared/AppLayout.tsx` | ボトムナビに「振り返り」タブ追加（既存タブ再整理） |
| `firestore.indexes.json` | 新規インデックス追加 |
| `src/i18n/locales/ja.json` | 新機能の翻訳テキスト追加 |

---

## 9. 実装優先順位

### MVP（フェーズ1）として実装するもの

以下の順序で実装する:

**ステップ1: 型定義・基盤**
1. `src/types/matchJournal.ts` の作成
2. `src/types/highlight.ts` の作成
3. `src/lib/validations/matchJournalSchema.ts` の作成
4. `firestore.indexes.json` へのインデックス追加

**ステップ2: Firestoreサービス**
5. `src/lib/firebase/matchJournalService.ts` の実装
6. `src/lib/firebase/highlightService.ts` の実装
7. `src/lib/firebase/commentService.ts` の実装（スレッド対応）

**ステップ3: TanStack Queryフック**
8. `src/hooks/useMatchJournals.ts`
9. `src/hooks/useHighlights.ts`
10. `src/hooks/useThreadComments.ts`

**ステップ4: UIコンポーネント**
11. `BulletListInput.tsx`（最重要の汎用コンポーネント）
12. `PreMatchForm.tsx`
13. `PostMatchForm.tsx` / `GoalReviewItem.tsx`
14. `JournalCard.tsx`
15. `JournalDetail.tsx`
16. `ThreadComments.tsx` / `CommentItem.tsx`
17. `HighlightCard.tsx` / `HighlightCollection.tsx`

**ステップ5: ページ（ルート）**
18. `JournalsListPage.tsx`
19. `JournalNewPage.tsx`
20. `JournalDetailPage.tsx`
21. `JournalEditPage.tsx`
22. `ReviewPage.tsx`
23. `HighlightsPage.tsx`

**ステップ6: 既存コンポーネントの修正**
24. `NoteForm.tsx`（縮小）
25. `CommentSection.tsx`（スレッド化）
26. `MyProfilePage.tsx`（ハイライト追加）
27. `AppLayout.tsx`（ナビ更新）

**ステップ7: ルーター設定**
28. `src/routes/index.tsx` へのルート追加

**ステップ8: テスト・セキュリティ**
29. ユニットテスト実装
30. E2Eテスト実装
31. Firestoreセキュリティルール更新

### Phase 2以降に延期するもの

- 振り返りページの達成率グラフ（Recharts）
- ハイライトピンのグループメンバー間の共有
- 練習メモへの画像添付
- 試合ジャーナルのAI分析コメント（Vertex AI）
- 月次レポートPDF生成
- プッシュ通知（新しいコメント・スタンプ受信時）

---

## 10. 完了の定義

### 10.1 ビルド確認

```bash
npm run build
# TypeScriptエラー・Lintエラーがゼロであること
```

### 10.2 テスト確認

```bash
npm run test
# 全ユニットテストがPASS
# カバレッジ: matchJournalService・highlightService・BulletListInput は80%以上

npm run test:e2e
# 試合ジャーナルの全E2Eシナリオがヘッドレスブラウザでパス
```

### 10.3 ユーザー操作による確認

以下の操作がすべて正常に完了できること:

1. 試合前ノートを箇条書きで3件の目標を入力して保存できる
2. 保存後ジャーナル詳細画面に「振り返り待ち」バッジが表示される
3. 「試合後の振り返りを書く」から試合後ノートを入力できる
   - 試合前の目標リストが引き継がれ、各目標に達成チェックができる
   - できたこと/できなかったこと/探求したいことを箇条書きで入力できる
4. 完了後「振り返り完了」バッジが表示される
5. 箇条書きアイテムの📌ボタンでピンができ、ハイライト一覧に表示される
6. ピン解除でハイライト一覧から消える
7. プロフィールページに「気づきのかけら」コレクションが表示される
8. コメントに返信ができ、スレッド形式で表示される
9. 練習メモを箇条書き（最大5項目）で作成できる
10. 振り返りページで月別のジャーナルタイムラインが表示される
11. モバイル（375px幅）で全画面のレイアウトが崩れない

### 10.4 セキュリティ確認

- 他グループのジャーナルにアクセスできないこと（Firestoreルール）
- 他ユーザーのハイライトが閲覧できないこと
- 自分以外のコメントを削除できないこと
- Zodバリデーションで不正入力（XSS含む）が拒否されること

---

*本仕様書はDesignerエージェントおよびGeneratorエージェントへの実装指示として使用されます。*
