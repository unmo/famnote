# 試合ノート（matchJournals）UX全面改善仕様書 v2

作成日: 2026-04-24
対象フェーズ: Designer / Generator

---

## 1. 機能概要

### 目的・背景
試合ノート詳細画面（JournalDetailPage）のUXを全面改善する。現状は試合前・試合後のコンテンツが複数のバラバラなカードとして縦に並んでおり、「どこを編集すればよいか」「何が記録済みか」が一目でわからない。また気づきのかけら（HighlightsPage）に試合ノートのあらゆるフィールドが混入しており、ユーザーの混乱を招いている。

### 対象ユーザー
- 子供（選手）: 自分の試合ノートを記録・閲覧する主体
- 親（管理者）: 子供の試合ノートにコメントを付ける

### 既存機能との関係
- `JournalDetailPage.tsx` の表示ロジックを全面的にリデザイン
- `JournalCommentSection` は現状のまま流用するが、配置位置を変更
- `highlightService.ts` の `replaceInsightHighlights` 呼び出しを `journal_insight` のみに統一
- `createPostMatchOnly` 内の誤ったsourceType（`journal_post_improvement`）を修正

---

## 2. 問題の特定と修正方針

### 問題1: JournalDetailPage でエラーが発生する可能性

**調査結果:**
- `JournalCommentSection` → `useJournalComments` → `subscribeJournalComments` の `onSnapshot` エラーハンドラーは `callback([])` で安全に処理済み
- `JournalDetailPage` での `useEffect` の依存配列に `journal` オブジェクト全体は含めず `journal?.unreadCommentCount` と `journal?.userId` のみ参照しており、無限ループリスクは低い
- ただし `useJournal` フックはページ訪問時に一度だけ `getDoc` するため、Firestoreセキュリティルールで `matchJournals/{id}` の read が正しく許可されていることが前提
- **潜在的エラー原因**: `JournalCommentSection` が `isManager` を `useActiveProfile` から取得しているが、`activeProfile` が未ロードの状態でコンポーネントがレンダリングされると `isManager === false` になり、管理者フォームが表示されない。エラーは出ないが期待動作と異なる可能性がある

**修正方針:**
- `useActiveProfile` の isLoading 状態を `JournalDetailPage` で考慮し、プロファイルロード完了後に `JournalCommentSection` を描画する
- `createPostMatchOnly` 内の `replaceInsightHighlights` 呼び出しで誤って `journal_post_improvement` を渡している箇所を `journal_insight` に修正する

### 問題2: 試合前・試合後セクションのUX

**現状の問題:**
- 試合前の目標とチャレンジが別カードではなく同カードだが、試合後の各フィールド（目標達成状況・気づき・できたこと・課題・探求・自己評価）が6枚の独立したカードに分割されている
- 編集ボタンが「試合前カード」と「目標達成状況カード」の2か所にしかなく、他のセクションは編集不可のように見える
- ユーザーは「どこをタップすれば試合後ノートを全部編集できるか」がわからない

**修正方針:**
- 試合前ブロックと試合後ブロックをそれぞれ1つのアコーディオンセクションにまとめる
- 各ブロックのヘッダーに編集ボタンを1つだけ配置する
- デフォルト展開状態は「試合前: 折りたたみ可能（デフォルト展開）」「試合後: 折りたたみ可能（デフォルト展開）」

### 問題3: 気づきのかけらに不要なデータが混入

**調査結果:**
- `highlightService.ts` の `replaceInsightHighlights` は `sourceType` を引数で受け取る汎用関数
- `matchJournalService.ts` の `addPostMatchNote` と `updatePostMatchNote` は正しく `journal_insight` で呼び出している
- **バグ箇所**: `createPostMatchOnly` 関数（153行目〜213行目）で `replaceInsightHighlights` を呼び出す際、第4引数に `journal_post_improvement` を誤って渡している。正しくは `journal_insight` であるべき
- `HighlightSourceType` には `journal_pre_goal`、`journal_pre_challenge`、`journal_post_achievement` 等が定義されているが、現在の `matchJournalService.ts` から `pinHighlight` は呼ばれていない。これらのsourceTypeはハイライトカードのラベル表示のために定義されているが、現状では実際に登録されるのは `journal_insight` のみ（createPostMatchOnly のバグを除く）
- 「試合前/目標」「試合後/できたこと」等のバッジが表示されているのは過去データの名残か、createPostMatchOnly バグによる可能性がある

**修正方針:**
- `createPostMatchOnly` の `replaceInsightHighlights` 第4引数を `journal_post_improvement` から `journal_insight` に修正
- `HighlightSourceType` から `journal_pre_goal`、`journal_pre_challenge`、`journal_post_achievement`、`journal_post_improvement`、`journal_post_exploration` を削除（これらは今後ハイライト登録しない設計に統一）
- 既存の誤登録データへの対応: データマイグレーションではなく、HighlightCard の `SOURCE_TYPE_LABELS` の表示ラベルを改善して既存データも適切に表示できるようにする

---

## 3. 機能要件

### 3-1. JournalDetailPage リデザイン

#### 画面構成（上から順）

1. **スティッキーヘッダー**
   - 戻るボタン（左）
   - ステータスバッジ（中央）
   - 削除ボタン（右、オーナーのみ）

2. **試合情報ヘッダーカード**
   - 日付・スポーツ・会場
   - vs 対戦相手名（大きく中央表示）
   - ゴール数（postNote.myScore）

3. **ステップ進捗インジケーター**（常時表示、オーナーのみ）
   - ステップ1「試合前の目標」: 試合前記録済みなら完了スタイル
   - ステップ2「試合後の振り返り」: postNote ありなら完了スタイル、なければ強調スタイル
   - status === 'pre' かつオーナーの場合: ステップ2に「振り返りを記録する」CTAボタンを表示

4. **試合前ブロック（アコーディオン）**
   - preNote が null の場合は非表示
   - ヘッダー: 「🎯 試合前の目標」ラベル + 展開/折りたたみトグル + 編集ボタン（オーナーのみ、`/journals/:id/edit/pre` へ遷移）
   - コンテンツ展開時:
     - 目標リスト（goals）
     - チャレンジしたいこと（challenges）（あれば区切り線の下に表示）
   - デフォルト: 展開

5. **試合後ブロック（アコーディオン）**
   - postNote が null の場合は非表示
   - ヘッダー: 「📊 試合後の振り返り」ラベル + 展開/折りたたみトグル + 編集ボタン（オーナーのみ、`/journals/:id/edit/post` へ遷移）
   - コンテンツ展開時（サブセクション形式）:
     - 目標達成状況（goalReviews、preNote.goals がある場合のみ）
     - 気づき（insights、あれば）
     - できたこと（achievements、あれば）
     - 課題（improvements、あれば）
     - 探求したいこと（explorations、あれば）
     - 自己評価（performance、あれば）
   - デフォルト: 展開

6. **コメントセクション**
   - `JournalCommentSection` をそのまま使用
   - プロファイルロード完了後に描画（isManager が確定してから）

#### ユーザーインタラクション
- 試合前/後ブロックのヘッダーをタップ → 展開/折りたたみ切り替え（Framer Motion でスムーズに）
- 編集ボタンタップ → 対応する編集ページへ遷移
- CTAボタンタップ（status === 'pre'） → `/journals/:id/post` へ遷移
- 削除ボタン → 確認ダイアログ表示

### 3-2. 気づきのかけら（HighlightsPage）修正

#### sourceTypeラベルの改善
現状の `SOURCE_TYPE_LABELS` を以下のように整理する:

| sourceType | 現状ラベル | 改善後ラベル |
|-----------|-----------|-------------|
| `journal_insight` | 試合 / 気づき | 試合の気づき |
| `note_insight` | 練習 / 気づき | 練習の気づき |
| `practice_bullet` | 練習メモ | 練習メモ |
| `journal_pre_goal` | 試合前 / 目標 | 試合メモ（過去データ） |
| `journal_pre_challenge` | 試合前 / チャレンジ | 試合メモ（過去データ） |
| `journal_post_achievement` | 試合後 / できたこと | 試合メモ（過去データ） |
| `journal_post_improvement` | 試合後 / 課題 | 試合メモ（過去データ） |
| `journal_post_exploration` | 試合後 / 探求 | 試合メモ（過去データ） |

「過去データ」ラベルのものは badge スタイルを `bg-zinc-700/50 text-zinc-500`（薄いグレー）にして視覚的に区別する。

#### フィルターUIの整理
- 現状のフィルターに `journal_insight`（試合の気づき）と `note_insight`（練習の気づき）の2軸を残す
- `journal_pre_goal` 等のsourceTypeはフィルター選択肢から削除する（既存データは表示するが、フィルタリング対象外）

#### ハイライト登録タイミングの見直し
- 試合ノート保存時に `replaceInsightHighlights` を呼ぶのは **`insights`（気づきフィールド）のみ** とする
- 目標・チャレンジ・できたこと・課題・探求はハイライト登録しない
- `createPostMatchOnly` のバグを修正し、`journal_insight` sourceType で登録するよう統一

---

## 4. UI/UX要件（Designerへの引き継ぎ事項）

### 画面の目的とユーザー感情体験
- 詳細ページは「記録を振り返り、成長を実感する場所」
- 試合前と試合後が1つのストーリーとして完結していることを視覚的に表現する
- アコーディオンにより「今どの段階か」がわかりやすく、未完了ステップへの誘導を自然に行う

### 重要なインタラクションポイント
- アコーディオン展開/折りたたみは `AnimatePresence` + `motion.div` で高さアニメーション（`overflow: hidden`、`height: auto → 0`）
- 編集ボタンはブロックヘッダーの右端に小さく配置（`Pencil` アイコン + 「編集」テキスト）
- CTAボタン（振り返りを記録する）はブランドカラーで目立たせる
- ステップ進捗インジケーターは試合前完了時にステップ1をチェックマーク付きで表示

### モバイル対応要件
- 全ての操作エリアは `min-h-[44px]` / `min-w-[44px]` を確保
- アコーディオンコンテンツはパディング `px-4 py-3` を維持
- 試合後ブロック内のサブセクションは区切り線（`border-t border-zinc-800/60`）で分離

### エラー状態・空状態・ローディング状態
- ローディング: スピナー（既存のまま）
- journal が null: エラーメッセージ + 戻るボタン（既存のまま）
- preNote が null: 試合前ブロック自体を非表示（CTAのみ表示）
- postNote が null: 試合後ブロック非表示 + ステップ2のCTA表示
- コメントセクション: スケルトン2件（既存のまま）

### デザイントークン
- ブロックヘッダー背景: `bg-zinc-900`
- ブロックボーダー: `border border-zinc-800 rounded-2xl`
- アコーディオントグルボタン: `text-zinc-500 hover:text-zinc-300`
- 完了済みステップ: チェックマーク `text-green-400`、テキスト `line-through text-zinc-600`
- アクティブステップ: `text-[var(--color-brand-primary)]`、パルスアニメーション

---

## 5. データモデル

既存データモデルの変更なし。

修正対象: `HighlightSourceType`（`src/types/highlight.ts`）

```typescript
// 修正前
export type HighlightSourceType =
  | 'journal_pre_goal'
  | 'journal_pre_challenge'
  | 'journal_post_achievement'
  | 'journal_post_improvement'
  | 'journal_post_exploration'
  | 'journal_insight'
  | 'note_insight'
  | 'practice_bullet';

// 修正後
// journal_* の細分類は廃止し、journal_insight に統一
// 過去データの表示互換のためラベルマッピングは残す
export type HighlightSourceType =
  | 'journal_insight'
  | 'note_insight'
  | 'practice_bullet'
  // 以下は過去データ互換のために残す（新規登録は行わない）
  | 'journal_pre_goal'
  | 'journal_pre_challenge'
  | 'journal_post_achievement'
  | 'journal_post_improvement'
  | 'journal_post_exploration';
```

---

## 6. API・サービス仕様

### matchJournalService.ts の修正

#### createPostMatchOnly のバグ修正
```typescript
// 修正前（153行目付近）
await replaceInsightHighlights(
  userId, groupId ?? '', baseData.sport,
  'journal_post_improvement',  // バグ: 誤ったsourceType
  ref.id, postData.insights, sourceDate
);

// 修正後
await replaceInsightHighlights(
  userId, groupId ?? '', baseData.sport,
  'journal_insight',  // 正しいsourceType
  ref.id, postData.insights, sourceDate
);
```

### 新規コンポーネント: JournalAccordionBlock

```typescript
interface JournalAccordionBlockProps {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  onEdit?: () => void;
  children: React.ReactNode;
}
```

---

## 7. セキュリティ要件

- 既存の認証・認可ロジックに変更なし
- Firestoreセキュリティルールの変更なし
- 編集ボタンはクライアント側で `isOwner` チェック済み（サーバー側は matchJournalService で userId 検証）

---

## 8. テスト観点

### ユニットテスト

**matchJournalService.ts**
- `createPostMatchOnly` 実行後に `replaceInsightHighlights` が `journal_insight` sourceType で呼ばれること（モック確認）
- `addPostMatchNote` / `updatePostMatchNote` は既存通り `journal_insight` で呼ばれること

**HighlightCard.tsx**
- `journal_insight` の場合「試合の気づき」バッジが表示されること
- `journal_pre_goal` 等の過去データsourceTypeの場合「試合メモ（過去データ）」が薄いグレーで表示されること

**JournalAccordionBlock（新規）**
- デフォルト展開状態で children が表示されること
- ヘッダークリックで折りたたまれること
- onEdit が渡された場合に編集ボタンが表示されること
- onEdit が渡されない場合に編集ボタンが非表示であること

### E2Eテスト（Playwright）

1. **試合ノート詳細画面 - 試合前のみ（status: 'pre'）**
   - 試合前ブロックが展開状態で表示される
   - 試合後ブロックが非表示
   - ステップ2のCTAボタンが表示される
   - CTAボタンクリックで `/journals/:id/post` に遷移する
   - 試合前ブロックのヘッダークリックで折りたたまれる
   - 編集ボタンクリックで `/journals/:id/edit/pre` に遷移する

2. **試合ノート詳細画面 - 試合前・試合後あり（status: 'completed'）**
   - 試合前・試合後ブロックが両方展開状態で表示される
   - CTAボタンが非表示
   - 試合後ブロックの編集ボタンで `/journals/:id/edit/post` に遷移する
   - 試合後ブロックのヘッダークリックで折りたたまれる

3. **気づきのかけら画面**
   - 試合ノート保存後、`journal_insight` sourceType のハイライトのみ表示される
   - 「試合前/目標」ラベルが「試合の気づき」に変わっていること（新規データ）

### エッジケース
- preNote と postNote が両方 null（post_only ではない不正データ）: ブロックが両方非表示になる
- insights が空配列: `replaceInsightHighlights` が呼ばれた場合、既存ハイライトが削除されること
- コメントセクション: `subscribeJournalComments` が permission denied → 空配列で表示、UIがブロックされない

---

## 9. 変更対象ファイル

### 新規作成
| ファイルパス | 内容 |
|------------|------|
| `src/components/journals/JournalAccordionBlock.tsx` | 試合前/試合後共用アコーディオンブロックコンポーネント |
| `src/components/journals/JournalStepProgress.tsx` | ステップ進捗インジケーター（試合前完了 → 試合後記録待ち） |
| `tests/unit/journals/JournalAccordionBlock.test.tsx` | JournalAccordionBlock ユニットテスト |

### 修正
| ファイルパス | 変更内容 |
|------------|---------|
| `src/routes/app/journals/JournalDetailPage.tsx` | アコーディオンブロック構成へのリデザイン、isManager のロード待ち追加 |
| `src/lib/firebase/matchJournalService.ts` | `createPostMatchOnly` の sourceType バグ修正（`journal_post_improvement` → `journal_insight`） |
| `src/types/highlight.ts` | `HighlightSourceType` のコメント追加（廃止予定のsourceTypeを明示） |
| `src/components/highlights/HighlightCard.tsx` | SOURCE_TYPE_LABELS のラベル改善、過去データsourceTypeのバッジスタイル変更 |

---

## 10. 完了の定義

- `npm run build` が通ること
- 全ユニットテストがパスすること（`npm run test`）
- E2Eテスト（Playwright）がパスすること
- 以下の操作で期待通り動作すること:
  1. 試合前のみ記録済みジャーナル詳細を開く → 試合前ブロックが展開表示、振り返りCTAが表示される
  2. 試合前ブロックのヘッダーをタップ → スムーズに折りたたまれる
  3. 試合前ブロックの編集ボタンをタップ → 試合前編集ページへ遷移する
  4. 試合後記録済みジャーナルを開く → 試合前・試合後ブロックが両方展開、CTAなし
  5. 試合後ブロックの編集ボタンをタップ → 試合後編集ページへ遷移する
  6. `createPostMatchOnly` で新規作成した試合後ノートの気づきが、HighlightsPage で「試合の気づき」バッジで表示される
  7. コメントセクションがプロファイルロード後に正しく表示される
