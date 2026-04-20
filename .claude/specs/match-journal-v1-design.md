# FamNote 試合ジャーナル × 親子コミュニケーション UI/UXデザイン仕様書 v1

**バージョン:** 1.0.0
**作成日:** 2026-04-18
**作成者:** Designerエージェント
**対象仕様書:** `.claude/specs/match-journal-v1.md`
**ステータス:** Generator引き継ぎ待ち

---

## 目次

1. [デザインシステム・トークン](#1-デザインシステムトークン)
2. [画面レイアウト仕様](#2-画面レイアウト仕様)
3. [コンポーネント設計](#3-コンポーネント設計)
4. [インタラクション仕様](#4-インタラクション仕様)
5. [空状態・ローディング・エラー状態](#5-空状態ローディングエラー状態)
6. [ナビゲーション変更仕様](#6-ナビゲーション変更仕様)
7. [アクセシビリティ](#7-アクセシビリティ)
8. [モバイル対応仕様](#8-モバイル対応仕様)

---

## 1. デザインシステム・トークン

### 1.1 カラーパレット

プロジェクトのCSS変数とTailwindクラスの対応:

```css
/* CSS変数（既存・変更不要） */
--color-brand-primary: #E85513;   /* オレンジ: CTAボタン・アクセント */
--color-brand-secondary: #00133F; /* ネイビー: 見出し・強調 */

/* Tailwindクラス対応 */
背景（ダーク）: bg-zinc-950   (#09090b)
カード背景:     bg-zinc-900   (#18181b)
カード背景薄:   bg-zinc-800/50
ボーダー:       border-zinc-800 (#27272a)
テキスト主:     text-zinc-50  (#fafafa)
テキスト副:     text-zinc-400 (#a1a1aa)
テキスト第三:   text-zinc-500 (#71717a)

/* ステータスカラー */
勝利バッジ:     bg-green-500/20 text-green-400 border-green-500/30
引き分けバッジ: bg-zinc-700/50 text-zinc-300 border-zinc-600/30
敗北バッジ:     bg-red-500/20 text-red-400 border-red-500/30
振り返り待ち:   bg-amber-500/20 text-amber-400 border-amber-500/30
振り返り完了:   bg-green-500/20 text-green-400 border-green-500/30
試合後のみ:     bg-zinc-700/50 text-zinc-400 border-zinc-600/30

/* ブランドカラーユーティリティ（CSS変数使用） */
CTAボタン: bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90
アクセント枠（親コメント）: border-l-4 border-[var(--color-brand-primary)]
ピン済みハイライト: bg-amber-500/10 border-amber-500/30
```

### 1.2 タイポグラフィ

```
フォントロード（index.html）:
  Inter: weights 400, 500, 600, 700
  Noto Sans JP: weights 400, 500, 700

見出しH1:   text-2xl font-bold tracking-tight (モバイル: text-xl)
見出しH2:   text-xl font-semibold
見出しH3:   text-lg font-semibold
本文:       text-base font-normal leading-relaxed
補足文:     text-sm text-zinc-400
極小文:     text-xs text-zinc-500

箇条書き入力テキスト: text-base (16px必須・モバイルズーム防止)
```

### 1.3 共通クラスパターン

```
カード:       bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg shadow-black/20
ボタン主要:   bg-[var(--color-brand-primary)] text-white rounded-lg px-4 py-2.5 text-sm font-medium
ボタン副次:   bg-zinc-800 text-zinc-100 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-700
ボタン危険:   bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg px-4 py-2.5
入力フィールド: bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-50 text-base
              focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] outline-none
セパレーター: border-t border-zinc-800
バッジ:       inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border
```

### 1.4 アニメーション仕様（Framer Motion）

```typescript
// ページ遷移
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

// カード出現（stagger）
const containerVariants = {
  animate: { transition: { staggerChildren: 0.05 } }
};
const cardVariants = {
  initial: { opacity: 0, scale: 0.97, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { duration: 0.2, ease: 'easeOut' }
};

// ボタン操作感
const tapVariants = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 }
};

// ピンボタン（アニメーション重要）
const pinVariants = {
  initial: { scale: 1 },
  pinned: { scale: [1, 1.4, 1], transition: { duration: 0.3, ease: 'easeInOut' } }
};

// スレッドコメント展開
const replyExpandVariants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2 } }
};

// モーダルオーバーレイ
const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 }
};

// ボトムシート
const sheetVariants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } },
  exit: { y: '100%', transition: { duration: 0.25 } }
};
```

---

## 2. 画面レイアウト仕様

### 2.1 試合ジャーナル一覧 (`/journals`)

#### 目的・感情体験
「自分の試合の歴史が見える」達成感と、次の試合への期待感。

#### レイアウト構成

```
[モバイル 375px〜]
┌─────────────────────────────┐
│ AppHeader                   │
│  "ジャーナル"  [+ 新規]      │
├─────────────────────────────┤
│ 月次サマリーカード（横スクロール）│
│  [今月 x試合] [勝率 x%] ...  │
├─────────────────────────────┤
│ タイムラインリスト              │
│  MatchJournalCard × n       │
│  （下端で次ページロード）        │
└─────────────────────────────┘

[タブレット 768px〜]
2カラムグリッド: grid-cols-2 gap-4

[デスクトップ 1280px〜]
max-w-3xl mx-auto（1カラム維持）
```

#### スペーシング・クラス詳細

```
ページコンテナ: min-h-screen bg-zinc-950 pb-24
ヘッダー部分:   px-4 pt-4 pb-3
月次サマリー行: px-4 mb-4 flex gap-3 overflow-x-auto scrollbar-none
カードリスト:   px-4 space-y-3
```

#### ヘッダー構成

```
┌─────────────────────────────────┐
│ ← (戻る省略)   ジャーナル   [+] │
└─────────────────────────────────┘
Tailwind: flex items-center justify-between px-4 py-3 sticky top-0 
          bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50
[+]ボタン: min-w-[44px] min-h-[44px] bg-[var(--color-brand-primary)] 
           rounded-full flex items-center justify-center
```

#### 月次サマリーカード（小型）

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  試合数       │  │  勝率        │  │ 達成率        │
│   6試合       │  │  66%        │  │  72%         │
└──────────────┘  └──────────────┘  └──────────────┘
各カード: bg-zinc-900 rounded-xl px-4 py-3 min-w-[100px] 
         border border-zinc-800 flex-shrink-0
数値: text-2xl font-bold text-zinc-50
ラベル: text-xs text-zinc-500 mt-0.5
```

---

### 2.2 試合前ノート作成 (`/journals/new/pre`)

#### 目的・感情体験
「よし、今日の試合で何をやるか決めた！」という前向きな緊張感。

#### レイアウト構成

```
[モバイル]
┌─────────────────────────────┐
│ AppHeader: ← 試合前ノート    │
├─────────────────────────────┤
│ スクロール可能なフォーム本体   │
│                             │
│  [試合日] [スポーツ]          │
│  [対戦相手]                  │
│  [会場（任意）]               │
│  ─────────────────          │
│  今日の目標（箇条書き）        │
│  BulletListInput            │
│  ─────────────────          │
│  チャレンジしたいこと（任意）   │
│  BulletListInput            │
│  ─────────────────          │
│  [公開設定トグル]             │
│                             │
├─────────────────────────────┤
│ 固定フッター                  │
│  [下書き保存]  [公開して保存]  │
└─────────────────────────────┘
```

#### スペーシング詳細

```
ページコンテナ: min-h-screen bg-zinc-950 pb-32
フォーム本体:   px-4 py-4 space-y-6
フォームセクション: space-y-2
セクションラベル: text-sm font-medium text-zinc-300
入力行グリッド: grid grid-cols-2 gap-3 (試合日・スポーツ)
固定フッター:   fixed bottom-0 left-0 right-0 
               bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 
               px-4 py-3 flex gap-3
               safe-area-inset-bottom (iOS対応)
```

#### 入力フィールド詳細

```
試合日: 
  <input type="date"> 
  bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 
  text-zinc-50 text-base w-full

スポーツ種目:
  <select>
  同上スタイル + appearance-none + ChevronDown icon

対戦相手:
  <input type="text" placeholder="例: ○○FC">
  w-full + 文字数カウンター (右下: "0/50" text-xs text-zinc-500)

会場（任意）:
  同上 + placeholder="省略可"
```

---

### 2.3 試合後ノート追加 (`/journals/:id/post`)

#### 目的・感情体験
「今日学んだことを整理できた」という達成感と内省。

#### レイアウト構成

```
[モバイル]
┌─────────────────────────────┐
│ AppHeader: ← 試合後の振り返り │
├─────────────────────────────┤
│ 試合情報サマリー（折りたたみ）  │
│  📅 日付 vs 相手チーム名      │
├─────────────────────────────┤
│ スクロール可能フォーム          │
│                             │
│  試合結果セクション             │
│  [勝] [分] [負] 3択ボタン     │
│  [自チームスコア] - [相手]      │
│                             │
│  ─────────────────          │
│  目標の振り返り               │
│  (試合前目標リストから引き継ぎ)  │
│  GoalReviewItem × n         │
│                             │
│  ─────────────────          │
│  できたこと                   │
│  BulletListInput            │
│                             │
│  できなかったこと/課題          │
│  BulletListInput            │
│                             │
│  もっと探求したいこと           │
│  BulletListInput            │
│                             │
│  ─────────────────          │
│  自己評価（星1〜5）            │
│  写真追加（最大5枚）            │
│  公開設定トグル                │
│                             │
├─────────────────────────────┤
│ 固定フッター                  │
│  [下書き保存]  [振り返りを保存] │
└─────────────────────────────┘
```

#### 試合結果3択ボタン

```
[  勝  ]  [  分  ]  [  負  ]
各ボタン: flex-1 py-3 rounded-lg border text-sm font-medium
         transition-all duration-150

未選択: bg-zinc-800 border-zinc-700 text-zinc-400
勝(選択): bg-green-500/20 border-green-500 text-green-400
分(選択): bg-zinc-700/50 border-zinc-500 text-zinc-300
負(選択): bg-red-500/20 border-red-500 text-red-400
```

#### スコア入力

```
┌────────────┬───┬────────────┐
│  自チーム   │ - │   相手     │
│  [  3  ]  │   │  [  2  ]  │
└────────────┴───┴────────────┘
<input type="number" min="0">
w-24 text-center text-xl font-bold
```

#### 自己評価（星）

```
★★★★★ (1〜5 インタラクティブ)
各星: text-2xl cursor-pointer
     未選択: text-zinc-600
     選択済: text-amber-400
     ホバー: text-amber-300
     whileHover: { scale: 1.2 }, whileTap: { scale: 0.9 }
```

#### 写真追加エリア

```
┌──────────────────────────────┐
│  [+写真を追加]                │
│  ┌────┐┌────┐┌────┐         │
│  │画像1││画像2││画像3│         │
│  └────┘└────┘└────┘         │
└──────────────────────────────┘
追加ボタン: border-2 border-dashed border-zinc-700 rounded-xl 
           py-4 flex items-center justify-center gap-2
           text-zinc-400 text-sm
サムネイル: w-20 h-20 rounded-lg object-cover relative
削除ボタン: absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 
           rounded-full flex items-center justify-center
```

---

### 2.4 試合ジャーナル詳細 (`/journals/:id`)

#### 目的・感情体験
「自分の成長が見える」「親に見てもらえる」という誇り。

#### レイアウト構成

```
[モバイル]
┌─────────────────────────────┐
│ AppHeader: ← [ステータスバッジ] [編集] […] │
├─────────────────────────────┤
│                             │
│  ヘッダーカード（試合基本情報）  │
│  日付 / スポーツ / 会場        │
│  vs 相手チーム                │
│  スコア表示 (大)              │
│  勝敗バッジ                  │
│                             │
│  ─────────────────          │
│  [セクション1] 試合前の目標    │
│  BulletItem × n (ピンボタン付) │
│                             │
│  ─────────────────          │
│  [セクション2] 試合後の振り返り │
│  (postNote未記入時: CTA)      │
│   目標達成状況                │
│   GoalReviewItem × n        │
│   できたこと BulletList       │
│   できなかったこと BulletList  │
│   探求したいこと BulletList    │
│   自己評価 ★                 │
│                             │
│  ─────────────────          │
│  [セクション3] 写真ギャラリー   │
│                             │
│  ─────────────────          │
│  ReactionBar                │
│                             │
│  ─────────────────          │
│  [セクション4] コメント         │
│  ThreadComments             │
│                             │
└─────────────────────────────┘
```

#### ヘッダーカード詳細

```
bg-gradient-to-br from-zinc-900 to-zinc-900/50 
border border-zinc-800 rounded-xl p-5 mx-4 mt-3

上段: flex justify-between items-start
  左: text-sm text-zinc-500 (日付 / スポーツ種目 / 会場)
  右: ステータスバッジ

中段: text-center py-4
  "vs" text-xs text-zinc-500 mb-1
  相手チーム名 text-xl font-bold text-zinc-50

下段(スコア): flex justify-center items-center gap-4
  自チームスコア: text-5xl font-black text-zinc-50
  "-": text-2xl text-zinc-600
  相手スコア: text-5xl font-black text-zinc-400
  (未入力時: "-" で両方表示)
```

#### 試合後ノート未記入時のCTA

```
bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mx-4 my-2
text-center

アイコン: text-3xl mb-2 (📝)
テキスト: "試合の振り返りを記録しましょう"
         text-sm text-zinc-400 mt-1
ボタン: bg-[var(--color-brand-primary)] text-white rounded-lg 
       px-5 py-2.5 text-sm font-medium mt-3 w-full
       "試合後の振り返りを書く"
```

#### セクション共通スタイル

```
セクションヘッダー: px-4 py-3 flex items-center gap-2
  アイコン: text-base
  タイトル: text-sm font-semibold text-zinc-300 uppercase tracking-wide

セクション本体: px-4 pb-4
```

#### 写真ギャラリー

```
写真1枚: w-full rounded-xl
写真2枚: grid-cols-2 gap-1.5
写真3枚以上: 1枚大 + 残り小 (grid形式)
最大5枚表示、5枚超は "+n" オーバーレイ
```

---

### 2.5 振り返りビュー (`/highlights`)

#### 目的・感情体験
「こんなにたくさん気づいたんだ」という自己肯定感。

#### レイアウト構成

```
[モバイル]
┌─────────────────────────────┐
│ AppHeader: 気づきのかけら      │
├─────────────────────────────┤
│ フィルターバー（横スクロール）   │
│  [全て] [サッカー] [今月] ...  │
├─────────────────────────────┤
│ ハイライトカードリスト          │
│  HighlightCard × n          │
│  (日付降順、無限スクロール)     │
└─────────────────────────────┘
```

#### フィルターバー

```
フィルターコンテナ: px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none
                   border-b border-zinc-800 sticky top-[57px] 
                   bg-zinc-950/95 backdrop-blur-md z-10

フィルターチップ:
  未選択: bg-zinc-800 text-zinc-400 rounded-full px-3 py-1.5 text-xs font-medium
          border border-zinc-700 whitespace-nowrap
  選択中: bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] 
          border-[var(--color-brand-primary)]/50
```

#### フィルター種別

- ノートタイプ: 全て / 試合前 / 試合後 / 練習
- 期間: 今月 / 3ヶ月 / 全期間
- スポーツ: ユーザーのスポーツ一覧から動的生成

---

### 2.6 練習メモ作成（簡略版）

#### レイアウト構成

```
[モバイル]
┌─────────────────────────────┐
│ AppHeader: ← 練習メモ         │
├─────────────────────────────┤
│ フォーム本体                  │
│  [日付] [スポーツ]            │
│  ─────────────────          │
│  今日のメモ（箇条書き）         │
│  BulletListInput (最大5項目) │
│  ─────────────────          │
│  [公開設定トグル]             │
├─────────────────────────────┤
│ 固定フッター                  │
│  [キャンセル]  [保存する]      │
└─────────────────────────────┘
```

---

### 2.7 プロフィール（ハイライトピンコレクションセクション追加）

#### 追加セクション位置
既存の統計セクションの下、アクティビティセクションの上に挿入。

#### セクション構成

```
┌─────────────────────────────────────────────┐
│ 気づきのかけら                    [すべて見る →] │
├─────────────────────────────────────────────┤
│ HighlightCard (mini) × 最大3件              │
│                                             │
│ (ピンなし時: 空状態メッセージ)                  │
└─────────────────────────────────────────────┘
```

---

## 3. コンポーネント設計

### 3.1 BulletListInput

#### Props定義

```typescript
interface BulletListInputProps {
  value: string[];
  onChange: (items: string[]) => void;
  pinnedIndices?: Set<number>;          // ピン済みインデックス
  onPinToggle?: (index: number) => void; // ピン操作コールバック
  maxItems: number;                      // 上限数
  maxLength?: number;                    // 1項目の文字数上限（デフォルト100）
  placeholder?: string;                  // 最初の行プレースホルダー
  addPlaceholder?: string;               // 追加行のプレースホルダー
  showPinButton?: boolean;               // ピンボタン表示（デフォルトfalse）
  disabled?: boolean;
  autoFocusIndex?: number;              // 自動フォーカスするインデックス
}
```

#### 状態パターン

```
default:    通常表示
focused:    入力フォーカス中 (border-[var(--color-brand-primary)])
pinned:     ピン済み項目 (bg-amber-500/10 border-l-2 border-amber-500)
disabled:   pointer-events-none opacity-50
at-max:     最終行でEnter押下時のシェイクアニメーション
```

#### Tailwindクラス詳細

```
コンテナ: space-y-1.5
1行コンテナ: flex items-start gap-2 group

ピンボタンエリア (左端固定):
  w-9 h-9 flex items-center justify-center flex-shrink-0
  (showPinButton=false時は非表示)

ピンボタン:
  未ピン: w-7 h-7 rounded-full flex items-center justify-center
          text-zinc-600 hover:text-amber-400 hover:bg-amber-400/10
          transition-colors duration-150 text-base
          opacity-0 group-hover:opacity-100 focus:opacity-100
  ピン済: text-amber-400 bg-amber-400/10 opacity-100

入力フィールド:
  flex-1 bg-transparent border-0 border-b border-zinc-700/50
  focus:border-[var(--color-brand-primary)] outline-none
  text-base text-zinc-50 placeholder:text-zinc-600
  py-2 px-0 leading-relaxed resize-none min-h-[40px]
  transition-colors duration-150

文字数カウンター (右下):
  text-xs text-zinc-600 self-end pb-1 flex-shrink-0
  (残り10文字以下になったら text-amber-500)

追加ボタン行:
  flex items-center gap-2 mt-1
  text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer
  transition-colors duration-150
  (最大項目数に達したら非表示)
  "+ 追加"

上限到達メッセージ:
  text-xs text-zinc-600 mt-1
  "最大{maxItems}件まで入力できます"
```

#### キーボード操作

```
Enter: 新しい行を追加してフォーカス移動（最大項目数に達したら無視）
Backspace（空行で）: 前の行に戻りその行を削除
Tab: 次フォームへ（最終行の場合）
```

#### Framer Motionアニメーション

```typescript
// 行追加アニメーション
const itemVariants = {
  initial: { opacity: 0, height: 0, y: -4 },
  animate: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.15 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.1 } }
};

// 最大数シェイク
const shakeVariants = {
  shake: {
    x: [-4, 4, -4, 4, 0],
    transition: { duration: 0.3 }
  }
};
```

---

### 3.2 MatchJournalCard

#### Props定義

```typescript
interface MatchJournalCardProps {
  journal: MatchJournal;
  onPress: (id: string) => void;
  onPostNotePress?: (id: string) => void; // 「振り返りを書く」押下
  variant?: 'timeline' | 'mini';          // timelineがデフォルト
}
```

#### 状態パターン

```
status: 'pre'       → アンバーバッジ、「振り返りを書く」ボタン表示
status: 'completed' → 勝敗バッジ、スコア、達成率表示
status: 'post_only' → スレートバッジ、スコアのみ
```

#### 全体構造（timelineバリアント）

```
┌──────────────────────────────────────────┐
│  📅 4/18（金） サッカー      [振り返り待ち] │
│  ─────────────────────────────────────  │
│  vs ○○FC            [会場名]            │
│                                          │
│  【completed時】                          │
│  [自] 3 - 2 [相手]    ★★★★☆           │
│  目標 3/3 達成 ████████░░ 80%           │
│                                          │
│  【pre時】                               │
│  目標が3件設定されています                  │
│  [試合後の振り返りを書く →]               │
│                                          │
│  👏2  🔥1  ⭐3  💬2コメント             │
└──────────────────────────────────────────┘
```

#### Tailwindクラス詳細

```
カード外枠:
  bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden
  active:bg-zinc-800/80 transition-colors duration-100
  cursor-pointer

カード上部バー（ステータスで色変化）:
  h-1 w-full
  pre:      bg-amber-500
  completed: bg-green-500
  post_only: bg-zinc-600

カード本体: p-4

上段（日付・ステータス行）:
  flex items-center justify-between mb-2
  日付: text-xs text-zinc-500 flex items-center gap-1
  ステータスバッジ: 前述のバッジスタイル

中段（対戦情報）:
  text-lg font-semibold text-zinc-50 mb-1
  "vs {opponent}"
  会場: text-xs text-zinc-500 mt-0.5

スコア行（completed時）:
  flex items-center gap-3 mt-3
  スコア: text-3xl font-black text-zinc-50
  セパレーター: text-lg text-zinc-600
  相手スコア: text-3xl font-black text-zinc-400
  星: text-sm text-amber-400 ml-auto

達成率プログレス（completed時）:
  mt-3
  flex items-center justify-between text-xs mb-1
    "目標達成" text-zinc-500
    "3/3件" text-zinc-300
  プログレスバー: h-1.5 rounded-full bg-zinc-700
    内部: h-full rounded-full bg-green-500 (width: {percent}%)

「振り返りを書く」ボタン（pre時）:
  mt-3 w-full bg-amber-500/10 border border-amber-500/30 rounded-lg
  py-2.5 text-sm text-amber-400 font-medium
  flex items-center justify-center gap-1.5
  hover:bg-amber-500/20 transition-colors duration-150

リアクション行:
  mt-3 pt-3 border-t border-zinc-800
  flex items-center gap-3 text-xs text-zinc-500
```

#### Framer Motionアニメーション

```typescript
// カード全体
<motion.div
  variants={cardVariants}
  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
  whileTap={{ scale: 0.99 }}
  transition={{ duration: 0.15 }}
>

// 「振り返りを書く」ボタン（パルスアニメーション）
<motion.button
  animate={{ boxShadow: ['0 0 0 0 rgba(245,158,11,0)', '0 0 0 6px rgba(245,158,11,0.15)', '0 0 0 0 rgba(245,158,11,0)'] }}
  transition={{ duration: 2, repeat: Infinity }}
>
```

---

### 3.3 HighlightCard / HighlightPin

#### Props定義

```typescript
interface HighlightCardProps {
  highlight: Highlight;
  onPress: (highlight: Highlight) => void;
  variant?: 'full' | 'mini';  // full=一覧ページ, mini=プロフィール
}
```

#### fullバリアント構造

```
┌──────────────────────────────────────────┐
│  📌  [ノートタイプバッジ]     4/15        │
│  ─────────────────────────────────────  │
│  "シュートを打つ前に周りを見てから決める"    │
│                                          │
│  出典: 4/15 ○○FC戦 / 試合後 できたこと   │
└──────────────────────────────────────────┘
```

#### Tailwindクラス詳細

```
カード外枠:
  bg-zinc-900 border border-zinc-800 rounded-xl p-4
  hover:border-amber-500/30 transition-colors duration-150 cursor-pointer

ヘッダー行:
  flex items-center justify-between mb-2.5
  ピンアイコン: text-amber-400 text-sm
  ノートタイプバッジ: rounded-full px-2 py-0.5 text-xs font-medium
    試合前: bg-blue-500/20 text-blue-400
    試合後: bg-green-500/20 text-green-400
    練習: bg-purple-500/20 text-purple-400
  日付: text-xs text-zinc-500

テキスト本体:
  text-base font-medium text-zinc-50 leading-relaxed
  line-clamp-3

出典行:
  mt-2.5 text-xs text-zinc-500 flex items-center gap-1
  "→ {日付} {相手}戦 / {セクション名}"
```

#### miniバリアント

```
bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3
ピンアイコン: text-amber-400 text-xs mr-1.5
テキスト: text-sm text-zinc-200 line-clamp-2
出典: text-xs text-zinc-600 mt-1
```

---

### 3.4 ReactionBar

#### Props定義

```typescript
interface ReactionBarProps {
  reactions: Record<ReactionType, number>;  // {'applause': 2, 'fire': 1, ...}
  userReactions: Set<ReactionType>;          // 自分がリアクションした種別
  onReact: (type: ReactionType) => void;
  disabled?: boolean;  // 自分の投稿の場合など（注: 仕様上制限なし）
}
```

#### 絵文字マッピング

```typescript
const REACTION_MAP: Record<ReactionType, string> = {
  applause: '👏',
  fire: '🔥',
  star: '⭐',
  muscle: '💪',
};
```

#### 構造・スタイル

```
┌──────────────────────────────────────────┐
│  👏 2   🔥 1   ⭐ 3   💪 0             │
└──────────────────────────────────────────┘

コンテナ: flex items-center gap-2 py-2

各リアクションボタン:
  未リアクション: flex items-center gap-1 px-3 py-1.5 rounded-full
                  bg-zinc-800 border border-zinc-700 
                  text-zinc-400 text-sm
                  hover:bg-zinc-700 hover:border-zinc-600 transition-colors

  リアクション済: bg-[var(--color-brand-primary)]/15 
                  border-[var(--color-brand-primary)]/40
                  text-[var(--color-brand-primary)]

  絵文字: text-base
  カウント: text-xs font-medium ml-0.5

  whileHover: { scale: 1.05 }
  whileTap: { scale: 0.92 }
```

#### リアクション追加アニメーション

```typescript
// +1 フローティングアニメーション
const floatUpVariants = {
  initial: { opacity: 1, y: 0, scale: 1 },
  animate: { opacity: 0, y: -24, scale: 1.5 },
  transition: { duration: 0.5, ease: 'easeOut' }
};
// AbsolutePositionedとして一時的にレンダリング
```

---

### 3.5 GoalReviewItem

#### Props定義

```typescript
interface GoalReviewItemProps {
  goal: BulletItem;              // 試合前の目標
  review: GoalReview | undefined; // 対応する振り返り（未入力の場合undefined）
  onChange?: (review: GoalReview) => void; // 編集モード時
  readonly?: boolean;
}

// GoalAchievement の表示マッピング
const ACHIEVEMENT_MAP = {
  achieved:     { label: 'できた',    color: 'green',  icon: '○' },
  partial:      { label: '部分的に',  color: 'amber',  icon: '△' },
  not_achieved: { label: 'できなかった', color: 'red',  icon: '×' },
};
```

#### 構造・スタイル

```
【編集モード (readonly=false)】
┌──────────────────────────────────────────────┐
│  • シュートを打つ前に周りを見てから決める         │
│  [○できた] [△部分的に] [×できなかった]         │
│  コメント（任意）: [________________] 0/50    │
└──────────────────────────────────────────────┘

【閲覧モード (readonly=true)】
┌──────────────────────────────────────────────┐
│  ○  シュートを打つ前に周りを見てから決める         │
│      "次はもっと意識してみる"                   │
└──────────────────────────────────────────────┘

コンテナ: space-y-2 py-3 border-b border-zinc-800 last:border-0

目標テキスト:
  text-sm text-zinc-300 leading-relaxed
  ピン済: text-amber-300 + 📌アイコン

達成状況ボタン群（編集時）:
  flex gap-2 mt-2
  各ボタン: px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
    未選択: bg-zinc-800 border-zinc-700 text-zinc-500
    achieved選択: bg-green-500/20 border-green-500/50 text-green-400
    partial選択:  bg-amber-500/20 border-amber-500/50 text-amber-400
    not_achieved選択: bg-red-500/20 border-red-500/50 text-red-400

閲覧モード 達成マーク:
  mr-2.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
  achieved:     bg-green-500/20 text-green-400
  partial:      bg-amber-500/20 text-amber-400
  not_achieved: bg-red-500/20 text-red-400

コメント入力（編集時）:
  mt-2 bg-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-50
  placeholder="コメント（任意）"
  border border-zinc-700 focus:border-[var(--color-brand-primary)]
  + 文字数カウンター 右下 text-xs text-zinc-600
```

---

### 3.6 ThreadComments

#### Props定義

```typescript
interface ThreadCommentsProps {
  targetType: 'journal' | 'note';
  targetId: string;
  currentUserId: string;
  currentUserRole: 'parent' | 'child' | 'member';
}

interface CommentItemProps {
  comment: JournalComment;
  replies?: JournalComment[];
  isExpanded?: boolean;
  onToggleReplies?: () => void;
  onReply?: (commentId: string, displayName: string) => void;
  onDelete?: (commentId: string, parentCommentId?: string) => void;
  currentUserId: string;
}
```

#### 全体構造

```
┌──────────────────────────────────────────┐
│ コメント (3件)                             │
├──────────────────────────────────────────┤
│  [コメント入力エリア]                       │
│  [________コメントを追加___________] [送信] │
├──────────────────────────────────────────┤
│  コメントリスト                             │
│  CommentItem × n                         │
└──────────────────────────────────────────┘
```

#### CommentItemスタイル

```
親コメント:
  py-3 border-b border-zinc-800/60 last:border-0

  ヘッダー行: flex items-start gap-3
    アバター: w-8 h-8 rounded-full bg-zinc-700 flex-shrink-0
              (avatarUrlあり: <img>、なし: イニシャル表示)
    本体:
      名前行: flex items-center gap-1.5 mb-0.5
        表示名: text-sm font-medium text-zinc-200
        [親]バッジ: bg-[var(--color-brand-primary)]/20 
                    text-[var(--color-brand-primary)] 
                    border border-[var(--color-brand-primary)]/30
                    rounded-full px-1.5 py-0.5 text-[10px] font-semibold
        時刻: text-xs text-zinc-500 ml-auto
      テキスト: text-sm text-zinc-300 leading-relaxed

  アクション行: flex items-center gap-3 mt-2 ml-11
    「返信する」: text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer
    「削除」(自分のみ): text-xs text-red-500/70 hover:text-red-400 cursor-pointer

  親[親]コメント特別スタイル:
    pl-3 border-l-4 border-[var(--color-brand-primary)]/50
    bg-[var(--color-brand-primary)]/5 rounded-r-lg pr-3 pt-2 pb-2 ml-0

返信展開トグル:
  ml-11 mt-1
  flex items-center gap-1.5 text-xs text-zinc-500 
  hover:text-zinc-300 cursor-pointer
  "▼ 返信を見る（2件）" / "▲ 閉じる"

返信リスト（AnimatePresence + 高さアニメーション）:
  ml-11 mt-2 space-y-2 pl-3 border-l border-zinc-700/50

  各返信:
    py-2
    アバター: w-6 h-6 (小さめ)
    名前: text-xs font-medium
    テキスト: text-xs text-zinc-400
```

#### コメント入力エリア

```
bg-zinc-800/50 rounded-xl p-3 mb-4 border border-zinc-700/50

返信モード時ヘッダー:
  flex items-center justify-between mb-2
  text-xs text-zinc-500 "@{displayName} への返信"
  [×] text-zinc-500 hover:text-zinc-300

入力フィールド:
  bg-transparent text-sm text-zinc-50 placeholder:text-zinc-600
  outline-none w-full resize-none min-h-[60px] leading-relaxed

フッター:
  flex items-center justify-between mt-2
  文字数: text-xs text-zinc-600 "{n}/200"
  送信ボタン: bg-[var(--color-brand-primary)] text-white rounded-lg
             px-3 py-1.5 text-xs font-medium
             disabled:opacity-40 disabled:cursor-not-allowed
```

---

### 3.7 StatusBadge（ステータスバッジ）

#### Props定義

```typescript
interface StatusBadgeProps {
  status: JournalStatus;
  size?: 'sm' | 'md';  // smがデフォルト
}
```

#### スタイル定義

```typescript
const STATUS_STYLES = {
  pre: {
    label: '振り返り待ち',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-400',
  },
  completed: {
    label: '振り返り完了',
    className: 'bg-green-500/15 text-green-400 border-green-500/30',
    dotColor: 'bg-green-400',
  },
  post_only: {
    label: '試合後のみ',
    className: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30',
    dotColor: 'bg-zinc-400',
  },
};

// 共通クラス
"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border"

// ドット（preのみアニメーション）
// pre: <span className="relative flex h-1.5 w-1.5">
//        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
//        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
//      </span>
```

---

### 3.8 公開設定トグル

#### 構造・スタイル

```
┌──────────────────────────────────────┐
│  🌏 家族に公開         [  ○───  ]    │
│  家族グループのメンバーが見られます      │
└──────────────────────────────────────┘

コンテナ: flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl
          border border-zinc-700/50

左テキスト:
  アイコン+ラベル行: text-sm font-medium text-zinc-200 flex items-center gap-2
  説明文: text-xs text-zinc-500 mt-0.5

トグルボタン (カスタム実装):
  オフ: w-11 h-6 rounded-full bg-zinc-700 relative transition-colors
  オン:  bg-[var(--color-brand-primary)]
  ノブ: absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
       transition-transform duration-200
       オフ: translate-x-0
       オン:  translate-x-5
  aria-checked, role="switch" 必須
```

---

## 4. インタラクション仕様

### 4.1 ピンボタンのインタラクション

```
1. ユーザーがピンボタンをタップ
2. ボタンが即座にピン済みスタイルに切り替わる（楽観的UI更新）
3. Framer Motion: scale(1) → scale(1.4) → scale(1) のバウンスアニメーション（0.3s）
4. ピン済み状態: 黄色ハイライト + 📌文字色変化
5. Firestore書き込みが失敗した場合: 元の状態に戻してSonnerエラートースト表示
6. 行全体のハイライト: bg-amber-500/10 にアニメーション遷移

ピン解除:
1. 逆アニメーション（フェードアウト→通常状態）
2. 行のハイライト解除
```

### 4.2 試合前→後の遷移フロー

```
ジャーナル詳細 (status: 'pre')
  → アンバーCTAバナーが画面中央に表示
  → 「試合後の振り返りを書く」ボタン押下
  → /journals/:id/post へ遷移（ページ遷移アニメーション）
  → 試合後ノートフォームに試合前の目標が引き継がれる
    （GoalReviewItemとして各目標が表示される）
  → 保存後: status: 'completed' に更新
  → ジャーナル詳細ページに戻る（Sonnerトースト「振り返りを保存しました！」）
  → ステータスバッジがアンバー→グリーンに切り替わるアニメーション
```

### 4.3 フォームバリデーションUI

```
リアルタイムバリデーション（onBlur）:
  エラーフィールド: border-red-500 text-red-400
  エラーメッセージ: text-xs text-red-400 mt-1 flex items-center gap-1
                   "⚠ {エラーメッセージ}"
  アニメーション: initial { opacity: 0, y: -4 } → animate { opacity: 1, y: 0 }

送信時バリデーション:
  エラーのある最初のフィールドへ自動スクロール
  フォーカス移動

保存成功:
  Sonner toast.success("保存しました！", { duration: 2000 })

保存失敗:
  Sonner toast.error("保存に失敗しました。再試行してください", { duration: 4000,
    action: { label: '再試行', onClick: () => handleSubmit() } })

削除確認ダイアログ:
  shadcn/ui AlertDialog を使用
  タイトル: "このジャーナルを削除しますか？"
  説明: "このジャーナルを削除すると、試合後ノートとすべての写真も削除されます。この操作は取り消せません。"
  確認ボタン: bg-red-600 text-white "削除する"
  キャンセル: bg-zinc-800 text-zinc-200 "キャンセル"
```

### 4.4 スレッドコメント展開

```
「返信を見る（n件）」タップ:
  → AnimatePresence で返信リストを高さ0→autoにアニメーション展開（0.25s easeOut）
  → ボタンテキストが「返信を見る」→「閉じる」に切り替わる
  → アイコンが▼→▲に回転アニメーション

返信入力モード:
  → コメント入力エリアの上部に "@{displayName} への返信" ヘッダーが出現
  → スクロールして入力エリアが見えるようにする（scrollIntoView）
  → [×]で返信モード解除
```

### 4.5 写真アップロード

```
写真選択:
  → <input type="file" accept="image/*" multiple capture="environment">
  → iOS: カメラロール / カメラ選択シートが出る
  → プレビューサムネイル即時表示
  → 圧縮処理（client-side）: 最長辺1280px以内にリサイズ、JPEG品質0.8
  → アップロード中: サムネイルにローディングオーバーレイ（半透明+スピナー）
  → 5枚超: 追加ボタンを非表示にする
```

---

## 5. 空状態・ローディング・エラー状態

### 5.1 ジャーナル一覧 空状態

```
┌─────────────────────────────┐
│          (中央揃え)           │
│                             │
│  [サッカーボールSVGイラスト]   │
│   w-32 h-32 opacity-20      │
│                             │
│  最初の試合を記録しよう！       │
│  text-lg font-semibold      │
│  text-zinc-300 mt-4         │
│                             │
│  試合前に目標を立てて、         │
│  試合後に振り返ることで         │
│  成長を記録できます。           │
│  text-sm text-zinc-500 mt-2 │
│  text-center max-w-[240px]  │
│                             │
│  [試合ジャーナルを書く]        │
│  bg-[var(--color-brand-primary)] │
│  mt-6 w-full max-w-[240px] │
│  rounded-xl py-3 text-white │
│                             │
└─────────────────────────────┘
```

### 5.2 ハイライト一覧 空状態

```
アイコン: 📌 text-6xl opacity-20 mb-4
タイトル: "気づきをピンしよう"
説明: "ジャーナルの箇条書きにある📌ボタンを\nタップすると、ここに集まります。"
```

### 5.3 スケルトンローディング

```typescript
// JournalCardSkeleton
// bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse

コンポーネント構成:
  上部カラーバー: h-1 bg-zinc-700 rounded-t-xl
  1行目: h-4 bg-zinc-700 rounded-full w-1/3 mb-3
  2行目: h-6 bg-zinc-700 rounded-full w-2/3 mb-2
  3行目: h-4 bg-zinc-700 rounded-full w-1/2 mb-4
  スコア行: flex gap-4 
    h-10 bg-zinc-700 rounded w-16
    h-10 bg-zinc-700 rounded w-16

// animate-pulse の代わりに Framer Motion でシマーアニメーションを使う場合
const shimmerVariants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' }
  }
};
// background: linear-gradient(90deg, zinc-800 25%, zinc-700 50%, zinc-800 75%)
// backgroundSize: 200%
```

### 5.4 ローディングスピナー

```
全画面ローディング:
  固定オーバーレイ bg-zinc-950/80 backdrop-blur-sm
  中央: spinner（w-8 h-8 border-2 border-zinc-700 border-t-[var(--color-brand-primary)] rounded-full）
        animate-spin

インライン（ボタン内）:
  w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin
```

---

## 6. ナビゲーション変更仕様

### 6.1 ボトムナビバー変更

現状のタブ構成から以下に変更:

```
変更前: [ホーム] [ノート] [目標] [プロフィール]
変更後: [ホーム] [ジャーナル] [振り返り] [プロフィール]
```

```typescript
// ナビタブ定義
const NAV_ITEMS = [
  { path: '/',          icon: HomeIcon,        label: 'ホーム' },
  { path: '/journals',  icon: BookOpenIcon,    label: 'ジャーナル' },
  { path: '/highlights', icon: StarIcon,       label: '振り返り' },
  { path: '/profile',   icon: UserCircleIcon,  label: 'プロフィール' },
];
```

#### ボトムナビスタイル

```
固定位置: fixed bottom-0 left-0 right-0 z-50
         bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800
         pb-safe (iOS Safe Area対応: padding-bottom: env(safe-area-inset-bottom))

タブ: flex-1 flex flex-col items-center justify-center py-2 gap-0.5
アイコン: w-5 h-5
ラベル: text-[10px] font-medium

非アクティブ: text-zinc-500
アクティブ: text-[var(--color-brand-primary)]
アクティブ下線: w-4 h-0.5 bg-[var(--color-brand-primary)] rounded-full mt-0.5
               (Framer Motion layoutId="activeTab" で滑らかに移動)
```

### 6.2 FAB（フローティングアクションボタン）

試合ジャーナル一覧ページにFABを配置:

```
固定位置: fixed bottom-20 right-4 z-40
          (ボトムナビの上)

ボタン: w-14 h-14 rounded-full bg-[var(--color-brand-primary)] shadow-lg shadow-[var(--color-brand-primary)]/25
        flex items-center justify-center
        + アイコン: PlusIcon w-6 h-6 text-white

whileHover: { scale: 1.1, boxShadow: '0 8px 24px rgba(232,85,19,0.35)' }
whileTap: { scale: 0.93 }

FABタップ時: ボトムシート表示
  「試合前ノートを書く」（主要アクション）
  「試合後のみ記録する」
  「練習メモを書く」
```

---

## 7. アクセシビリティ

### 7.1 コントラスト比（WCAG AA準拠）

```
テキスト主 (zinc-50 on zinc-950):   コントラスト比 > 15:1 ✓
テキスト副 (zinc-400 on zinc-950):  コントラスト比 > 7:1  ✓
アンバーアクセント (amber-400 on zinc-900): > 4.5:1 ✓
グリーンバッジ (green-400 on zinc-900):     > 4.5:1 ✓
ブランドプライマリ (#E85513 on zinc-950):   > 4.5:1 ✓

注: disabled状態 (opacity-50適用) はWCAG AA非準拠となるが
    操作不可であることの視覚的フィードバックとして許容。
```

### 7.2 フォーカス表示

```
全インタラクティブ要素:
  focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] 
  focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
  focus-visible:outline-none

フォーカストラップ: モーダル・ドロワー・AlertDialog内で実装（shadcn/ui標準）
```

### 7.3 aria属性ガイドライン

```typescript
// ステータスバッジ
<span aria-label={`ステータス: ${STATUS_STYLES[status].label}`}>

// ピンボタン
<button
  aria-label={isPinned ? 'ピンを解除する' : 'この項目をピンする'}
  aria-pressed={isPinned}
>

// リアクションボタン
<button
  aria-label={`${REACTION_MAP[type]} ${reactions[type]}件のリアクション。${userReactions.has(type) ? 'リアクション済み' : 'リアクションする'}`}
  aria-pressed={userReactions.has(type)}
>

// 公開設定トグル
<button
  role="switch"
  aria-checked={isPublic}
  aria-label="家族に公開する"
>

// スレッドコメント展開
<button
  aria-expanded={isExpanded}
  aria-controls={`replies-${comment.id}`}
>

// コメント削除
<button aria-label={`${comment.displayName}のコメントを削除`}>

// 箇条書き入力
<textarea
  aria-label={`目標 ${index + 1}件目`}
  aria-describedby={`bullet-hint-${index}`}
>
```

### 7.4 スクリーンリーダー対応

```
ジャーナルカード:
  <article aria-label={`${format(journal.date.toDate(), 'M月d日')} ${journal.opponent}戦`}>

リアクション数変化:
  aria-live="polite" でカウントアップ通知

フォーム送信中:
  <button aria-busy={isSubmitting} disabled={isSubmitting}>

ローディング状態:
  <div role="status" aria-label="読み込み中">
```

---

## 8. モバイル対応仕様

### 8.1 ブレークポイント戦略

```
モバイルファースト設計:
  デフォルト（〜767px）: 1カラム、フルワイド
  md（768px〜）:         コンポーネントによって2カラムグリッド
  lg（1024px〜）:        max-w-2xl mx-auto（コンテンツ幅制限）
  xl（1280px〜）:        max-w-3xl mx-auto
```

### 8.2 タッチターゲット

```
全タップ可能要素: min-w-[44px] min-h-[44px]
ピンボタン例外: w-9 h-9 → タップエリアを padding で拡大
  <div className="p-2 -m-2 cursor-pointer"> (実質44px)

ボトムナビタブ: flex-1（均等分割）min-height 56px
FABボタン: w-14 h-14（56px）
```

### 8.3 iOS/Android対応

```
セーフエリア:
  pb-safe クラスを定義:
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  }

スクロール:
  -webkit-overflow-scrolling: touch; (横スクロールコンテナ)
  overscroll-behavior: contain; (モーダル内スクロール)

入力フォーム:
  font-size: 16px 必須（iOSズーム防止）
  text-base クラスで統一

キーボード表示時:
  固定フッターが隠れないよう、visualViewport API を活用した
  フッター位置調整を検討（実装はGeneratorに委ねる）
```

### 8.4 モバイル専用UI調整

```
箇条書き入力 モバイル:
  各行の高さ: min-h-[48px] （モバイルではより大きいタッチターゲット）
  ピンボタン: 常に表示（group-hover不要、常時opacity-100）

写真アップロード:
  accept="image/*" capture="environment" でカメラ直接起動を優先

コメント入力（キーボード表示後）:
  scrollIntoView({ behavior: 'smooth', block: 'nearest' })

ジャーナル詳細（セクション切り替え）:
  タブ固定なし→縦スクロール一本化（モバイルでのタブは省略）
```

---

## 実装時の注意事項（Generatorへの引き継ぎ）

### CSS変数の使用方法

```typescript
// Tailwindの任意値記法でCSS変数を参照
className="bg-[var(--color-brand-primary)]"
className="text-[var(--color-brand-primary)]"
className="border-[var(--color-brand-primary)]"

// ホバー状態
className="hover:bg-[var(--color-brand-primary)]/90"

// 透過バリエーション
className="bg-[var(--color-brand-primary)]/20"  // 20%透過
```

### motion/react のインポート

```typescript
// Framer Motion v11以降はmotion/reactからインポート
import { motion, AnimatePresence } from 'motion/react';
```

### Sonner トーストの使用

```typescript
import { toast } from 'sonner';

// 成功
toast.success('振り返りを保存しました！');

// エラー（再試行付き）
toast.error('保存に失敗しました。再試行してください', {
  action: { label: '再試行', onClick: () => handleSubmit() },
  duration: 4000,
});
```

### shadcn/uiコンポーネントの活用

```
使用推奨:
  AlertDialog: 削除確認ダイアログ
  Sheet:       FABタップ時のアクション選択ボトムシート
  Skeleton:    ローディングスケルトン基盤
  Avatar:      コメントアバター
  Separator:   セクション区切り

テーマ: dark モード前提。shadcn/uiのCSSをzincベースにオーバーライド済み想定。
```

---

*本デザイン仕様書はGeneratorエージェントへの実装指示として使用されます。*
*仕様書: `.claude/specs/match-journal-v1.md`*
