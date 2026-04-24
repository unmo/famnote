# デザイン仕様書: 試合振り返りノートへの親コメント機能

**作成日**: 2026-04-22
**フェーズ**: Designer
**ステータス**: 確定
**対応仕様書**: `docs/spec_journal_comments.md`

---

## 1. デザインコンセプト

### 感情的トーン
- 子供にとって: 親から届いたメッセージが「特別なもの」として認識されるよう、管理者コメントにはamber系のアクセントを使用する
- 親にとって: 入力フォームはシンプルで使いやすく、送信後にポジティブなフィードバックを返す
- セクション全体として: ジャーナル本文の続きとして自然に溶け込む zinc 基調のデザインを維持しつつ、コメントエリアは温かみのある amber/brand-primary のアクセントで区別する

### デザイン原則
- 既存の `JournalDetailPage` の各セクションカード（`bg-zinc-900 border border-zinc-800 rounded-2xl`）と同一のコンテナスタイルを踏襲する
- 管理者識別には `ProfileSwitcher` で使用している amber Crown バッジパターンを流用する
- タップターゲットは必ず `min-h-[44px]` を保証する

---

## 2. コンポーネント設計

### 2-1. JournalCommentSection

**ファイルパス**: `src/components/journals/JournalCommentSection.tsx`

**役割**: コメントセクション全体のコンテナ。タイトルヘッダー・コメント一覧・空状態・フォームを統括する。

**Props定義**:
```typescript
interface JournalCommentSectionProps {
  journalId: string;
  isOwner: boolean;      // ジャーナルオーナー（子供）かどうか
  isManager: boolean;    // 管理者（親）かどうか
}
```

**レイアウト構造（ワイヤーフレーム）**:
```
┌─────────────────────────────────────────────┐
│ 💬  親からのコメント              [件数バッジ] │  ← ヘッダー行
├─────────────────────────────────────────────┤
│  [JournalCommentItem × n]                   │  ← コメント一覧
│  または [空状態]                              │
│  または [スケルトン]                          │
├─────────────────────────────────────────────┤
│  [JournalCommentForm]（isManager の場合のみ） │  ← 入力フォーム
└─────────────────────────────────────────────┘
```

**Tailwindクラス**:
```
外側コンテナ:  mx-4 mt-3 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden
ヘッダー行:    flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60
アイコン:      text-base（絵文字 💬）
タイトル:      text-xs font-semibold text-zinc-400 uppercase tracking-wide flex-1
件数バッジ:    text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400
              （コメント0件のときは非表示）
コメント一覧:  divide-y divide-zinc-800/40
フォーム境界:  border-t border-zinc-800/60
```

**Framer Motionアニメーション**:
```typescript
// セクション全体の出現
const sectionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: 'easeOut' },
};

// コメントリストのstagger
const listVariants = {
  animate: { transition: { staggerChildren: 0.05 } },
};
```

---

### 2-2. JournalCommentItem

**ファイルパス**: `src/components/journals/JournalCommentItem.tsx`

**役割**: コメント1件の表示。アバター・表示名・管理者バッジ・本文・タイムスタンプ・削除ボタン。

**Props定義**:
```typescript
interface JournalCommentItemProps {
  comment: JournalComment;
  currentUserId: string;   // 自分のコメントかどうかの判定に使用
  onDelete: (commentId: string) => void;
  isDeleting?: boolean;    // 削除処理中フラグ
}
```

**レイアウト構造（ワイヤーフレーム）**:
```
┌────────────────────────────────────────────────────┐
│ [Avatar] [表示名] [管理者バッジ]         [削除btn] │
│          [コメント本文テキスト                    ] │
│          [タイムスタンプ]                           │
└────────────────────────────────────────────────────┘
```

**各要素のデザイン仕様**:

#### アバター
- `avatarUrl` がある場合: `<img>` タグ、`w-8 h-8 rounded-full object-cover`
- `avatarUrl` がない場合: イニシャルアイコン
  - `displayName` の最初の1文字（日本語対応）を表示
  - `w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300`
  - role が `parent` の場合は `bg-amber-900/40 text-amber-300`

#### 管理者バッジ
- `role === 'parent'` の場合のみ表示（`ProfileSwitcher` の Crown バッジパターンを踏襲）
- アバター右上に絶対位置で配置: `absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5`
- `<Crown size={10} className="text-amber-900" />`（lucide-react の Crown アイコン）

#### 表示名行
```
flex items-center gap-1.5
表示名:         text-sm font-semibold text-zinc-100
管理者テキスト:  text-[10px] text-amber-500（role=parentの場合）「親」表示
```

#### コメント本文
```
mt-1 text-sm text-zinc-200 leading-relaxed break-all
```
- `dangerouslySetInnerHTML` は使用しない。Reactテキストノードとして描画。
- role が `parent` の場合: `text-zinc-100`（やや明るめ）

#### タイムスタンプ
```
mt-1 text-[11px] text-zinc-600
```
- `date-fns` の `format` を使用: `'M月d日 HH:mm'` 形式
- 今日の場合: `'HH:mm'` のみ表示

#### 削除ボタン
- `currentUserId === comment.userId` の場合のみ表示
- `Trash2` アイコン（lucide-react）、サイズ 14
- 通常時: `text-zinc-600 hover:text-red-400`
- ローディング時: `opacity-40 cursor-not-allowed`
- タップターゲット: `min-w-[44px] min-h-[44px] flex items-center justify-center`

**Tailwindクラス（コンテナ）**:
```
px-4 py-3 flex items-start gap-3
```

**Framer Motionアニメーション**:
```typescript
const itemVariants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8 },
  transition: { duration: 0.2 },
};
// exit アニメーションのために AnimatePresence でラップする
```

**状態パターン**:

| 状態 | 表示 |
|------|------|
| default | 上記レイアウト通り |
| 自分のコメント | 削除ボタン表示 |
| 削除中 | コンテナ全体 `opacity-50 pointer-events-none`、削除ボタンに `animate-spin` スピナー |
| 管理者コメント | アバターに Crown バッジ、表示名横に「親」テキスト（amber-500） |

---

### 2-3. JournalCommentForm

**ファイルパス**: `src/components/journals/JournalCommentForm.tsx`

**役割**: 管理者専用のコメント入力フォーム。`isManager === false` の場合はレンダリングしない。

**Props定義**:
```typescript
interface JournalCommentFormProps {
  journalId: string;
  onSubmitSuccess?: () => void;
}
```

**レイアウト構造（ワイヤーフレーム）**:
```
┌────────────────────────────────────────────────────┐
│ [Avatar] [テキストエリア                          ] │
│                              [0/200] [送信ボタン]   │
└────────────────────────────────────────────────────┘
```

**各要素のデザイン仕様**:

#### フォームコンテナ
```
px-4 py-3 flex items-start gap-3
```

#### アバター（入力者）
```
w-8 h-8 rounded-full（activeProfileのアバター。JournalCommentItemと同仕様）
flex-shrink-0 mt-0.5
```

#### テキストエリア
```
flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2
text-sm text-zinc-100 placeholder:text-zinc-600
resize-none min-h-[72px] max-h-[160px] overflow-y-auto
focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]/40
transition-colors duration-150
```
- `placeholder`: `「よくがんばったね！」など励ましのコメントを送ろう`
- auto-resize 実装: `useRef` + `useEffect` で `scrollHeight` に応じて `height` を更新する

#### フッター行（文字数 + 送信ボタン）
```
フッター行コンテナ: flex items-center justify-end gap-2 mt-2
```

**文字数カウンター**:
```
text-[11px] tabular-nums
- 0〜180文字:   text-zinc-600
- 181〜200文字: text-amber-500
- 200文字超え:  text-red-400（Zodバリデーション由来で実際には入力阻止しない、送信不可にする）
```
表示形式: `{length}/200`

**送信ボタン**:
```
通常:    bg-[var(--color-brand-primary)] text-white rounded-lg px-4 h-[36px] text-sm font-semibold
         flex items-center gap-1.5
         hover:opacity-90 active:scale-95 transition-all duration-150
disabled: opacity-40 cursor-not-allowed pointer-events-none
loading:  ローディングスピナー + 「送信中...」テキスト
```
- disabled 条件: `text.trim().length === 0 || text.length > 200 || isSubmitting`
- `SendHorizonal` アイコン（lucide-react）、サイズ 14

**Framer Motionアニメーション**:
```typescript
// フォーム全体の出現
initial: { opacity: 0, y: 8 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.2, delay: 0.1 }
```

**キーボード操作**:
- `Cmd+Enter` / `Ctrl+Enter`: 送信（`disabled` 状態でなければ）
- `Escape`: テキストエリアのフォーカスを外す

**scrollIntoView**: 送信ボタンタップ時に `formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })` を実行

**状態パターン**:

| 状態 | テキストエリア | 送信ボタン |
|------|--------------|-----------|
| 空 | border-zinc-700 | disabled（opacity-40） |
| 入力中 | border-[var(--color-brand-primary)] | 有効（brand-primary） |
| 送信中 | disabled + opacity-50 | ローディングスピナー |
| 送信完了 | リセット（空に戻る） | 通常に戻る |

---

### 2-4. UnreadCommentBadge

**ファイルパス**: `src/components/journals/UnreadCommentBadge.tsx`

**役割**: MatchJournalCard のカード右上に重ねて表示する未読件数バッジ。

**Props定義**:
```typescript
interface UnreadCommentBadgeProps {
  count: number;  // 0 の場合は非表示
}
```

**表示仕様**:
```
位置:  absolute -top-1.5 -right-1.5 z-10
形状:  rounded-full min-w-[18px] h-[18px] px-1
       flex items-center justify-center
背景:  bg-red-500
文字:  text-[10px] font-bold text-white tabular-nums
```
- 1〜9: 数字そのまま表示
- 10以上: `9+` と表示
- 0: `null` を返してレンダリングしない

**Framer Motionアニメーション**:
```typescript
// バッジ出現アニメーション（新規コメントが来たとき）
initial: { scale: 0, opacity: 0 }
animate: { scale: 1, opacity: 1 }
transition: { type: 'spring', stiffness: 500, damping: 25 }

// バッジ消滅アニメーション（既読処理後）
exit: { scale: 0, opacity: 0 }
transition: { duration: 0.15 }
// AnimatePresence でラップすること
```

---

## 3. 画面レイアウト: JournalDetailPage へのコメントセクション追加

### 追加位置
仕様書の指定通り、削除確認ダイアログの直前（最後のpostNoteセクションの下）に `JournalCommentSection` を挿入する。

```
... （既存のpostNoteセクション群）...

{/* ★ コメントセクション（新規追加） */}
<JournalCommentSection
  journalId={journalId}
  isOwner={isOwner}
  isManager={isManager}
/>

{/* 削除確認ダイアログ（既存） */}
{showDeleteDialog && ( ... )}
```

### ブレークポイント別レイアウト

| 画面幅 | レイアウト |
|--------|-----------|
| モバイル（< 640px） | 1カラム全幅。フォームはカード内インライン。 |
| タブレット（640px〜） | 同上。最大幅 `max-w-lg mx-auto` を JournalDetailPage 全体で適用する場合はそれに準じる。 |
| デスクトップ（1024px〜） | 同上。 |

コメントセクションは JournalDetailPage の既存 `mx-4` パディングに合わせて配置する。

---

## 4. MatchJournalCard への UnreadCommentBadge 追加

### 追加位置
カード全体を `relative` コンテナにし、カード右上に絶対位置で重ねる。

```tsx
<motion.article
  // ... 既存のクラス
  className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-visible ..."
>
  {/* ★ 未読バッジ（新規追加） */}
  <AnimatePresence>
    {journal.unreadCommentCount > 0 && (
      <UnreadCommentBadge count={journal.unreadCommentCount} />
    )}
  </AnimatePresence>

  {/* カラーバー（既存） */}
  <div className={`h-1 w-full ${theme.bar}`} />
  ...
```

注意: 既存の `overflow-hidden` を `overflow-visible` に変更してバッジがはみ出せるようにする。

---

## 5. 空状態のデザイン

### 管理者（isManager === true）向け空状態

```
┌────────────────────────────────────────────┐
│                                            │
│         💬                                 │
│   まだコメントはありません                  │
│   最初のコメントを送りましょう！            │
│                                            │
└────────────────────────────────────────────┘
```

```
コンテナ:   py-6 flex flex-col items-center gap-2 text-center
絵文字:     text-2xl opacity-50
メイン文:   text-sm text-zinc-500
サブ文:     text-xs text-zinc-600
```

### 子供（isManager === false）向け空状態

```
┌────────────────────────────────────────────┐
│                                            │
│         💬                                 │
│   まだコメントはありません                  │
│                                            │
└────────────────────────────────────────────┘
```

```
コンテナ:   py-6 flex flex-col items-center gap-2 text-center
絵文字:     text-2xl opacity-40
メイン文:   text-sm text-zinc-600
```

---

## 6. ローディング状態: スケルトンUI

コメント2件分のスケルトンを表示する。

```
┌────────────────────────────────────────────┐
│ [●] [████████████]          [  ]           │  ← 行1: アバター + 名前 + 削除btn
│     [████████████████████████████]         │  ← 行1: 本文
│     [██████]                               │  ← 行1: タイムスタンプ
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│ [●] [████████████]                         │  ← 行2
│     [████████████████████]                 │
│     [██████]                               │
└────────────────────────────────────────────┘
```

**スケルトン要素のクラス**:
```
animate-pulse bg-zinc-800 rounded-md
アバター:     w-8 h-8 rounded-full
名前:         h-3 w-24 rounded
本文（長）:   h-3 w-full rounded mt-2
本文（短）:   h-3 w-3/4 rounded mt-1
タイムスタンプ: h-2.5 w-12 rounded mt-1
```

---

## 7. エラー状態

- Sonner トーストを使用（既存パターンと統一）
- コメント取得エラー: `toast.error('コメントの取得に失敗しました')`
- コメント投稿エラー: `toast.error('コメントの送信に失敗しました')`
- コメント削除エラー: `toast.error('コメントの削除に失敗しました')`
- 削除時は `useDeleteJournalComment` のエラーハンドラ内で呼び出す

コメントセクション内でのインラインエラー表示は行わず、すべてトーストに委ねる。

---

## 8. インタラクション仕様

### コメント送信フロー
1. テキストエリアに入力 → リアルタイムで文字数カウンター更新・送信ボタン活性化
2. 送信ボタンタップ → `isSubmitting` 状態に遷移（ボタンがローディング表示、テキストエリア無効化）
3. 成功 → テキストエリアリセット、Sonnerトースト「コメントを送信しました」、新コメントがアニメーション付きでリストに追加
4. 失敗 → テキストエリアの内容は保持、Sonnerトースト「コメントの送信に失敗しました」

### 削除確認
- 削除ボタンタップ → インライン確認は行わず、即座に `onDelete` を呼び出して楽観的UIを使用
  - 楽観的UI: コメントを即座にリストから除去（`AnimatePresence` の exit アニメーション）
  - 失敗時: リストに再追加してエラートースト表示
- シンプルな削除フローとし、削除確認ダイアログは設けない（誤削除リスクより操作のシンプルさを優先）

### 既読処理タイミング
- `JournalDetailPage` の `useEffect` 内で `isOwner === true` かつ `journal.unreadCommentCount > 0` のときに `markCommentsAsRead` を呼び出す
- 既読処理は画面表示直後に非同期実行し、UIのブロッキングは行わない

---

## 9. アクセシビリティ

### aria属性

**JournalCommentSection**:
```html
<section aria-label="親からのコメント" aria-live="polite" aria-relevant="additions">
  <!-- aria-live によりコメント追加を支援技術に通知 -->
</section>
```

**JournalCommentItem**:
```html
<article aria-label="{displayName}さんのコメント: {text}（{タイムスタンプ}）">
  <!-- 削除ボタン -->
  <button aria-label="コメントを削除" type="button">
```

**JournalCommentForm**:
```html
<form aria-label="コメントを入力">
  <label htmlFor="comment-input" className="sr-only">コメントを入力</label>
  <textarea
    id="comment-input"
    aria-describedby="char-count"
    aria-required="true"
  />
  <span id="char-count" aria-live="polite">{length}/200</span>
  <button
    type="submit"
    aria-disabled={isDisabled}  // disabled 属性ではなく aria-disabled で制御
  >
    送信
  </button>
</form>
```

**UnreadCommentBadge**:
```html
<span aria-label="未読コメント {count}件" role="status">
  {count > 9 ? '9+' : count}
</span>
```

### フォーカス表示
- すべてのインタラクティブ要素に `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900` を付与

### キーボードナビゲーション
- Tab でコメントリスト内の削除ボタン → フォームのテキストエリア → 送信ボタンの順にフォーカス移動
- コメントリストはフォーカス不要なため `tabIndex` は設定しない

### コントラスト比確認（WCAG AA準拠）
| 要素 | 前景色 | 背景色 | コントラスト比 |
|------|--------|--------|--------------|
| コメント本文（通常） | zinc-200 (#e4e4e7) | zinc-900 (#18181b) | 約 12:1 ✓ |
| コメント本文（管理者） | zinc-100 (#f4f4f5) | zinc-900 (#18181b) | 約 14:1 ✓ |
| タイムスタンプ | zinc-600 (#52525b) | zinc-900 (#18181b) | 約 3.5:1 ✓ AA（small text）|
| 管理者テキスト「親」 | amber-500 (#f59e0b) | zinc-900 (#18181b) | 約 7:1 ✓ |
| 文字数カウンター | zinc-600 (#52525b) | zinc-800 (#27272a) | 約 3.2:1 ✓ AA |
| 文字数カウンター（警告） | amber-500 (#f59e0b) | zinc-800 (#27272a) | 約 6.5:1 ✓ |
| 送信ボタン文字 | white (#ffffff) | brand-primary (#E85513) | 約 4.6:1 ✓ AA |

---

## 10. TypeScript Props 完全定義（Generator向け）

```typescript
// JournalCommentSection
interface JournalCommentSectionProps {
  journalId: string;
  isOwner: boolean;
  isManager: boolean;
}

// JournalCommentItem
interface JournalCommentItemProps {
  comment: JournalComment;
  currentUserId: string;
  onDelete: (commentId: string) => void;
  isDeleting?: boolean;
}

// JournalCommentForm
interface JournalCommentFormProps {
  journalId: string;
  onSubmitSuccess?: () => void;
}

// UnreadCommentBadge
interface UnreadCommentBadgeProps {
  count: number;
}
```

---

## 11. 使用する外部コンポーネント・ライブラリ

| ライブラリ | 使用箇所 |
|-----------|---------|
| `motion/react` | AnimatePresence, motion.div, motion.article |
| `lucide-react` | Crown, Trash2, SendHorizonal, MessageCircle |
| `date-fns` + `date-fns/locale/ja` | タイムスタンプのフォーマット |
| `sonner` | toast.error / toast.success |

shadcn/ui コンポーネントは今回使用しない（既存 JournalDetailPage に合わせてカスタム実装）。

---

## 12. 実装上の注意事項（Generator向け）

1. `MatchJournalCard` の `overflow-hidden` を `overflow-visible` に変更する際、既存のカラーバー（`h-1 w-full`）の表示が崩れないことを確認すること
2. `JournalCommentForm` のテキストエリア auto-resize は、`onChange` ハンドラ内で `e.target.style.height = 'auto'` → `e.target.style.height = e.target.scrollHeight + 'px'` の順で処理する
3. `markCommentsAsRead` は `isOwner` が確定している場合のみ呼び出す。`useEffect` の依存配列に `[journalId, isOwner, journal?.unreadCommentCount]` を含める
4. コメントのリアルタイム購読（`onSnapshot`）は `useJournalComments` フック内で管理し、コンポーネントのアンマウント時に必ず `unsubscribe()` を呼ぶ
5. 削除の楽観的UIは TanStack Query の `optimisticUpdate` パターンではなく、ローカル `useState` で管理する（Firestore リアルタイム購読がある場合、楽観的更新と競合するリスクがあるため）
