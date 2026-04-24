# 試合ノートUX改善 デザイン仕様書 v2

作成日: 2026-04-24
作成者: Designerエージェント
参照仕様書: docs/spec_journal_ux_v2.md

---

## 1. 設計方針

### デザインシステム基盤
- カラー変数: `bg-zinc-950`（ページ背景）/ `bg-zinc-900`（カード）/ `bg-zinc-800`（入力・ボーダー）
- ブランドカラー: `var(--color-brand-primary)` (#E85513 デフォルト)
- タイポグラフィ: Inter + Noto Sans JP
- アニメーション: Framer Motion (`motion/react`)
- モバイルファースト: タップターゲット `min-h-[44px] min-w-[44px]` 必須

### ダーク/ライトモード
Tailwind CSS v4 のCSS変数反転方式を使用。zinc系カラーはdark/lightで自動反転。
ブランドカラーは `var(--color-brand-primary)` で統一し、モード非依存。

---

## 2. コンポーネント構造図

```
JournalDetailPage
├── StickyHeader（固定ヘッダー）
│   ├── BackButton
│   ├── StatusBadge
│   └── DeleteButton（isOwnerのみ）
├── MatchInfoCard（試合情報ヘッダーカード）
│   ├── MetaRow（日付・スポーツ・会場）
│   ├── OpponentDisplay（vs相手チーム）
│   └── ScoreBadge（ゴール数、あれば）
├── JournalStepProgress（ステップ進捗、isOwnerのみ）
│   ├── Step1（試合前の目標）
│   ├── StepConnector（コネクターライン）
│   ├── Step2（試合後の振り返り）
│   └── CTAButton（status==='pre'かつisOwnerのみ）
├── JournalAccordionBlock（試合前ブロック、preNoteがあれば）
│   ├── AccordionHeader
│   │   ├── IconLabel（🎯 試合前の目標）
│   │   ├── EditButton（isOwnerのみ）
│   │   └── ToggleButton（展開/折りたたみ）
│   └── AccordionContent（AnimatePresence）
│       ├── GoalsList
│       └── ChallengesList（あれば）
├── JournalAccordionBlock（試合後ブロック、postNoteがあれば）
│   ├── AccordionHeader
│   │   ├── IconLabel（📊 試合後の振り返り）
│   │   ├── EditButton（isOwnerのみ）
│   │   └── ToggleButton（展開/折りたたみ）
│   └── AccordionContent（AnimatePresence）
│       ├── GoalReviewsSection（preNoteがあれば）
│       ├── InsightsSection（あれば）
│       ├── AchievementsSection（あれば）
│       ├── ImprovementsSection（あれば）
│       ├── ExplorationsSection（あれば）
│       └── PerformanceSection（あれば）
├── JournalCommentSection（プロファイルロード完了後）
└── DeleteConfirmDialog（showDeleteDialogのみ）
```

---

## 3. 新規コンポーネント詳細設計

### 3-1. JournalAccordionBlock

**ファイルパス**: `src/components/journals/JournalAccordionBlock.tsx`

**Props定義（TypeScript）**
```typescript
interface JournalAccordionBlockProps {
  title: string;           // "試合前の目標" | "試合後の振り返り"
  icon: string;            // "🎯" | "📊"
  defaultOpen?: boolean;   // デフォルトtrue
  onEdit?: () => void;     // 編集ボタンのコールバック（isOwnerのみ渡す）
  children: React.ReactNode;
}
```

**状態パターン**
| 状態 | 見た目 |
|------|--------|
| 展開デフォルト | children表示、トグルボタンが ▲ |
| 折りたたみ | children非表示（高さ0）、トグルボタンが ▼ |
| ホバー（ヘッダー） | `bg-zinc-800/40` |

**Tailwindクラス仕様**

外枠:
```
border border-zinc-800 rounded-2xl overflow-hidden
bg-zinc-900
```

ヘッダー行:
```
flex items-center gap-2 px-4
min-h-[44px]
border-b border-zinc-800/60
cursor-pointer
hover:bg-zinc-800/40 transition-colors duration-150
```

アイコンラベル:
```
flex items-center gap-2 flex-1
text-sm font-semibold text-zinc-300
```

編集ボタン（isOwnerのみ表示）:
```
flex items-center gap-1 px-2.5 py-1
rounded-lg text-xs
text-zinc-400 bg-zinc-800 border border-zinc-700
hover:text-zinc-200 hover:bg-zinc-700 transition-colors duration-150
min-h-[32px]
```

トグルボタン:
```
min-w-[32px] min-h-[32px]
flex items-center justify-center
text-zinc-500 hover:text-zinc-300 transition-colors duration-150
```

コンテンツラッパー:
```
overflow-hidden
```

コンテンツ内部パディング:
```
px-4 py-3
```

**アニメーション仕様（Framer Motion）**
```typescript
// AnimatePresence + motion.div でheightアニメーション
const contentVariants = {
  open: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

// 使用例
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      key="content"
      initial="closed"
      animate="open"
      exit="closed"
      variants={contentVariants}
      style={{ overflow: 'hidden' }}
    >
      <div className="px-4 py-3">
        {children}
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

トグルアイコンアニメーション:
```typescript
<motion.div
  animate={{ rotate: isOpen ? 180 : 0 }}
  transition={{ duration: 0.2 }}
>
  <ChevronDown size={16} />
</motion.div>
```

**ワイヤーフレーム**
```
┌──────────────────────────────────────────────┐
│ [🎯] 試合前の目標              [✏️編集] [▲] │  ← min-h-44px
├──────────────────────────────────────────────┤
│ • 目標テキスト1                              │
│ • 目標テキスト2                              │
│ ───────────────────────────────────────────  │
│ チャレンジしたいこと                         │
│ • チャレンジ1                                │
└──────────────────────────────────────────────┘
```

---

### 3-2. JournalStepProgress

**ファイルパス**: `src/components/journals/JournalStepProgress.tsx`

**Props定義（TypeScript）**
```typescript
interface JournalStepProgressProps {
  hasPreNote: boolean;
  hasPostNote: boolean;
  isOwner: boolean;
  journalId: string;
  onPostCta: () => void;  // CTAボタンクリック → /journals/:id/post へ遷移
}
```

**状態パターン**

ステップ1（試合前の目標）:
- `hasPreNote === true`: 完了スタイル（緑チェック + テキスト打ち消し線）
- `hasPreNote === false`: 未完了スタイル（グレー番号）

ステップ2（試合後の振り返り）:
- `hasPostNote === true`: 完了スタイル（緑チェック）
- `hasPostNote === false` + `hasPreNote === true`: アクティブスタイル（ブランドカラーパルス）

**Tailwindクラス仕様**

コンテナ:
```
flex items-center gap-2 mb-3
```

ステップバッジ（完了）:
```
w-6 h-6 rounded-full
bg-green-500/20 flex items-center justify-center
text-green-400 text-[11px]
```

ステップバッジ（アクティブ）:
```
w-6 h-6 rounded-full
bg-[var(--color-brand-primary)] flex items-center justify-center
text-white text-[11px] font-bold
animate-pulse
```

ステップバッジ（未完了）:
```
w-6 h-6 rounded-full
bg-zinc-700 flex items-center justify-center
text-zinc-400 text-[11px] font-bold
```

ステップテキスト（完了）:
```
text-xs text-zinc-600 line-through
```

ステップテキスト（アクティブ）:
```
text-xs font-medium text-[var(--color-brand-primary)]
```

ステップテキスト（未完了）:
```
text-xs text-zinc-500
```

コネクターライン（完了 → アクティブ）:
```
flex-1 h-px bg-[var(--color-brand-primary)]/40 mx-1
```

コネクターライン（未完了 → 未完了）:
```
flex-1 h-px bg-zinc-800 mx-1
```

CTAボタン:
```
w-full
bg-[var(--color-brand-primary)] text-white
rounded-xl px-5 py-4
text-sm font-semibold
flex items-center justify-between
min-h-[56px]
```

CTAボタン内テキスト（大）:
```
text-base font-bold
```

CTAボタン内テキスト（小）:
```
text-xs text-white/70
```

**アニメーション仕様**
```typescript
// CTAボタン
<motion.button
  whileTap={{ scale: 0.97 }}
  whileHover={{ scale: 1.01 }}
  transition={{ duration: 0.15 }}
  onClick={onPostCta}
  className="..."
>
```

**ワイヤーフレーム（status==='pre'かつisOwner）**
```
┌──────────────────────────────────────────────┐
│  ✅ 試合前の目標  ────────  [2] 試合後の振り返り │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  試合の振り返りを記録            →     │  │
│  │  気づき・できたこと・課題を入力         │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

---

## 4. 既存コンポーネントの改修仕様

### 4-1. JournalDetailPage 全面リデザイン

**ファイルパス**: `src/routes/app/journals/JournalDetailPage.tsx`

#### 変更点一覧

1. **isManager のロード待ち追加**
```typescript
// 変更前
const { isManager } = useActiveProfile();

// 変更後
const { isManager, isLoading: isProfileLoading } = useActiveProfile();
// JournalCommentSection の描画をisProfileLoading完了後に行う
```

2. **試合前ブロックをJournalAccordionBlockに置き換え**
- 既存の `div.mx-4.mt-3.bg-zinc-900.border...` → `JournalAccordionBlock`
- `defaultOpen={true}`
- `onEdit={isOwner ? () => navigate(\`/journals/\${journal.id}/edit/pre\`) : undefined}`

3. **試合後ブロックをJournalAccordionBlockに置き換え**
- 既存の `div.mx-4.mt-3.space-y-3` とその中の6つの独立カード → 1つの `JournalAccordionBlock`
- 各サブセクションを内部で `border-t border-zinc-800/60` 区切り線付きで縦に並べる
- `defaultOpen={true}`
- `onEdit={isOwner ? () => navigate(\`/journals/\${journal.id}/edit/post\`) : undefined}`

4. **ステップ進捗をJournalStepProgressコンポーネントに置き換え**
- 既存のインライン実装 → `JournalStepProgress` コンポーネント
- `isOwner` の場合のみレンダリング

5. **コメントセクションのロード待ち**
```typescript
// 変更前
{journalId && (
  <JournalCommentSection journalId={journalId} isManager={isManager} />
)}

// 変更後
{journalId && !isProfileLoading && (
  <JournalCommentSection journalId={journalId} isManager={isManager} />
)}
```

#### 試合後ブロック内部レイアウト詳細

各サブセクション共通クラス:
```
border-t border-zinc-800/60 pt-3 mt-3
```

最初のサブセクション（border-tなし）:
```
first:border-t-0 first:pt-0 first:mt-0
```

サブセクションラベル:
```
flex items-center gap-1.5 mb-2
text-xs font-semibold text-zinc-500 uppercase tracking-wide
```

**ワイヤーフレーム（試合後ブロック展開時）**
```
┌──────────────────────────────────────────────┐
│ [📊] 試合後の振り返り          [✏️編集] [▲] │
├──────────────────────────────────────────────┤
│ 目標の達成状況                               │
│   ✅ 目標1  →  [達成]                        │
│   △ 目標2  →  [一部達成]                    │
│ ─────────────────────────────────────────    │
│ 💡 気づき                                    │
│   • 気づき1                                  │
│ ─────────────────────────────────────────    │
│ ✅ できたこと                                │
│   • できたこと1                              │
│ ─────────────────────────────────────────    │
│ 📈 課題                                      │
│   • 課題1                                    │
│ ─────────────────────────────────────────    │
│ 🔍 もっと探求したいこと                      │
│   • 探求1                                    │
│ ─────────────────────────────────────────    │
│ ⭐ 自己評価                                  │
│   ★★★★☆                                 │
└──────────────────────────────────────────────┘
```

---

### 4-2. HighlightCard 改修

**ファイルパス**: `src/components/highlights/HighlightCard.tsx`

#### SOURCE_TYPE_LABELS の更新

```typescript
const SOURCE_TYPE_LABELS: Record<HighlightSourceType, { label: string; badge: string }> = {
  // アクティブなsourceType（鮮やかバッジ）
  journal_insight: {
    label: '試合の気づき',
    badge: 'bg-amber-500/20 text-amber-400'
  },
  note_insight: {
    label: '練習の気づき',
    badge: 'bg-amber-500/20 text-amber-400'
  },
  practice_bullet: {
    label: '練習メモ',
    badge: 'bg-purple-500/20 text-purple-400'
  },
  // 過去データ互換（薄いグレーバッジ）
  journal_pre_goal: {
    label: '試合メモ（過去データ）',
    badge: 'bg-zinc-700/50 text-zinc-500'
  },
  journal_pre_challenge: {
    label: '試合メモ（過去データ）',
    badge: 'bg-zinc-700/50 text-zinc-500'
  },
  journal_post_achievement: {
    label: '試合メモ（過去データ）',
    badge: 'bg-zinc-700/50 text-zinc-500'
  },
  journal_post_improvement: {
    label: '試合メモ（過去データ）',
    badge: 'bg-zinc-700/50 text-zinc-500'
  },
  journal_post_exploration: {
    label: '試合メモ（過去データ）',
    badge: 'bg-zinc-700/50 text-zinc-500'
  },
};
```

#### HighlightCardの改善点

- テキスト本体を `text-base` から `text-[15px]` に変更（やや大きく可読性向上）
- 出典行の重複表示を修正（日付・ラベルが2重表示になっているバグを解消）

**変更前（出典行の重複）:**
```tsx
{/* ヘッダー行 */}
<div>
  <span className={sourceInfo.badge}>{sourceInfo.label}</span>
  <span>{dateStr}</span>
</div>
{/* 出典行（重複） */}
<p>{dateStr} · {sourceInfo.label}</p>  {/* ← 削除 */}
```

**変更後:**
```tsx
{/* ヘッダー行: バッジ + 日付 */}
<div className="flex items-center justify-between mb-2.5">
  <div className="flex items-center gap-2">
    <span className="text-amber-400 text-sm">📌</span>
    <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', sourceInfo.badge)}>
      {sourceInfo.label}
    </span>
  </div>
  <span className="text-xs text-zinc-500">{dateStr}</span>
</div>
{/* テキスト本体 */}
<p className="text-[15px] font-medium text-zinc-50 leading-relaxed line-clamp-3">
  {highlight.text}
</p>
{/* 出典行: 元ジャーナルへのリンク矢印のみ（journalIdがあれば） */}
{highlight.sourceId && (
  <p className="mt-2 text-xs text-zinc-500 flex items-center gap-1">
    <span className="text-zinc-600">→</span>
    <span>元のジャーナルを見る</span>
  </p>
)}
```

---

## 5. 全体レイアウト仕様

### ページレイアウト（JournalDetailPage）

**モバイル（デフォルト）:**
```
┌─────────────────────────────────┐
│ [←] [試合前記録済み] [削除]      │  sticky top-0, h-[52px]
├─────────────────────────────────┤
│  MatchInfoCard                  │  mx-4 mt-3
│  ┌─────────────────────────────┐│
│  │ 2026年4月21日（火）          ││  text-sm text-zinc-500
│  │ サッカー 📍 市営グラウンド   ││
│  │                             ││
│  │       vs ○○FC              ││  text-xl font-bold text-center
│  │                             ││
│  │    自分のゴール数: 2         ││  text-xl font-black
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│  JournalStepProgress            │  mx-4 my-3（isOwnerのみ）
│  （CTAボタンあり/なし）           │
├─────────────────────────────────┤
│  JournalAccordionBlock（試合前）  │  mx-4 mt-2
├─────────────────────────────────┤
│  JournalAccordionBlock（試合後）  │  mx-4 mt-3
├─────────────────────────────────┤
│  JournalCommentSection          │  mx-4 mt-4（プロファイルロード後）
└─────────────────────────────────┘
    pb-24（BottomNavの高さ分）
```

**タブレット/デスクトップ（md:以上）:**
```
max-w-2xl mx-auto（センター配置）
```

### スペーシング定義

| 要素 | クラス |
|------|--------|
| ページ横パディング | `mx-4` |
| カード間マージン | `mt-3` |
| ページ下パディング | `pb-24` |
| カード内パディング | `px-4 py-3` |
| セクション間区切り | `border-t border-zinc-800/60 pt-3 mt-3` |

---

## 6. インタラクション仕様

### アコーディオン開閉
- トリガー: ヘッダー行全体をクリック/タップ（`cursor-pointer`）
- アニメーション: `height: 0 ↔ auto` + `opacity: 0 ↔ 1`（Framer Motion AnimatePresence）
- 編集ボタンクリックはアコーディオン開閉をトリガーしない（`e.stopPropagation()`）
- 初期状態: `defaultOpen={true}`

### 編集ボタン遷移
- 試合前編集: `navigate(\`/journals/\${journal.id}/edit/pre\`)`
- 試合後編集: `navigate(\`/journals/\${journal.id}/edit/post\`)`

### CTAボタン遷移
- `navigate(\`/journals/\${journal.id}/post\`)`
- `whileTap: { scale: 0.97 }` フィードバック

### 削除ダイアログ
- トリガー: 「削除」ボタン（ヘッダー右端）
- オーバーレイ: `fixed inset-0 bg-black/60 z-50`
- ダイアログカード: `bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full mx-4`
- 確定ボタン: `bg-red-600 text-white`

---

## 7. 状態別デザイン

### ローディング状態
既存のスピナーを流用:
```tsx
<div className="w-8 h-8 border-2 border-zinc-700 border-t-[var(--color-brand-primary)] rounded-full animate-spin" />
```

### エラー状態（journalがnull）
既存のエラー表示を流用（変更なし）

### 空状態パターン

| 状態 | 表示内容 |
|------|---------|
| preNote が null | 試合前ブロック非表示 / JournalStepProgress でステップ1がグレー表示 |
| postNote が null（status==='pre'） | 試合後ブロック非表示 / CTAボタンをJournalStepProgressで表示 |
| insights が空 | InsightsSectionを非表示（条件レンダリング） |
| achievements が空 | AchievementsSectionを非表示 |
| goalReviews が空 | GoalReviewsSectionを非表示 |

### コメントセクションのisProfileLoadingガード
```tsx
{journalId && !isProfileLoading && (
  <JournalCommentSection
    journalId={journalId}
    isManager={isManager}
  />
)}
```
isProfileLoading中はスケルトン非表示（コメントセクション自体をレンダリングしない）。
プロファイルロード完了後にisManaerが確定してから描画することで管理者フォームの表示バグを防ぐ。

---

## 8. アクセシビリティ仕様

### コントラスト比（WCAG AA準拠）
| 要素 | 前景色 | 背景色 | 比率 |
|------|--------|--------|------|
| 本文テキスト | zinc-50 (#fafafa) | zinc-900 (#18181b) | 18.4:1 ✅ |
| 副テキスト | zinc-400 (#a1a1aa) | zinc-900 (#18181b) | 4.7:1 ✅ |
| アンバーバッジ | amber-400 (#fbbf24) | amber-500/20 | 適切 |
| グレーバッジ（過去データ） | zinc-500 (#71717a) | zinc-700/50 | 3.0:1（装飾的） |

### フォーカス表示
全インタラクティブ要素:
```
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-[var(--color-brand-primary)]
focus-visible:ring-offset-2
focus-visible:ring-offset-zinc-900
```

### aria属性
```tsx
// アコーディオントグルボタン
<button
  aria-expanded={isOpen}
  aria-controls="accordion-content-id"
  aria-label={isOpen ? 'セクションを折りたたむ' : 'セクションを展開する'}
>

// 編集ボタン
<button aria-label={`${title}を編集する`}>

// CTAボタン
<button aria-label="試合後の振り返りを記録する">

// 削除ボタン
<button aria-label="このジャーナルを削除する">
```

---

## 9. モバイル対応仕様

### ブレークポイント別変化
| ブレークポイント | 変化内容 |
|----------------|---------|
| デフォルト（〜md） | mx-4 フルワイドカード |
| md（768px）以上 | max-w-2xl mx-auto センター配置 |
| lg（1024px）以上 | max-w-3xl mx-auto |

### タップターゲット保証
| 要素 | タップターゲットサイズ |
|------|---------------------|
| 戻るボタン | min-w-[44px] min-h-[44px] |
| 削除ボタン | min-w-[44px] min-h-[44px] |
| アコーディオンヘッダー | min-h-[44px] |
| 編集ボタン | min-h-[32px]（ヘッダー内補助的ボタンのため緩和可） |
| トグルボタン | min-w-[32px] min-h-[32px] |
| CTAボタン | min-h-[56px] |

---

## 10. 変更対象ファイルと変更内容概要

### 新規作成

| ファイルパス | 内容 | 優先度 |
|------------|------|--------|
| `src/components/journals/JournalAccordionBlock.tsx` | アコーディオンブロック共用コンポーネント | 高 |
| `src/components/journals/JournalStepProgress.tsx` | ステップ進捗インジケーター+CTAボタン | 高 |
| `tests/unit/journals/JournalAccordionBlock.test.tsx` | JournalAccordionBlockのユニットテスト | 高 |

### 修正

| ファイルパス | 変更内容 | 優先度 |
|------------|---------|--------|
| `src/routes/app/journals/JournalDetailPage.tsx` | 新規コンポーネントへのリデザイン + isProfileLoadingガード | 高 |
| `src/components/highlights/HighlightCard.tsx` | SOURCE_TYPE_LABELSラベル更新 + 出典行重複バグ修正 | 中 |
| `src/lib/firebase/matchJournalService.ts` | createPostMatchOnly のsourceTypeバグ修正 | 高 |
| `src/types/highlight.ts` | HighlightSourceTypeのコメント整備（廃止予定明示） | 低 |

---

## 11. Generatorへの引き継ぎ事項

### 実装順序（推奨）

1. **matchJournalService.ts のバグ修正**（副作用最小・最優先）
   - `createPostMatchOnly` の `journal_post_improvement` → `journal_insight` 修正

2. **新規コンポーネント作成**
   - `JournalAccordionBlock.tsx` を作成（汎用・再利用可能に）
   - `JournalStepProgress.tsx` を作成

3. **JournalDetailPage リデザイン**
   - 既存の縦並びカード群を `JournalAccordionBlock` に置き換え
   - `JournalStepProgress` を組み込み
   - isProfileLoading ガードを追加

4. **HighlightCard 改修**
   - SOURCE_TYPE_LABELS 更新
   - 出典行の重複削除

5. **ユニットテスト作成**
   - `JournalAccordionBlock.test.tsx`

### 注意事項

- `JournalAccordionBlock` のヘッダークリックで `e.stopPropagation()` を編集ボタンに適用すること（クリックイベントのバブリング防止）
- アコーディオンアニメーションには `AnimatePresence` の `initial={false}` を設定し、マウント時のアニメーションを無効化すること（ページロード時のちらつき防止）
- `useActiveProfile` の `isLoading` プロパティが存在しない場合は、フックの戻り値の型を確認してフィールド名を合わせること
- `motion/react` を使用（`framer-motion` ではなく）

### 既存コンポーネントで流用するもの（変更不要）

- `StatusBadge` コンポーネント（変更なし）
- `GoalReviewItem` コンポーネント（変更なし）
- `JournalCommentSection` コンポーネント（配置・ガードのみ変更）
- `BulletList` ユーティリティ（変更なし、または `JournalAccordionBlock` 内に移動）
- 削除確認ダイアログ（変更なし）
- ローディング・エラー状態の表示（変更なし）
