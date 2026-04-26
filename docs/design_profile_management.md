# プロフィール管理UX修正 デザイン仕様書

**バージョン:** 1.0
**作成日:** 2026-04-25
**担当エージェント:** Designer
**対応仕様書:** `docs/spec_profile_management.md`
**ステータス:** デザイン確定

---

## 1. デザイントークン

### カラートークン

```
背景（ページ）:        zinc-950   #09090b   bg-zinc-950
カード背景:            zinc-900   #18181b   bg-zinc-900
カードボーダー:        zinc-800   #27272a   border-zinc-800
カードボーダー強調:    zinc-700   #3f3f46   border-zinc-700
テキスト主:            zinc-50    #fafafa   text-zinc-50
テキスト副:            zinc-400   #a1a1aa   text-zinc-400
テキスト補足:          zinc-500   #71717a   text-zinc-500
テキスト無効:          zinc-600   #52525b   text-zinc-600

ブランドプライマリ:    #E85513（CSS変数 var(--color-brand-primary)）
ブランドプライマリホバー: opacity-90
ブランドアウトライン:  border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]

アンバー（オーナーバッジ）: amber-400  #fbbf24
アンバー背景:          amber-400/10

危険（削除）:          red-500    #ef4444   text-red-500
危険背景:              red-500/10
危険ボーダー:          red-500/20

成功:                  green-500  #22c55e
入力フォーカスリング:  ring-[var(--color-brand-primary)]
```

### スペーシングトークン

```
ページ外側パディング:  px-4 py-6
カード内パディング:    p-6
セクション間ギャップ:  space-y-6（SettingsPage 既存に準拠）
カード内セクション間:  space-y-4
アイテム間ギャップ:    space-y-3
アイコン・テキスト間:  gap-2
ボタン・ラベル間:      gap-1.5
フォームフィールド間:  space-y-2
```

### シャドウ・角丸

```
カード:            rounded-2xl（SettingsPage 既存に準拠）
ボタン（通常）:    rounded-lg
ボタン（小）:      rounded-md
入力フィールド:    rounded-lg
バッジ:            rounded-full
削除確認エリア:    rounded-xl
スケルトン:        rounded-xl（アバター）/ rounded-full（テキスト行）
```

### タイポグラフィ

```
カードセクション見出し: text-zinc-50 font-semibold
サブセクション見出し:   text-zinc-300 font-medium text-sm
メンバー名:             text-zinc-50 font-medium text-sm
補足テキスト:           text-zinc-400 text-xs
エラーメッセージ:       text-red-400 text-xs
バリデーション文字数:   text-zinc-500 text-xs text-right
```

---

## 2. SettingsPage プロフィール管理セクション

### 2-1. レイアウト仕様

```
max-w-2xl mx-auto px-4 py-6 （SettingsPage 既存の外枠を使用）

[テーマカードの下に追加]
<motion.div（カード）>
  [カードヘッダー]
    アイコン + セクションタイトル「プロフィール管理」
  
  [自分のプロフィール小見出し]
  [自分のプロフィールカード]
  
  [子プロフィール小見出し（オーナーのみ）]
  [子プロフィールリスト（オーナーのみ）]
  [空状態 or スケルトン（オーナーのみ）]
  [追加フォーム展開エリア（オーナーのみ）]
  [追加ボタン（オーナーのみ・フォーム非表示時）]
</motion.div>
```

### 2-2. カード外枠 Tailwindクラス（SettingsPage 既存テーマカードと完全一致）

```
bg-zinc-900 border border-zinc-800 rounded-2xl p-6
```

### 2-3. カードヘッダー JSX スケッチ

```tsx
<h2 className="text-zinc-50 font-semibold mb-4 flex items-center gap-2">
  <span className="text-lg">👤</span>
  プロフィール管理
</h2>
```

### 2-4. 小見出し JSX スケッチ

```tsx
<h3 className="text-zinc-300 font-medium text-sm mb-3">あなたのプロフィール</h3>
<h3 className="text-zinc-300 font-medium text-sm mb-3 mt-4">メンバー</h3>
```

---

## 3. 自分のプロフィールカード（ProfileEditForm）

### 3-1. 表示状態（編集前）

**レイアウト:**
```
┌─────────────────────────────────────────┐
│  [Avatar md]  山田 太郎          [鉛筆]  │
└─────────────────────────────────────────┘
```

**Tailwindクラス:**
```
外枠: flex items-center justify-between gap-3
      bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3
アバター: Avatar size="md"（w-10 h-10 rounded-full bg-zinc-700）
名前: text-zinc-50 font-medium text-sm flex-1 truncate
鉛筆ボタン: p-2 rounded-md text-zinc-400
           hover:text-zinc-50 hover:bg-zinc-700 transition-colors
           focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]
           min-w-[44px] min-h-[44px] flex items-center justify-center
```

**Props interface:**
```typescript
interface ProfileEditFormProps {
  member: GroupMember;
  isChildProfile: boolean;
  onSave: (displayName: string) => Promise<void>;
  className?: string;
}
```

**Framer Motion（鉛筆ボタン）:**
```
whileHover={{ scale: 1.1 }}
whileTap={{ scale: 0.95 }}
```

### 3-2. 編集状態（インライン展開）

**レイアウト:**
```
┌─────────────────────────────────────────┐
│  [Avatar md]                            │
│  ┌────────────────────────────────────┐ │
│  │ 山田 太郎                    0/20  │ │
│  └────────────────────────────────────┘ │
│  [エラーメッセージ（バリデーション失敗時）] │
│  [キャンセル]              [保存中... ●] │
└─────────────────────────────────────────┘
```

**Tailwindクラス:**
```
外枠: flex flex-col gap-3
      bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3

上部アバター行: flex items-center gap-3
名前ラベル: text-zinc-400 text-xs

入力フィールド（通常）:
  w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2
  text-zinc-50 text-sm
  focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent
  placeholder:text-zinc-500
  transition-all duration-150

入力フィールド（エラー）:
  上記 + border-red-500/50 focus:ring-red-500

文字数カウント: text-zinc-500 text-xs text-right mt-1
エラーテキスト: text-red-400 text-xs mt-1

ボタン行: flex justify-end gap-2 mt-1

キャンセルボタン:
  px-3 py-1.5 rounded-md text-zinc-400 text-sm
  hover:text-zinc-50 hover:bg-zinc-700
  transition-colors min-h-[36px]

保存ボタン（通常）:
  px-4 py-1.5 rounded-md text-white text-sm font-medium
  bg-[var(--color-brand-primary)] hover:opacity-90
  transition-opacity min-h-[36px]

保存ボタン（ローディング）:
  上記 + opacity-70 cursor-not-allowed
  ローディングスピナー: animate-spin w-3.5 h-3.5 mr-1.5

保存ボタン（disabled）:
  上記 + opacity-50 cursor-not-allowed
```

**Framer Motion（編集フォーム展開）:**
```
AnimatePresence mode="wait"

編集フォームコンテナ:
  initial={{ opacity: 0, height: 0, y: -4 }}
  animate={{ opacity: 1, height: 'auto', y: 0 }}
  exit={{ opacity: 0, height: 0, y: -4 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
```

**状態パターン:**
```
default   : アバター + 名前テキスト + 鉛筆アイコンボタン
editing   : アバター + テキストフィールド + 保存/キャンセル
loading   : 保存ボタンにスピナー表示・入力・ボタン無効化
error     : 入力ボーダーが red + エラーテキスト表示
success   : editing → default へ戻る（Sonner toast.success）
```

---

## 4. 子プロフィール一覧（ChildProfileList）

### 4-1. 通常状態（1件）

**レイアウト:**
```
┌─────────────────────────────────────────┐
│  [Avatar sm]  佐藤 花子   [鉛筆] [削除]  │
└─────────────────────────────────────────┘
```

**Tailwindクラス:**
```
リストコンテナ: space-y-2

各アイテム外枠:
  flex items-center gap-3
  bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3
  transition-colors

アバター: Avatar size="sm"（w-8 h-8）

名前: text-zinc-50 text-sm font-medium flex-1 truncate

ボタン群: flex items-center gap-1

鉛筆ボタン:
  p-2 rounded-md text-zinc-400
  hover:text-zinc-50 hover:bg-zinc-700
  transition-colors min-w-[44px] min-h-[44px]
  flex items-center justify-center

削除ボタン（通常）:
  p-2 rounded-md text-zinc-400
  hover:text-red-400 hover:bg-red-500/10
  transition-colors min-w-[44px] min-h-[44px]
  flex items-center justify-center
```

**Props interface:**
```typescript
interface ChildProfileListProps {
  members: GroupMember[];
  onEdit: (member: GroupMember) => void;
  onDelete: (member: GroupMember) => void;
}
```

**Framer Motion（リスト出現）:**
```
リストコンテナ:
  variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
  initial="hidden" animate="visible"

各アイテム:
  variants={{
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } }
  }}

アイテム削除時:
  exit={{ opacity: 0, x: 8, height: 0 }}
  transition={{ duration: 0.2 }}
  （AnimatePresence で囲む）

ボタン:
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
```

### 4-2. 編集状態（インライン展開）

子プロフィールの編集フォームは、セクション3（ProfileEditForm）と同じデザイン仕様を流用する。
アイテムカードをフォームに展開するアニメーションは同様（`height: 0 → 'auto'`）。

### 4-3. 削除確認状態（インライン）

モーダル不使用。削除ボタン押下時にカードをインラインで確認UIに置き換える。

**レイアウト:**
```
┌─────────────────────────────────────────┐
│  本当に「佐藤 花子」を削除しますか？      │
│  [キャンセル]                [削除する]  │
└─────────────────────────────────────────┘
```

**Tailwindクラス:**
```
確認エリア外枠:
  bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3
  flex flex-col gap-3

確認テキスト:
  text-zinc-300 text-sm
  名前部分: font-semibold text-zinc-50

ボタン行: flex justify-end gap-2

キャンセルボタン:
  px-3 py-1.5 rounded-md text-zinc-400 text-sm
  hover:text-zinc-50 hover:bg-zinc-700
  transition-colors min-h-[36px]

削除確認ボタン（通常）:
  px-4 py-1.5 rounded-md text-white text-sm font-medium
  bg-red-500 hover:bg-red-600
  transition-colors min-h-[36px]

削除確認ボタン（ローディング中）:
  上記 + opacity-70 cursor-not-allowed スピナー表示
```

**Framer Motion（確認UI出現）:**
```
initial={{ opacity: 0, scale: 0.97 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.97 }}
transition={{ duration: 0.15 }}
```

### 4-4. スケルトンローディング（ChildProfileListSkeleton）

```
3件分のスケルトンカードを表示
各カード:
  flex items-center gap-3
  bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3

  アバター部: w-8 h-8 rounded-full bg-zinc-700 animate-pulse
  名前部: w-24 h-3 rounded-full bg-zinc-700 animate-pulse
  右端: w-16 h-6 rounded-md bg-zinc-700/50 animate-pulse
```

### 4-5. 空状態（子プロフィールなし）

```
┌─────────────────────────────────────────┐
│                                         │
│   👶                                    │
│   まだ子プロフィールがありません          │
│   追加して家族みんなで使いましょう        │
│                                         │
└─────────────────────────────────────────┘
```

**Tailwindクラス:**
```
外枠:
  flex flex-col items-center gap-2 py-6
  text-center

絵文字: text-3xl

メインテキスト: text-zinc-400 text-sm font-medium

サブテキスト: text-zinc-500 text-xs
```

---

## 5. 子プロフィール追加フォーム（AddChildProfileForm）

### 5-1. 追加ボタン（フォーム未表示時）

```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│  + プロフィールを追加                     │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

**Tailwindクラス:**
```
追加ボタン:
  w-full flex items-center justify-center gap-2 mt-3
  px-4 py-2.5 rounded-lg
  border border-dashed border-[var(--color-brand-primary)]/50
  text-[var(--color-brand-primary)] text-sm font-medium
  hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/5
  transition-all duration-200
  min-h-[44px]

PlusCircleアイコン: w-4 h-4
```

**Framer Motion（追加ボタン）:**
```
whileHover={{ scale: 1.01 }}
whileTap={{ scale: 0.99 }}
```

### 5-2. フォーム展開状態

**レイアウト:**
```
┌─────────────────────────────────────────┐
│  新しいメンバーを追加                    │
│  ┌────────────────────────────────────┐ │
│  │ 例: 太郎                    0/20  │ │
│  └────────────────────────────────────┘ │
│  [エラーメッセージ]                      │
│  [キャンセル]              [追加する ●]  │
└─────────────────────────────────────────┘
```

**Tailwindクラス:**
```
フォーム外枠:
  bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-4 mt-3
  space-y-3

見出し: text-zinc-300 text-sm font-medium

入力フィールド: （セクション3と同じクラス）

文字数カウント・エラーテキスト: （セクション3と同じクラス）

ボタン行: （セクション3と同じクラス）

追加ボタンラベル（通常）: 「追加する」
追加ボタンラベル（ローディング）: スピナー + 「追加中...」
```

**Framer Motion（フォームスライドイン）:**
```
AnimatePresence

フォームコンテナ:
  initial={{ opacity: 0, height: 0, marginTop: 0 }}
  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
  exit={{ opacity: 0, height: 0, marginTop: 0 }}
  transition={{ duration: 0.25, ease: 'easeOut' }}
```

**Props interface:**
```typescript
interface AddChildProfileFormProps {
  onAdd: (displayName: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  maxMembers?: number;
  currentMemberCount?: number;
}
```

### 5-3. グループ上限到達時の状態

追加ボタンを disabled 表示に変更し、ツールチップ代わりにボタン下にテキストを追加する。

```
[+ プロフィールを追加]（disabled: opacity-40 cursor-not-allowed）
メンバーは最大10名までです
（text-zinc-500 text-xs text-center mt-1）
```

---

## 6. ProfileSelectPage の編集ボタン追加

### 6-1. カードオーバーレイ（オーナーのみ）

既存のプロフィールカード（`w-24 h-24 rounded-xl`）の右上に鉛筆アイコンボタンを追加する。

**レイアウト（アバターラッパー内）:**
```
<div className="relative">
  [既存アバター画像/イニシャル表示]
  [オーナーバッジ（既存）]
  
  {isOwner && (
    <button 編集ボタン>
      <PencilIcon />
    </button>
  )}
</div>
```

**Tailwindクラス（編集ボタン）:**
```
absolute bottom-1 right-1
w-7 h-7 rounded-full
bg-zinc-900/90 backdrop-blur-sm
border border-zinc-700
flex items-center justify-center
text-zinc-300
hover:text-white hover:border-[var(--color-brand-primary)]
hover:bg-zinc-800
transition-all
opacity-0 group-hover:opacity-100
（モバイル: opacity-100 常時表示）
focus-visible:opacity-100
focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]
z-10
```

**Framer Motion（編集ボタン出現）:**
```
whileHover={{ scale: 1.1 }}
whileTap={{ scale: 0.9 }}
```

モバイルでは `opacity-100` を常時適用し、デスクトップでは `group-hover:opacity-100` で表示する。
Tailwind での記述: `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`

### 6-2. インライン編集フォーム（ProfileSelectPage）

プロフィール選択画面での名前編集は、カード下部にインライン展開する形式を採用する。
（SettingsPage への遷移なしで完結）

**展開レイアウト:**
```
[アバター画像]  ← 変わらず
[テキストフィールド]  ← 名前テキストをフィールドに置換
[保存] [キャンセル]
```

**Tailwindクラス:**
```
フォームラッパー:
  flex flex-col items-center gap-2 w-[96px]

入力フィールド:
  w-full text-center bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1
  text-zinc-50 text-xs
  focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]
  placeholder:text-zinc-500

ボタン行: flex gap-1.5

各ボタン: p-1.5 rounded-md text-xs min-h-[32px]
キャンセル: text-zinc-400 hover:bg-zinc-800
保存: bg-[var(--color-brand-primary)] text-white hover:opacity-90
```

**Framer Motion（フォーム展開）:**
```
initial={{ opacity: 0, y: 4 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 4 }}
transition={{ duration: 0.15 }}
```

---

## 7. アニメーション仕様まとめ

### 使用パターン一覧

| 要素 | アニメーション | duration | ease |
|------|--------------|----------|------|
| SettingsPage プロフィール管理カード出現 | opacity: 0→1, y: 10→0 | 0.3s | easeOut |
| 編集フォーム展開 | opacity: 0→1, height: 0→auto, y: -4→0 | 0.2s | easeOut |
| 編集フォーム収縮 | opacity: 1→0, height: auto→0 | 0.2s | easeOut |
| 子プロフィール追加フォームスライドイン | opacity: 0→1, height: 0→auto | 0.25s | easeOut |
| 子プロフィールリストアイテム出現（stagger） | opacity: 0→1, x: -8→0 | 0.2s/item | デフォルト |
| アイテム削除（exit） | opacity: 1→0, x: 0→8, height: auto→0 | 0.2s | デフォルト |
| 削除確認UI出現 | opacity: 0→1, scale: 0.97→1 | 0.15s | デフォルト |
| ボタンホバー | scale: 1→1.02〜1.1 | — | spring |
| ボタンタップ | scale: 1→0.95〜0.98 | — | spring |

### AnimatePresence の使用箇所

```
1. 編集フォーム（ProfileEditForm の editing state）
2. 子プロフィール追加フォーム（AddChildProfileForm）
3. 削除確認UI（ChildProfileList の confirmDelete state）
4. 子プロフィールリストの各アイテム（削除時のexit）
5. ProfileSelectPage のインライン編集フォーム
```

---

## 8. エラー・ローディング・空状態デザイン

### 8-1. ローディングスピナー仕様

```tsx
// 保存ボタン内インラインスピナー
<svg
  className="animate-spin w-3.5 h-3.5 mr-1.5 text-white"
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  aria-hidden="true"
>
  <circle
    className="opacity-25"
    cx="12" cy="12" r="10"
    stroke="currentColor" strokeWidth="4"
  />
  <path
    className="opacity-75"
    fill="currentColor"
    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
  />
</svg>
```

### 8-2. Sonner トースト通知仕様

```
成功（名前変更）:  toast.success('プロフィールを更新しました')
成功（追加）:      toast.success('メンバーを追加しました')
成功（削除）:      toast.success('メンバーを削除しました')
エラー（保存）:    toast.error('保存に失敗しました。もう一度お試しください')
エラー（削除）:    toast.error('削除に失敗しました。もう一度お試しください')
エラー（上限）:    toast.error('メンバーは最大10名までです')

表示位置: bottom-center（Sonner デフォルト）
duration: 3000ms（デフォルト）
```

### 8-3. バリデーションエラー表示

```tsx
{/* フォームフィールド直下 */}
{error && (
  <p className="text-red-400 text-xs mt-1" role="alert">
    {error}
  </p>
)}
```

バリデーション対象:
- 空文字（フォームsubmit時）: 「名前は必須です」
- 20文字超（リアルタイム or submit時）: 「名前は20文字以内で入力してください」
- 先頭・末尾空白のみ（trim後に空文字）: 「名前は必須です」

---

## 9. アクセシビリティ仕様

### フォーカスリング

すべてのインタラクティブ要素に統一のフォーカスリングを適用する。

```
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-[var(--color-brand-primary)]
focus-visible:ring-offset-2
focus-visible:ring-offset-zinc-900（カード内）
focus-visible:ring-offset-zinc-950（カード外）
```

### タッチターゲット（モバイル）

```
最小サイズ: 44 × 44px
適用要素:
  - 鉛筆ボタン: min-w-[44px] min-h-[44px]
  - 削除ボタン: min-w-[44px] min-h-[44px]
  - 保存/キャンセルボタン: min-h-[36px] px-3以上
  - ProfileSelectPage 編集ボタン: w-7 h-7（例外: オーバーレイで許容）
```

### aria 属性

```tsx
// 鉛筆ボタン
aria-label={`${member.displayName}の名前を編集`}
aria-expanded={isEditing}

// 削除ボタン
aria-label={`${member.displayName}を削除`}

// 削除確認エリア
role="region"
aria-label="削除確認"

// ローディングボタン
aria-busy={isLoading}
aria-disabled={isLoading}

// エラーメッセージ
role="alert"
aria-live="polite"

// フォーム文字数カウント
aria-label="文字数"

// スケルトンローディング
aria-busy="true"
aria-label="読み込み中"
```

### コントラスト比（WCAG AA準拠確認）

```
テキスト主（zinc-50 on zinc-900）:    約 15:1  ✓ AAA
テキスト副（zinc-400 on zinc-900）:   約 5.5:1 ✓ AA
エラー（red-400 on zinc-900）:         約 4.8:1 ✓ AA
ブランドプライマリ（#E85513 on zinc-900）: 約 4.6:1 ✓ AA（大テキスト）
アンバー（amber-400 on zinc-900）:    約 7.8:1 ✓ AAA
```

---

## 10. コンポーネント Props 定義まとめ

```typescript
// ProfileManagementSection（SettingsPage に追加するセクション全体）
interface ProfileManagementSectionProps {
  // propsなし。内部でuseAuthStore / useGroupStoreから取得する
}

// ProfileEditForm（自分のプロフィール・子プロフィール共用）
interface ProfileEditFormProps {
  member: GroupMember;
  isChildProfile: boolean;
  onSave: (displayName: string) => Promise<void>;
  className?: string;
}

// ChildProfileList（子プロフィール一覧）
interface ChildProfileListProps {
  members: GroupMember[];
  isLoading: boolean;
  onEdit: (member: GroupMember, newName: string) => Promise<void>;
  onDelete: (memberUid: string) => Promise<void>;
}

// ChildProfileCard（ChildProfileList の各行）
interface ChildProfileCardProps {
  member: GroupMember;
  onEdit: (member: GroupMember, newName: string) => Promise<void>;
  onDelete: (memberUid: string) => Promise<void>;
}

// AddChildProfileForm（子プロフィール追加フォーム）
interface AddChildProfileFormProps {
  onAdd: (displayName: string) => Promise<void>;
  isAtMemberLimit: boolean;
  maxMembers: number;
}

// ProfileSelectEditButton（ProfileSelectPage のカードオーバーレイ）
interface ProfileSelectEditButtonProps {
  member: GroupMember;
  onSave: (displayName: string) => Promise<void>;
}
```

---

## 11. ファイル構成と対応コンポーネント

```
src/components/settings/
  ProfileManagementSection.tsx  ← セクション全体の親コンポーネント
  ProfileEditForm.tsx           ← インライン名前編集フォーム（自分・子供共用）
  ChildProfileList.tsx          ← 子プロフィール一覧 + スケルトン + 空状態
  AddChildProfileForm.tsx       ← アコーディオン追加フォーム
```

### ProfileManagementSection の全体 JSX スケッチ

```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
>
  {/* カードヘッダー */}
  <h2 className="text-zinc-50 font-semibold mb-4 flex items-center gap-2">
    <span className="text-lg">👤</span>
    プロフィール管理
  </h2>

  {/* 自分のプロフィール */}
  <h3 className="text-zinc-300 font-medium text-sm mb-3">
    あなたのプロフィール
  </h3>
  <ProfileEditForm
    member={selfMember}
    isChildProfile={false}
    onSave={handleSaveSelf}
  />

  {/* 子プロフィール（オーナーのみ） */}
  {isOwner && (
    <>
      <h3 className="text-zinc-300 font-medium text-sm mb-3 mt-5">
        メンバー
      </h3>
      <ChildProfileList
        members={childMembers}
        isLoading={isLoadingMembers}
        onEdit={handleEditChild}
        onDelete={handleDeleteChild}
      />
      <AddChildProfileForm
        onAdd={handleAddChild}
        isAtMemberLimit={memberCount >= 10}
        maxMembers={10}
      />
    </>
  )}
</motion.div>
```

---

## 12. モバイル対応仕様

### ブレークポイント対応

```
モバイル（< 640px）:
  - 全コンテンツ: max-w-full px-4
  - ProfileSelectPage 編集ボタン: opacity-100 常時表示
  - 保存/キャンセルボタン: 横並び（flex-row）
  - 子プロフィールリスト: 縦スクロール 1列

タブレット以上（≥ 640px）:
  - 全コンテンツ: max-w-2xl mx-auto
  - ProfileSelectPage 編集ボタン: group-hover で表示
  - 子プロフィールリスト: 縦スクロール 1列（変わらず）
```

### スクロール対応

子プロフィールが5件以上の場合:
```
max-h-[320px] overflow-y-auto
scroll-smooth
pr-1（スクロールバー分の余白）
```

スクロールバーのスタイリング（Tailwind v4対応）:
```css
scrollbar-width: thin;
scrollbar-color: theme('colors.zinc.700') transparent;
```

---

## 13. ループ状態・引き継ぎ情報

本デザイン仕様書は以下のGeneratorへの入力として使用する。

**仕様書パス:** `docs/spec_profile_management.md`
**デザイン仕様書パス:** `docs/design_profile_management.md`
**次フェーズ:** generator
**実装対象ファイル:** 仕様書セクション8「変更対象ファイル」参照

### Generatorへの特記事項

1. `ProfileEditForm` と `AddChildProfileForm` の入力フィールドは ref で autoFocus を実装すること（編集開始時に自動フォーカス）。
2. `ChildProfileList` の各 `ChildProfileCard` は `AnimatePresence` 内に置き、削除アニメーションを実装すること。
3. `ProfileSelectPage` の編集ボタンは既存の `motion.button` の `onClick` を妨げないよう `e.stopPropagation()` を必ず呼ぶこと。
4. Sonner の `toast.promise` を使った非同期保存フィードバックも検討すること。
5. SettingsPage の `motion.div` の delay は既存テーマカードが `delay: 0` のため、プロフィール管理カードは `delay: 0.1` を追加すること。
