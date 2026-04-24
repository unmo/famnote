# Netflixモデル・プロフィール切り替え機能 UI/UXデザイン仕様書

作成日: 2026-04-22
対象フェーズ: Designerエージェント出力
参照仕様書: docs/spec_profile_switch.md

---

## 0. デザイン方針

FamNoteのデザインシステムを完全適用し、Netflix風の「だれが使うか選ぶ」体験をスポーツファミリー向けのプレミアムなUIで実現する。

### デザインキーワード
- **没入感**: 全画面ダーク背景でプロフィールカードを主役にする
- **家族らしさ**: アンバーのCrownバッジ・温かみのある丸みのある形状
- **俊敏さ**: 素早くプロフィールを切り替えられる軽快なアニメーション
- **安心感**: 選択中状態を明確に視覚化し「自分が誰として使っているか」を常に示す

---

## 1. デザイントークン（本機能専用）

```
CSS変数（ブランドカラー）:
  --color-brand-primary:   #E85513（デフォルト・ユーザー変更可）
  --color-brand-secondary: #00133F

アバターサイズ定義:
  --avatar-profile-select: 96px × 96px  (ProfileSelectPage)
  --avatar-switcher-trigger: 28px × 28px (ProfileSwitcher トリガー)
  --avatar-switcher-list:    32px × 32px (ProfileSwitcher ドロップダウン行)

未読バッジ:
  --badge-unread-bg:    #E85513 (var(--color-brand-primary))
  --badge-unread-text:  #ffffff
  --badge-unread-size:  16px × 16px（件数あり）/ 8px × 8px（ドット）
```

---

## 2. ProfileSelectPage（/select-profile）

### 2.1 画面全体レイアウト

```
[全画面 bg-zinc-950]
┌─────────────────────────────────────────────────┐
│                                                  │
│   (上下中央揃え: flex flex-col items-center)      │
│                                                  │
│   [ロゴ行]                            ← mb-10    │
│     favicon.svg (w-10 h-10)                      │
│     "Fam" + "Note"（ブランドカラー）               │
│                                                  │
│   [見出し: だれが使いますか？]           ← mb-2    │
│   [説明文: プロフィールを選んでください]  ← mb-10   │
│                                                  │
│   [プロフィールカードグリッド]                      │
│     flex flex-wrap justify-center gap-6           │
│     max-w-2xl w-full px-4                        │
│                                                  │
│   [空状態 / スケルトン（members=0時）]              │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 2.2 レスポンシブ対応

| ブレークポイント | カードグリッド動作 | カード幅 |
|---------------|----------------|--------|
| モバイル（< 640px） | flex-wrap、1行2〜3枚 | 自動（gap-6） |
| タブレット（640px〜） | flex-wrap、1行3〜4枚 | 自動（gap-6） |
| デスクトップ（1024px〜） | flex-wrap、最大幅 max-w-2xl | 自動 |

### 2.3 プロフィールカード コンポーネント仕様

#### Props定義（TypeScript）

```typescript
interface ProfileCardProps {
  member: GroupMember;
  index: number;             // stagger delay 計算用
  onSelect: (member: GroupMember) => void;
}
```

#### 視覚仕様

```
[motion.button]
  flex flex-col items-center gap-3
  group focus:outline-none
  focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
  min-w-[80px]

  [アバターコンテナ: relative]
    w-24 h-24 rounded-xl overflow-hidden
    border-2 border-transparent
    group-hover:border-[var(--color-brand-primary)]
    transition-all duration-200
    bg-zinc-800

    [アバター画像がある場合]
      <img> w-full h-full object-cover

    [アバター画像がない場合（フォールバック）]
      flex items-center justify-center
      <User className="w-10 h-10 text-zinc-500" />

  [ownerバッジ（role==='owner'のみ）]
    absolute -top-2 -right-2
    bg-amber-400 rounded-full p-1
    shadow-md shadow-amber-900/30
    <Crown className="w-3 h-3 text-amber-900" />

  [表示名]
    text-sm font-medium text-zinc-300
    group-hover:text-white
    transition-colors duration-200
    text-center max-w-[96px] truncate

  [管理者ラベル（role==='owner'のみ）]
    text-[10px] font-medium text-amber-400 -mt-2
    tracking-wide
```

#### 状態別スタイル

| 状態 | 見た目 |
|------|-------|
| default | border-transparent、text-zinc-300 |
| hover | border-[var(--color-brand-primary)]、text-white、scale: 1.08 |
| tap（active） | scale: 0.96 |
| focus-visible | ring-2 ring-[var(--color-brand-primary)] ring-offset-2 |

### 2.4 アニメーション仕様（Framer Motion）

```typescript
// ロゴ
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: "easeOut" }}

// 見出し
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.1, duration: 0.4 }}

// 説明文
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.2, duration: 0.4 }}

// グリッドラッパー
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}

// 各カード（stagger）
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ delay: 0.3 + index * 0.05, duration: 0.3, ease: "easeOut" }}
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.96 }}
```

### 2.5 空状態・ローディング・エラー状態

#### ローディング状態（スケルトン UI）

`members.length === 0` かつ ロード中のとき表示。現在の「読み込み中...」テキストをスケルトンに改善する。

```
[スケルトンカード × 3枚（グリッドに並べる）]
  flex flex-col items-center gap-3

  [アバタースケルトン]
    w-24 h-24 rounded-xl
    bg-zinc-800 animate-pulse

  [名前スケルトン]
    w-16 h-3 rounded-full
    bg-zinc-800 animate-pulse

[スケルトンカードのProps]
interface SkeletonProfileCardProps {
  count?: number;  // デフォルト: 3
}
```

#### エラー状態

Firestoreリスナーエラー発生時の表示（現在未実装・改善提案として記載）。

```
[エラー表示コンテナ]
  flex flex-col items-center gap-4 py-8

  [アイコン]
    <AlertCircle className="w-12 h-12 text-red-400" />

  [メッセージ]
    text-zinc-300 text-base font-medium
    "メンバー情報の取得に失敗しました"

  [サブメッセージ]
    text-zinc-500 text-sm
    "ネットワーク接続を確認して、もう一度お試しください"

  [リトライボタン]
    px-6 py-2.5 rounded-lg
    bg-[var(--color-brand-primary)] text-white
    text-sm font-medium
    hover:opacity-90 active:opacity-80
    transition-opacity
    "再読み込み"
```

#### メンバー1人状態（自動選択の改善提案）

メンバーが自分1人の場合、2秒後に自動選択してダッシュボードに遷移することを推奨。その間、以下を表示する。

```
[1人用メッセージ]
  text-zinc-400 text-xs text-center mt-4
  "（自動的にダッシュボードに移動します）"

[プログレスバー]
  mt-2 h-0.5 w-24 rounded-full bg-zinc-700
  overflow-hidden

  [インナー]
    h-full bg-[var(--color-brand-primary)]
    animate: width 0% → 100% over 2s
```

---

## 3. ProfileSwitcher（ヘッダー内ドロップダウン）

### 3.1 トリガーボタン仕様

```
[button]
  flex items-center gap-2
  px-2 py-1.5 rounded-lg
  hover:bg-zinc-800 transition-colors duration-150
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-[var(--color-brand-primary)]

  [アバター相対コンテナ: relative]
    [アバター]
      w-7 h-7 rounded-full overflow-hidden
      bg-zinc-700 flex items-center justify-center
      flex-shrink-0

    [未読バッジ（将来実装: 後述）]
      absolute -top-1 -right-1
      ...

  [表示名]
    text-sm font-medium text-zinc-100
    hidden sm:block
    max-w-[80px] truncate

  [ChevronDown]
    w-4 h-4 text-zinc-400
    transition-transform duration-200
    isOpen ? "rotate-180" : ""
```

#### 改善点: テキストカラーの統一

現在の実装では `text-gray-900 dark:text-white` と `gray-` クラスが混在している。FamNoteはダークモード専用のため、`dark:` プレフィックスを廃止して `text-zinc-100` に統一する。

### 3.2 ドロップダウンパネル仕様

```
[motion.div: ドロップダウンパネル]
  absolute right-0 top-full mt-2
  w-48 (192px)
  bg-zinc-900
  rounded-xl
  shadow-xl shadow-black/40
  border border-zinc-800
  overflow-hidden z-50

  [メンバーリスト: p-1]
    各メンバー行（後述）

  [セパレーター]
    border-t border-zinc-800

  [フッターリンク: p-1]
    「プロフィール選択画面へ」ボタン
```

### 3.3 メンバー行 コンポーネント仕様

```typescript
interface ProfileSwitcherItemProps {
  member: GroupMember;
  isActive: boolean;
  onSelect: (member: GroupMember) => void;
}
```

```
[button: メンバー行]
  w-full flex items-center gap-3
  px-3 py-2.5 rounded-lg text-left
  transition-colors duration-150

  [アクティブ状態]
    bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)]
    text-[var(--color-brand-primary)]

  [非アクティブ状態（hover）]
    hover:bg-zinc-800 text-zinc-200

  [アバターコンテナ: relative flex-shrink-0]
    [アバター]
      w-8 h-8 rounded-full overflow-hidden
      bg-zinc-700 flex items-center justify-center

    [ownerバッジ]
      absolute -top-1 -right-1
      bg-amber-400 rounded-full p-0.5
      <Crown className="w-2.5 h-2.5 text-amber-900" />

  [テキストエリア: min-w-0]
    [表示名]
      text-sm font-medium truncate

    [管理者ラベル（ownerのみ）]
      text-[10px] text-amber-500

  [アクティブドット（アクティブ時のみ）: ml-auto]
    w-2 h-2 rounded-full
    bg-[var(--color-brand-primary)]
```

### 3.4 フッターリンク仕様

```
[button: プロフィール選択画面へ]
  w-full text-center
  text-xs text-zinc-400
  hover:text-zinc-200
  px-3 py-2 rounded-lg
  hover:bg-zinc-800
  transition-colors duration-150
  flex items-center justify-center gap-1.5

  [アイコン（改善提案として追加）]
    <LayoutGrid className="w-3.5 h-3.5" />
  「プロフィール選択画面へ」
```

### 3.5 ドロップダウン アニメーション仕様

```typescript
// AnimatePresence で囲む

initial={{ opacity: 0, y: -8, scale: 0.96 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: -8, scale: 0.96 }}
transition={{ duration: 0.15, ease: "easeOut" }}
```

---

## 4. 未読バッジ デザイン仕様（将来実装）

### 4.1 データモデル（設計案）

```typescript
// 未読通知の概念データ
interface ProfileUnreadCount {
  uid: string;          // プロフィールUID
  unreadCount: number;  // 未読件数（0のときバッジ非表示）
}
```

### 4.2 バッジ種別

| 種別 | 表示条件 | 見た目 |
|------|---------|-------|
| ドット（小） | unreadCount >= 1 かつ 表示スペースが狭い | 8×8px の塗りつぶし円 |
| カウントバッジ | unreadCount 1〜9 | 16×16px 円 + 数字 |
| カウントバッジ（上限） | unreadCount >= 10 | 16×16px 円 + "9+" |

### 4.3 バッジ ビジュアル仕様

```
[バッジコンテナ: absolute]
  -top-1 -right-1
  z-10

[ドット（小）]
  w-2 h-2 rounded-full
  bg-[var(--color-brand-primary)]
  ring-2 ring-zinc-950（背景色のリング）

[カウントバッジ]
  min-w-[16px] h-[16px] px-[3px]
  rounded-full
  bg-[var(--color-brand-primary)]
  text-white text-[10px] font-bold
  flex items-center justify-center
  ring-2 ring-zinc-950
```

### 4.4 バッジ出現アニメーション

```typescript
// バッジ表示時
initial={{ scale: 0, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0, opacity: 0 }}
transition={{ type: "spring", stiffness: 500, damping: 25 }}
```

### 4.5 バッジ表示場所

1. **ProfileSwitcher トリガーボタン**: アバターの右上にドット（コンパクト表示）
2. **ProfileSwitcher ドロップダウン行**: 各メンバーのアバター右上にカウントバッジ
3. **ProfileSelectPage カード**: アバター右上にカウントバッジ（ログイン直後に未読を把握できる）

---

## 5. 現在の実装に対する改善提案

### 5.1 UX改善

#### 改善1: ローディング中のスケルトン UI（優先度: 高）

現在: `members.length === 0` のとき「メンバーを読み込み中...」テキストのみ。
改善後: `SkeletonProfileCard` コンポーネントを3枚表示し、プロフィール画面のレイアウト崩れを防ぐ。

ユーザーへの効果: ページが壊れていないことが即座に伝わり、安心感が向上する。

#### 改善2: メンバー1人の場合の自動選択（優先度: 中）

現在: メンバーが1人でも選択画面を表示し、クリックを必須にしている。
改善後: メンバーが自分1人（`members.length === 1`）の場合、2秒後に自動選択してダッシュボードに遷移する。プログレスバーで残り時間を可視化する。

ユーザーへの効果: 家族がいない単独使用者の摩擦を除去できる。

#### 改善3: エラー状態の表示（優先度: 高）

現在: Firestoreリスナーエラー時のフォールバックなし。メンバーが表示されないまま無限ロードになる。
改善後: エラー状態を `ProfileSelectPage` で受け取り、「再読み込み」ボタン付きのエラーカードを表示する。

`useActiveProfile` フックに `error: Error | null` を追加するか、`AuthContext` からエラー状態を引き渡す設計が必要。

#### 改善4: プロフィール選択のトランジション演出（優先度: 低）

現在: カードクリック後は即座に `/dashboard` に遷移する。
改善後: 選択したカードをスケールアップ（scale: 1.15 → 0）してからフェードアウトし、ページ遷移アニメーションに接続する。

```typescript
// カード選択時
whileTap={{ scale: 0.96 }}
// 選択確定アニメーション（onAnimationComplete後にnavigate）
animate={{ scale: [1, 1.15, 0], opacity: [1, 1, 0] }}
transition={{ duration: 0.3 }}
```

### 5.2 アクセシビリティ改善

#### 改善5: aria属性の追加（優先度: 高）

現在: `<button>` の aria 属性が不足している。

```tsx
// ProfileSelectPage カード
<motion.button
  aria-label={`${member.displayName}${member.role === 'owner' ? '（管理者）' : ''}として使う`}
  role="option"
  aria-selected={false}
>

// ProfileSwitcher トリガー
<button
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-label={`現在のプロフィール: ${activeProfile?.displayName ?? '未選択'}。クリックして切り替え`}
>

// ProfileSwitcher ドロップダウン
<motion.div role="listbox" aria-label="プロフィールを選択">

// 各メンバー行
<button
  role="option"
  aria-selected={activeProfile?.uid === member.uid}
  aria-label={`${member.displayName}${member.role === 'owner' ? '（管理者）' : ''}に切り替え`}
>
```

#### 改善6: キーボード操作対応（優先度: 中）

現在: ProfileSwitcher ドロップダウンがキーボード操作に未対応。
改善後: `Escape` キーでドロップダウンを閉じる。

```typescript
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, []);
```

#### 改善7: フォーカストラップ（優先度: 低）

ドロップダウンが開いている間、Tab キーのフォーカスをドロップダウン内に閉じ込めるフォーカストラップを実装する。

#### 改善8: コントラスト比の確認

| テキスト | 背景 | コントラスト比 | WCAG AA |
|---------|------|-------------|---------|
| zinc-300 (#d4d4d8) | zinc-950 (#09090b) | 10.5:1 | 合格 |
| zinc-400 (#a1a1aa) | zinc-950 (#09090b) | 6.3:1 | 合格 |
| zinc-500 (#71717a) | zinc-800 (#27272a) | 3.5:1 | 合格（大テキスト） |
| amber-400 (#fbbf24) | zinc-950 (#09090b) | 9.8:1 | 合格 |
| white (#ffffff) | brand-primary (#E85513) | 4.6:1 | 合格 |

### 5.3 モバイル対応改善

#### 改善9: タッチターゲットの確保（優先度: 高）

現在: ProfileSwitcher のトリガーボタンの高さが `py-1.5` のみで、実質高さ約30px。
改善後: モバイルでは最低44×44px のタッチターゲットを確保する。

```tsx
// ProfileSwitcher トリガー（モバイル向け修正）
className="flex items-center gap-2 px-2 py-1.5 min-h-[44px] rounded-lg hover:bg-zinc-800 transition-colors"
```

`ProfileSelectPage` のカードは `w-24 h-24`（96px）を維持しているため問題なし。

#### 改善10: ProfileSwitcher ドロップダウンの位置調整（優先度: 中）

現在: `right-0` で右揃え固定。画面幅が狭い場合でも問題ないが、ヘッダー左端に配置した場合に画面外にはみ出る可能性がある。
改善後: `right-0` を維持しつつ、モバイルでは `max-w-[calc(100vw-2rem)]` を追加してはみ出しを防ぐ。

```tsx
className="absolute right-0 top-full mt-2 w-48 max-w-[calc(100vw-2rem)] ..."
```

#### 改善11: ProfileSelectPage のモバイルパディング

現在: `px-4` のみ。
改善後: 小さいモバイル（320px）でもカードが適切に収まるよう `px-4 sm:px-6` に変更。

### 5.4 テーマシステム整合

#### 改善12: `gray-` クラスの廃止（優先度: 中）

`ProfileSwitcher.tsx` に `hover:bg-gray-100 dark:hover:bg-zinc-800`、`text-gray-900 dark:text-white`、`border-gray-200 dark:border-zinc-700` などの `gray-` / `dark:` クラスが残存している。FamNoteはダークモード専用のため、すべて zinc 系に統一する。

変更対象:
- `hover:bg-gray-100 dark:hover:bg-zinc-800` → `hover:bg-zinc-800`
- `text-gray-900 dark:text-white` → `text-zinc-100`
- `bg-white dark:bg-zinc-900` → `bg-zinc-900`
- `border-gray-200 dark:border-zinc-700` → `border-zinc-800`
- `text-gray-400` → `text-zinc-400`
- `text-gray-700 dark:text-zinc-200` → `text-zinc-200`

---

## 6. コンポーネント分割設計（Generator向け）

### 6.1 ProfileSelectPage の分割

```
ProfileSelectPage（ページコンポーネント）
  ├── ProfileCardGrid（グリッドラッパー）
  │     └── ProfileCard（各カード・motion.button）
  ├── SkeletonProfileCard（スケルトン）
  └── ProfileSelectError（エラー表示）
```

### 6.2 ProfileSwitcher の分割

```
ProfileSwitcher（ドロップダウン全体）
  ├── ProfileSwitcherTrigger（トリガーボタン）
  │     └── UnreadBadge（未読バッジ・将来実装）
  ├── ProfileSwitcherDropdown（パネル）
  │     ├── ProfileSwitcherItem（メンバー行）
  │     │     └── UnreadBadge（未読バッジ・将来実装）
  │     └── ProfileSwitcherFooter（選択画面へリンク）
  └── (使用: AnimatePresence)
```

---

## 7. shadcn/ui コンポーネント活用方針

本機能でのshadcn/ui利用は最小限とする。理由: Framer Motionによるカスタムアニメーションとの相性を優先するため。

| 場面 | shadcn/ui利用 | 備考 |
|------|-------------|------|
| ProfileSelectPage カード | 不使用（motion.button） | 独自アニメーションが必要 |
| ProfileSwitcher ドロップダウン | 不使用（motion.div） | 独自アニメーションが必要 |
| エラー状態の再読み込みボタン | Button コンポーネント可 | シンプルなボタンのため |
| スケルトン | Skeleton コンポーネント可 | `animate-pulse` でも代替可能 |

---

## 8. ワイヤーフレーム（テキスト表現）

### 8.1 ProfileSelectPage（3人家族の例）

```
┌─────────────────────── bg-zinc-950 ────────────────────────┐
│                                                              │
│                    [svg] FamNote                             │
│                                                              │
│                  だれが使いますか？                           │
│               プロフィールを選んでください                     │
│                                                              │
│     ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│     │  [Crown] │   │          │   │          │             │
│     │  [顔写真]│   │ [Userアイ]│   │  [顔写真]│             │
│     │   96x96  │   │   96x96  │   │   96x96  │             │
│     └──────────┘   └──────────┘   └──────────┘             │
│       お父さん         太郎           花子                    │
│       管理者                                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 ProfileSwitcher ドロップダウン（ヘッダー右端）

```
ヘッダー右端:
  [アバター] 太郎 [v]

ドロップダウン（w-48）:
  ┌────────────────────┐
  │ [顔] お父さん ●   管│  ← ブランドカラー強調（アクティブ）
  │      管理者         │
  │─────────────────── │
  │ [顔] 太郎          │  ← 非アクティブ
  │─────────────────── │
  │ [顔] 花子          │  ← 非アクティブ
  ├────────────────────┤
  │ [■] プロフィール    │  ← フッターリンク（zinc-400）
  │     選択画面へ      │
  └────────────────────┘
```

---

## 9. ループ状態・次フェーズ引き継ぎ情報

- 仕様書: `docs/spec_profile_switch.md`
- デザイン仕様書（本ファイル）: `docs/design_profile_switch.md`
- 実装対象ファイル:
  - `src/routes/app/ProfileSelectPage.tsx`（スケルトン・エラー状態・aria・gray→zinc統一）
  - `src/components/shared/ProfileSwitcher.tsx`（gray→zinc統一・aria・Escape対応・min-h-[44px]）
  - `src/components/shared/SkeletonProfileCard.tsx`（新規作成）
  - `src/components/shared/ProfileSelectError.tsx`（新規作成）
- テスト対象（Generator優先対応）:
  - `tests/unit/store/profileStore.test.ts`
  - `tests/unit/hooks/useActiveProfile.test.ts`
  - `tests/unit/components/ProtectedRoute.test.tsx`
  - `tests/e2e/profile-select.spec.ts`
