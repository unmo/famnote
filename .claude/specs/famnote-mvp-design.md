# FamNote MVP UI/UXデザイン仕様書

**バージョン:** 1.0.0
**作成日:** 2026-04-17
**作成者:** Designerエージェント
**対応仕様書:** famnote-mvp.md v2.0.0

---

## 目次

1. [デザインシステム概要](#1-デザインシステム概要)
2. [全画面レイアウト仕様](#2-全画面レイアウト仕様)
3. [共通コンポーネント設計](#3-共通コンポーネント設計)
4. [テーマ選択UI仕様](#4-テーマ選択ui仕様)
5. [アクセシビリティ仕様](#5-アクセシビリティ仕様)

---

## 1. デザインシステム概要

### 1.1 カラーパレット

```css
/* CSS変数（テーマ切り替え対応） */
--color-brand-primary:   #E85513;   /* デフォルト: Shimizuオレンジ */
--color-brand-secondary: #00133F;   /* デフォルト: ネイビー */

/* 固定カラー（Tailwindクラス） */
背景:         bg-zinc-950  (#09090b)
カード背景:   bg-zinc-900  (#18181b)
ボーダー:     border-zinc-800 (#27272a)
テキスト主:   text-zinc-50   (#fafafa)
テキスト副:   text-zinc-400  (#a1a1aa)
成功:         text-green-500 / bg-green-500
エラー:       text-red-500   / bg-red-500
警告:         text-amber-500 / bg-amber-500
```

### 1.2 タイポグラフィ

```css
font-family: 'Inter', 'Noto Sans JP', sans-serif;

/* スケール */
見出し1:  text-3xl font-extrabold tracking-tight   (30px / 800)
見出し2:  text-2xl font-bold                        (24px / 700)
見出し3:  text-xl  font-semibold                    (20px / 600)
見出し4:  text-lg  font-semibold                    (18px / 600)
本文:     text-base font-normal                     (16px / 400)
小テキスト: text-sm font-normal                     (14px / 400)
ラベル:   text-xs  font-medium tracking-wide        (12px / 500)
```

### 1.3 スペーシングシステム

```
ページ外余白（モバイル）:   px-4 py-4
ページ外余白（デスクトップ）: px-8 py-8
カード内余白:               p-4 (モバイル) / p-6 (デスクトップ)
要素間隔（小）:             gap-2 / space-y-2
要素間隔（中）:             gap-4 / space-y-4
要素間隔（大）:             gap-6 / space-y-6
セクション間隔:             mt-8 / mb-8
```

### 1.4 コンポーネント共通スタイル

```css
/* カード */
.card-base {
  @apply bg-zinc-900 border border-zinc-800 rounded-2xl;
}

/* 入力フォーム */
.input-base {
  @apply w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3
         text-zinc-50 placeholder-zinc-500 text-base
         focus:outline-none focus:border-[var(--color-brand-primary)]
         focus:ring-1 focus:ring-[var(--color-brand-primary)]
         transition-colors duration-200;
}

/* プライマリボタン */
.btn-primary {
  @apply bg-[var(--color-brand-primary)] text-white font-semibold
         rounded-xl px-6 py-3 text-base
         hover:opacity-90 active:scale-95
         transition-all duration-200
         disabled:opacity-40 disabled:cursor-not-allowed;
  min-height: 44px;
}

/* セカンダリボタン */
.btn-secondary {
  @apply bg-zinc-800 text-zinc-50 font-semibold
         border border-zinc-700 rounded-xl px-6 py-3 text-base
         hover:bg-zinc-700 active:scale-95
         transition-all duration-200;
  min-height: 44px;
}

/* アウトラインボタン */
.btn-outline {
  @apply bg-transparent text-[var(--color-brand-primary)] font-semibold
         border border-[var(--color-brand-primary)] rounded-xl px-6 py-3
         hover:bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)]
         transition-all duration-200;
  min-height: 44px;
}
```

### 1.5 アニメーション標準（Framer Motion）

```typescript
// motion/react からインポート
import { motion } from 'motion/react';

// ページ遷移
export const pageVariants = {
  initial:  { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// カード出現
export const cardVariants = {
  initial:  { opacity: 0, scale: 0.95 },
  animate:  { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

// リストstagger
export const listVariants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

// ボタンホバー・タップ
export const buttonMotionProps = {
  whileHover: { scale: 1.02 },
  whileTap:   { scale: 0.98 },
};

// リアクションボタン
export const reactionMotionProps = {
  whileHover: { scale: 1.1 },
  whileTap:   { scale: 0.85 },
};

// ストリーク炎
export const flameVariants = {
  animate: {
    rotate: [-3, 3, -3],
    scale:  [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
  },
};

// バッジ取得
export const badgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};
```

---

## 2. 全画面レイアウト仕様

---

### 2.1 `/` ランディングページ

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│ ヘッダー: FamNoteロゴ  [ログイン] [新規登録] │
├────────────────────────────────────┤
│                                    │
│  [ヒーローセクション]               │
│  大見出し: 家族の成長を、           │
│           一緒に記録しよう。        │
│  サブコピー: スポーツに励む子供を   │
│             家族で応援できる        │
│             記録アプリ             │
│  [無料で始める →]  [デモを見る]     │
│  ↓ スクロールインジケーター        │
│                                    │
├────────────────────────────────────┤
│  [フィーチャーセクション]            │
│  3カラム（モバイル: 1列）           │
│  ①記録継続  ②家族共有  ③成長可視化  │
│  アイコン + 見出し + 説明文         │
│                                    │
├────────────────────────────────────┤
│  [スクリーンショットモックアップ]    │
│  ダッシュボード画面のプレビュー     │
│                                    │
├────────────────────────────────────┤
│  [CTAセクション]                    │
│  「今すぐ家族で始めよう」           │
│  [無料アカウントを作成]             │
│                                    │
├────────────────────────────────────┤
│  フッター: ©FamNote  利用規約  プライバシー │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `LandingHeader` | ロゴ＋ナビゲーション固定ヘッダー | `fixed top-0 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 z-50` |
| `HeroSection` | メインビジュアル・CTA | `min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20` |
| `HeroHeadline` | グラデーションテキスト見出し | `text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-[var(--color-brand-primary)] to-amber-400 bg-clip-text text-transparent` |
| `FeatureCard` | 特徴説明カード | `bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3` |
| `FeatureGrid` | 3カラムグリッド | `grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto` |
| `MockupDisplay` | アプリモックアップ | `relative mx-auto max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-700` |
| `LandingCTA` | 最終CTA | `bg-gradient-to-r from-[var(--color-brand-primary)] to-amber-500 rounded-3xl p-12 text-center` |
| `LandingFooter` | フッター | `border-t border-zinc-800 py-8 text-zinc-500 text-sm text-center` |

#### モバイル（390px）での変化

- `LandingHeader`: ロゴのみ表示、ハンバーガーメニュー化
- `HeroHeadline`: `text-4xl` に縮小
- `FeatureGrid`: `grid-cols-1` に変更（縦積み）
- CTAボタン: `w-full` でフル幅

#### アニメーション仕様

```typescript
// ヒーローセクション文字アニメーション
heroText: { initial:{opacity:0, y:30}, animate:{opacity:1, y:0}, transition:{duration:0.6, delay:0.1} }
heroSubtext: { ...delay: 0.3 }
heroCTA: { ...delay: 0.5 }

// フィーチャーカードのスクロール表示
<motion.div viewport={{ once: true }} whileInView={cardVariants} />
```

#### 空状態・ローディング・エラー状態

- ローディング: なし（静的ページ）
- エラー: なし（静的ページ）

---

### 2.2 `/login` ログイン画面 / `/signup` サインアップ画面

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│      [FamNoteロゴ + アイコン]       │
│      「家族で成長を記録しよう」     │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │  [Googleでログイン / 登録]    │  │
│  │  ──────── または ─────────   │  │
│  │  メールアドレス              │  │
│  │  [________________]          │  │
│  │  パスワード            [👁]  │  │
│  │  [________________]          │  │
│  │  ※サインアップのみ↓          │  │
│  │  パスワード確認        [👁]  │  │
│  │  [________________]          │  │
│  │  □ 利用規約・PPに同意する    │  │
│  │                              │  │
│  │  [ログイン / アカウント作成]  │  │
│  └──────────────────────────────┘  │
│                                    │
│  「アカウント作成はこちら」         │
│   または「ログインはこちら」         │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `AuthPageWrapper` | 認証画面全体レイアウト | `min-h-screen bg-zinc-950 flex items-center justify-center px-4` |
| `AuthCard` | フォームカード | `w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8` |
| `AppLogo` | ロゴ＋テキスト | `flex flex-col items-center gap-2 mb-8` |
| `GoogleAuthButton` | Googleログインボタン | `w-full flex items-center justify-center gap-3 bg-white text-zinc-900 font-semibold rounded-xl py-3 hover:bg-zinc-100 transition-colors` |
| `OrDivider` | または区切り線 | `flex items-center gap-4 text-zinc-500 text-sm` |
| `FormField` | ラベル＋入力フィールド | `flex flex-col gap-1.5` |
| `PasswordInput` | パスワード入力（表示トグル付き） | `relative` + `input-base` + トグルボタン |
| `PasswordStrengthBar` | パスワード強度インジケーター（サインアップのみ） | `flex gap-1 mt-1` + 色分けバー4本 |
| `TermsCheckbox` | 利用規約同意チェックボックス | `flex items-start gap-3 text-sm text-zinc-400` |
| `AuthSubmitButton` | 送信ボタン | `btn-primary w-full mt-2` |
| `AuthLink` | 切り替えリンク | `text-center text-sm text-zinc-400` |

#### モバイル（390px）での変化

- カード: `rounded-none` / `px-0` に変更し画面フル幅
- 上部にロゴのみ表示（カード外）

#### アニメーション仕様

```typescript
// カード出現
AuthCard: pageVariants（opacity:0, y:20 → opacity:1, y:0）

// バリデーションエラーシェイク
errorShake: { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } }
```

#### 空状態・ローディング・エラー状態

- ローディング: 送信ボタンにスピナー（`animate-spin`）+ テキスト「認証中...」
- エラー（Sonnerトースト）: 赤背景 `bg-red-950 border-red-500`
  - `auth/invalid-credential`: 「メールアドレスまたはパスワードが正しくありません」
  - `auth/email-already-in-use`: 「このメールアドレスはすでに使用されています」
  - ネットワークエラー: 「通信に失敗しました。再試行してください」
- インラインバリデーション: フィールド下に `text-red-400 text-xs mt-1`

---

### 2.3 `/onboarding/profile` プロフィール設定

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  ←  [●──────────] 1/3 ステップ    │
│     プロフィールを設定しよう        │
├────────────────────────────────────┤
│                                    │
│       [アバター画像]                │
│       [📷 写真を変更]              │
│                                    │
│  表示名                            │
│  [____________________]            │
│                                    │
│  スポーツを選択（複数可）           │
│  ┌──────┐┌──────┐┌──────┐         │
│  │⚽   │ │⚾   │ │🏀   │         │
│  │サッカー││ 野球  ││バスケ │         │
│  └──────┘└──────┘└──────┘         │
│  ┌──────┐┌──────┐┌──────┐         │
│  │🎾   │ │🏐   │ │🏊   │         │
│  │テニス ││バレー ││ 水泳  │         │
│  └──────┘└──────┘└──────┘         │
│  ┌──────┐┌──────┐                  │
│  │🏃   │ │その他 │                  │
│  │ 陸上  ││      │                  │
│  └──────┘└──────┘                  │
│                                    │
│  [次へ →]                          │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `OnboardingLayout` | オンボーディング共通レイアウト | `min-h-screen bg-zinc-950 flex flex-col px-4 py-8 max-w-lg mx-auto` |
| `StepIndicator` | 進捗インジケーター（1/3等） | `flex items-center gap-2 mb-8` |
| `StepDot` | ステップドット（active/inactive） | active: `w-8 h-2 rounded-full bg-[var(--color-brand-primary)]` / inactive: `w-2 h-2 rounded-full bg-zinc-700` |
| `AvatarUploader` | アバター画像アップロード | `relative w-24 h-24 rounded-full` |
| `AvatarEditButton` | 編集ボタン（アバター上） | `absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-brand-primary)] rounded-full flex items-center justify-center` |
| `SportSelector` | スポーツ選択グリッド | `grid grid-cols-3 gap-3` |
| `SportButton` | 個別スポーツボタン | selected: `bg-[color-mix(in_srgb,var(--color-brand-primary)_20%,transparent)] border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]` / unselected: `bg-zinc-800 border-zinc-700 text-zinc-400` + `rounded-xl border py-4 flex flex-col items-center gap-1.5 transition-all` |

#### モバイル（390px）での変化

- SportSelector: `grid-cols-3` は維持（小さめのボタン）
- AvatarUploader: 中央配置

#### アニメーション仕様

```typescript
// スポーツボタン選択アニメーション
SportButton: whileTap={{ scale: 0.92 }}, animate選択時: scale:[1, 1.05, 1]

// ページ遷移: pageVariants
```

#### 空状態・ローディング・エラー状態

- バリデーションエラー: スポーツ未選択で「次へ」タップ時「最低1種目を選択してください」インラインエラー
- ローディング: アバターアップロード中はスピナー表示

---

### 2.4 `/onboarding/create-group` グループ作成

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  ←  [●●─────────] 2/3 ステップ   │
│     家族グループを作ろう            │
├────────────────────────────────────┤
│                                    │
│       [グループアイコン]            │
│       [📷 アイコンを設定]          │
│                                    │
│  グループ名（例: 田中家）           │
│  [____________________]            │
│                                    │
│  [グループを作成 →]                │
│                                    │
│  ──────── または ─────────         │
│                                    │
│  「既存のグループに参加する」        │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `GroupIconUploader` | グループアイコンアップロード | `relative w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700` |
| `GroupNameInput` | グループ名入力 | `input-base` |
| `CreateGroupButton` | グループ作成ボタン | `btn-primary w-full` |
| `JoinGroupLink` | 参加切り替えリンク | `text-center text-[var(--color-brand-primary)] text-sm underline` |

---

### 2.5 `/onboarding/join-group` グループ参加

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  ←  [●●─────────] 2/3 ステップ   │
│     招待コードを入力しよう          │
├────────────────────────────────────┤
│                                    │
│  招待コードを入力してください        │
│                                    │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │
│  │A │ │B │ │C │ │1 │ │2 │ │3 │  │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘  │
│                                    │
│  [参加する →]                      │
│                                    │
│  「新しいグループを作成する」        │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `InviteCodeInput` | 招待コード6マス入力 | `flex gap-3 justify-center` |
| `InviteCodeCell` | 1文字入力セル | `w-12 h-14 text-center text-2xl font-bold bg-zinc-800 border-2 border-zinc-700 rounded-xl text-zinc-50 focus:border-[var(--color-brand-primary)] outline-none transition-colors` |
| `JoinButton` | 参加ボタン | `btn-primary w-full` |

**InviteCodeInput Props:**
```typescript
interface InviteCodeInputProps {
  value: string;          // 6文字の文字列
  onChange: (v: string) => void;
  error?: string;
}
```

**自動フォーカス移動:**
```
1文字入力 → 次セルにfocus
Backspace → 前セルにfocus
ペースト → 6文字を各セルに分配（スペース自動除去・英数字のみ許可）
```

#### 空状態・ローディング・エラー状態

- コード不一致: 「招待コードが正しくありません」`text-red-400 text-sm text-center`
- 人数上限: 「このグループは満員です（最大10名）」
- ローディング: 「参加する」ボタンにスピナー

---

### 2.6 `/dashboard` ダッシュボード

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  AppHeader: [FamNote] [🔔] [👤]   │
├────────────────────────────────────┤
│  [ストリークカード]                 │
│  ┌──────────────────────────────┐  │
│  │ 🔥  14  連続練習中！         │  │
│  │ ● ● ● ● ● ● ○ （週7日）    │  │
│  │ 最終記録: 昨日               │  │
│  └──────────────────────────────┘  │
│                                    │
│  [家族メンバー]                     │
│  [👤田中太郎●] [👤田中花子●]       │
│  [👤田中次郎○] [+ 招待する]        │
│                                    │
│  [最近の記録]                       │
│  ┌──────────────────────────────┐  │
│  │ NoteCard or MatchCard         │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ NoteCard or MatchCard         │  │
│  └──────────────────────────────┘  │
│  [タイムラインをもっと見る →]       │
│                                    │
│  [FAB: + 記録する]（右下固定）      │
├────────────────────────────────────┤
│  BottomNav（モバイルのみ）          │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `StreakCard` | 連続記録ストリーク表示カード | `card-base p-5 flex flex-col gap-3` |
| `StreakNumber` | ストリーク日数（大きな数字） | `text-6xl font-extrabold text-[var(--color-brand-primary)]` |
| `FlameIcon` | 揺れる炎アイコン（motion使用） | `text-4xl` + `flameVariants` |
| `WeeklyDots` | 週7日の記録ドット | `flex gap-2` |
| `WeeklyDot` | 個別日付ドット | recorded: `w-3 h-3 rounded-full bg-[var(--color-brand-primary)]` / empty: `w-3 h-3 rounded-full bg-zinc-700` |
| `FamilyMemberRow` | 家族メンバー横スクロール | `flex gap-3 overflow-x-auto pb-2 scrollbar-hide` |
| `FamilyMemberChip` | メンバーアバター+名前+状態ドット | `flex flex-col items-center gap-1.5 flex-shrink-0` |
| `ActivityDot` | アクティビティ状態ドット | active: `w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900` / inactive: `bg-zinc-600` |
| `RecentRecordsList` | 最近の記録リスト | `flex flex-col gap-3` |
| `FAB` | フローティングアクションボタン | `fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-[var(--color-brand-primary)] shadow-lg flex items-center justify-center text-white text-2xl` (md: `bottom-8`) |
| `FABMenu` | FABタップでメニュー展開 | 「練習ノート」「試合記録」の2項目 |

#### モバイル（390px）での変化

- BottomNav表示
- FABは `bottom-24`（BottomNav上部）
- FamilyMemberRow: 横スクロール

#### アニメーション仕様

```typescript
// FABメニュー展開
FABMenuItems: { initial:{opacity:0,y:10,scale:0.9}, animate:{opacity:1,y:0,scale:1} }
stagger: staggerChildren 0.05

// ストリーク炎アニメーション
FlameIcon: flameVariants

// ページ全体: pageVariants
// カードlist stagger: listVariants
```

#### 空状態・ローディング・エラー状態

- ローディング: `SkeletonCard` × 3枚表示
- ストリーク0: 「記録を始めよう！最初の一歩を踏み出そう🏃」
- メンバー1人（自分のみ）: 「家族を招待しよう！」招待ボタン表示

---

### 2.7 `/notes` 練習ノート一覧

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  AppHeader: [← 練習ノート] [＋新規]│
├────────────────────────────────────┤
│  [統計カード]                       │
│  今月: 12件 / 合計練習時間: 1,230分 │
├────────────────────────────────────┤
│  [フィルターバー]                   │
│  [すべて][サッカー][野球]...        │
│  [今週▼]                           │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │ NoteCard                      │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ NoteCard                      │  │
│  └──────────────────────────────┘  │
│  ... 無限スクロール（20件/ページ）  │
├────────────────────────────────────┤
│  BottomNav                         │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `NoteStatsBar` | 月間統計カード | `grid grid-cols-2 gap-3 mb-4` |
| `StatItem` | 統計アイテム（件数・時間） | `card-base p-4 flex flex-col gap-1` |
| `FilterBar` | スポーツ・期間フィルター | `flex gap-2 overflow-x-auto pb-2 scrollbar-hide` |
| `FilterChip` | フィルタータグ | active: `bg-[var(--color-brand-primary)] text-white rounded-full px-4 py-1.5 text-sm font-medium` / inactive: `bg-zinc-800 text-zinc-400 rounded-full px-4 py-1.5 text-sm` |
| `PeriodSelect` | 期間選択ドロップダウン | `bg-zinc-800 border border-zinc-700 rounded-xl text-sm px-3 py-1.5 text-zinc-50` |
| `NoteCardList` | ノートカードの縦リスト | `flex flex-col gap-3` |
| `InfiniteScrollTrigger` | 無限スクロール検知 | `IntersectionObserver` / `h-4` |

#### 空状態・ローディング・エラー状態

- ローディング: `SkeletonCard` × 5
- 空状態: `EmptyState` 「まだ練習ノートがありません。最初の記録を始めよう！」+ 「記録する」ボタン
- フィルター結果なし: 「絞り込み条件に一致するノートがありません」

---

### 2.8 `/notes/new` 練習ノート作成 / `/notes/:id/edit` 編集

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  AppHeader: [← 戻る] [練習ノートを記録]│
├────────────────────────────────────┤
│  スポーツ種目 *必須                  │
│  [⚽サッカー ▼]                    │
│                                    │
│  日付 *必須           練習時間（分）│
│  [2026-04-17 📅]      [90____]      │
│                                    │
│  場所（任意）                       │
│  [市営グラウンド___]                │
│                                    │
│  今日の目標（任意）                  │
│  [________________________]         │
│  [________________________]         │
│                                    │
│  練習内容 *必須                     │
│  [________________________]         │
│  [________________________]         │
│  [________________________]         │
│  (0/1000文字)                      │
│                                    │
│  振り返り（任意）                   │
│  [________________________]         │
│                                    │
│  体調                              │
│  😫  😕  😐  🙂  😄              │
│   1   2   3   4   5               │
│                                    │
│  写真を追加（最大5枚）              │
│  ┌─┐┌─┐┌─┐┌─┐ [+]             │
│  │🖼││🖼││🖼││🖼│              │
│  └─┘└─┘└─┘└─┘              │
│                                    │
│  公開設定                          │
│  ◉ 家族に公開  ○ 自分のみ          │
│                                    │
│  [下書き保存]  [公開して保存]       │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `SportSelect` | スポーツ種目セレクト | `input-base cursor-pointer` + スポーツアイコン付き |
| `DatePicker` | 日付入力 | `input-base` + カレンダーアイコン |
| `DurationInput` | 練習時間（分）入力 | `input-base w-28` |
| `TextareaField` | テキストエリア | `input-base resize-none min-h-[100px]` |
| `CharCounter` | 文字数カウンター | `text-right text-xs text-zinc-500 mt-1` |
| `ConditionSelector` | 体調5段階選択 | `flex gap-4 justify-between` |
| `ConditionButton` | 体調ボタン（絵文字） | selected: `text-[var(--color-brand-primary)] scale-125 font-bold` / unselected: `text-zinc-500` + `text-2xl transition-all` |
| `ImageUploader` | 画像アップロードエリア | `grid grid-cols-4 gap-2 mt-2` |
| `ImagePreviewThumb` | 画像サムネイル | `relative aspect-square rounded-xl overflow-hidden bg-zinc-800` |
| `ImageRemoveButton` | 画像削除ボタン | `absolute top-1 right-1 w-6 h-6 bg-zinc-900/80 rounded-full flex items-center justify-center text-zinc-300 hover:text-red-400` |
| `AddImageButton` | 画像追加ボタン | `aspect-square rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-[var(--color-brand-primary)] transition-colors` |
| `PublicToggle` | 公開設定ラジオ | `flex gap-6` |
| `DraftButton` | 下書き保存ボタン | `btn-secondary flex-1` |
| `SaveButton` | 公開保存ボタン | `btn-primary flex-1` |

#### 下書き復元ダイアログ

```
┌──────────────────────────────────┐
│  下書きがあります                  │
│  前回の続きから再開しますか？       │
│  (2026-04-16 14:32 保存)          │
│                                  │
│  [新しく作成] [下書きを再開]      │
└──────────────────────────────────┘
```

実装: `Dialog` コンポーネント、`z-50 fixed inset-0 bg-zinc-950/80 flex items-center justify-center p-4`

#### モバイル（390px）での変化

- `フォームフィールド`: `font-size: 16px`（iOS自動ズーム防止必須）
- 日付と練習時間: 縦並びに変更
- ImageUploader: `grid-cols-3` に変更
- 下書き・保存ボタン: `flex-col` で縦並び

#### アニメーション仕様

```typescript
// 画像プレビュー追加アニメーション
ImagePreviewThumb: { initial:{opacity:0,scale:0.8}, animate:{opacity:1,scale:1}, transition:{duration:0.2} }

// アップロード進捗
UploadProgressBar: width をアニメーション変化 (transition: { duration: 0.3, ease: "easeOut" })
```

#### 空状態・ローディング・エラー状態

- 送信中: ボタンに `animate-spin` スピナー
- バリデーションエラー: フィールド下 `text-red-400 text-xs mt-1`、赤ボーダー `border-red-500`
- 画像アップロードエラー: Sonnerトースト「画像のアップロードに失敗しました」

---

### 2.9 `/notes/:id` 練習ノート詳細

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  AppHeader: [← 戻る]  [✏️編集][🗑️]│
├────────────────────────────────────┤
│  [ヘッダー画像（あれば）]           │
│                                    │
│  [⚽ サッカー]  [体調: ⭐⭐⭐⭐]    │
│  2026年4月17日（木）               │
│  市営グラウンド / 90分             │
│                                    │
│  [投稿者アバター] 田中太郎          │
│                                    │
│  今日の目標                        │
│  シュートの精度を上げる             │
│                                    │
│  練習内容                          │
│  今日はシュート練習を中心に...      │
│  （全文表示）                      │
│                                    │
│  振り返り                          │
│  左足のシュートが改善された...      │
│                                    │
│  [画像ギャラリー 3枚]              │
│  ┌───┐ ┌───┐ ┌───┐              │
│  │🖼 │ │🖼 │ │🖼 │              │
│  └───┘ └───┘ └───┘              │
│                                    │
│  [ReactionBar]                     │
│  👏12  🔥8  ⭐5  💪3              │
│                                    │
│  [CommentSection]                  │
│  コメント3件                       │
│  [👤] 田中花子: すごいね！          │
│  [コメントを入力...]                │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `NoteDetailHeader` | スポーツ・日時・場所・体調 | `flex flex-wrap gap-2 items-center` |
| `AuthorRow` | 投稿者情報 | `flex items-center gap-3 py-3 border-b border-zinc-800` |
| `SectionBlock` | テキストブロック（目標・内容・振り返り） | `py-4 border-b border-zinc-800` |
| `SectionLabel` | セクションラベル | `text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2` |
| `ImageGallery` | 画像ギャラリー（タップで全画面） | `grid grid-cols-3 gap-2` |
| `LightboxModal` | 全画面画像表示 | `fixed inset-0 z-50 bg-zinc-950/95 flex items-center justify-center` |
| `ReactionBar` | リアクションバー | `flex gap-3 py-3` |
| `CommentSection` | コメントセクション | `pt-3` |
| `CommentList` | コメント一覧（最大3件 → 展開） | `flex flex-col gap-3` |
| `CommentItem` | コメントアイテム | `flex gap-2 items-start` |
| `CommentInput` | コメント入力フォーム | `flex gap-2 items-center mt-3` |
| `DeleteConfirmModal` | 削除確認モーダル | 標準ダイアログスタイル |

#### 体調表示（ConditionBadge）

```
1: bg-red-950 text-red-400 border border-red-800 「とても疲れた」
2: bg-orange-950 text-orange-400 「疲れた」
3: bg-zinc-800 text-zinc-400 「普通」
4: bg-emerald-950 text-emerald-400 「良い」
5: bg-emerald-900 text-emerald-300 border border-emerald-600 「最高！」
```

---

### 2.10 `/matches` 試合記録一覧

`/notes` と同構造。以下の差分のみ：

- 統計カード: 「今月: 3試合 / 勝: 2 分: 0 負: 1」
- フィルター: スポーツ種目 + 勝敗（勝ち/引き分け/負け）
- `MatchCard` を使用

---

### 2.11 `/matches/new` 試合記録作成 / `/matches/:id/edit` 編集

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  AppHeader: [← 戻る] [試合記録]    │
├────────────────────────────────────┤
│  スポーツ種目 *必須                  │
│  [⚽サッカー ▼]                    │
│                                    │
│  日付 *必須                        │
│  [2026-04-17 📅]                   │
│                                    │
│  対戦相手 *必須                     │
│  [○○FC___________]               │
│                                    │
│  会場（任意）                       │
│  [______________]                  │
│                                    │
│  スコア                            │
│  自チーム    相手チーム             │
│  [  2  ]  対  [  1  ]             │
│                                    │
│  勝敗（自動判定または手動）          │
│  [勝ち ✓] [引き分け] [負け]        │
│                                    │
│  ポジション    出場時間（分）        │
│  [FW________]    [90]              │
│                                    │
│  パフォーマンス評価                  │
│  ☆ ☆ ★ ★ ★  (3/5)             │
│                                    │
│  ハイライトメモ（任意）              │
│  [________________________]         │
│                                    │
│  改善点（任意）                     │
│  [________________________]         │
│                                    │
│  写真を追加（最大5枚）              │
│  [ImageUploader]                   │
│                                    │
│  公開設定                          │
│  ◉ 家族に公開  ○ 自分のみ          │
│                                    │
│  [下書き保存]  [公開して保存]       │
└────────────────────────────────────┘
```

#### 追加コンポーネント

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `ScoreInput` | スコア入力（自チーム vs 相手） | `flex items-center gap-4` |
| `ScoreField` | 個別スコア数値入力 | `w-16 text-center text-2xl font-bold input-base` |
| `ResultSelector` | 勝敗選択ボタン（3択） | `flex gap-2` |
| `ResultButton` | 勝敗ボタン | win: `bg-emerald-500/20 border-emerald-500 text-emerald-400` / draw: `bg-amber-500/20 border-amber-500 text-amber-400` / loss: `bg-red-500/20 border-red-500 text-red-400` + `border rounded-xl px-4 py-2 text-sm font-semibold transition-all` |
| `PerformanceStars` | 5段階星評価UI | `flex gap-1` |

---

### 2.12 `/matches/:id` 試合記録詳細

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  AppHeader: [← 戻る] [✏️編集][🗑️] │
├────────────────────────────────────┤
│  [スコアボード]                     │
│  ┌──────────────────────────────┐  │
│  │  [勝利 🏆]                   │  │
│  │                              │  │
│  │  田中チーム   対   ○○FC     │  │
│  │      2      ー      1        │  │
│  │                              │  │
│  │  2026年4月17日  市営グラウンド│  │
│  └──────────────────────────────┘  │
│                                    │
│  [⚽サッカー]  [🌟🌟🌟（3/5）]   │
│  [投稿者] 田中太郎                 │
│                                    │
│  ポジション: FW / 出場時間: 90分   │
│                                    │
│  ハイライト                        │
│  2得点を決めた！...                │
│                                    │
│  改善点                            │
│  守備への切り替えが遅い...         │
│                                    │
│  [画像ギャラリー]                  │
│  [ReactionBar]                     │
│  [CommentSection]                  │
└────────────────────────────────────┘
```

#### スコアボードスタイル

```typescript
// 勝敗に応じた背景カラー
win:  'bg-emerald-500/10 border border-emerald-500/30'
draw: 'bg-amber-500/10  border border-amber-500/30'
loss: 'bg-red-500/10    border border-red-500/30'

// スコア数字
'text-6xl font-extrabold text-zinc-50'

// 勝敗バッジ
win:  'bg-emerald-500 text-white'
draw: 'bg-amber-500   text-white'
loss: 'bg-red-500     text-white'
'rounded-full px-3 py-1 text-sm font-bold'
```

---

### 2.13 `/timeline` 家族タイムライン

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  AppHeader: [タイムライン]          │
├────────────────────────────────────┤
│  [フィルターバー]                   │
│  [全員▼] [全種目▼] [ノート/試合▼] │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │ [👤田中太郎] 練習ノート ⚽    │  │
│  │ 2026-04-17 / 市営グラウンド   │  │
│  │ 今日はシュート練習を...       │  │
│  │ [続きを読む ▼]               │  │
│  │ [🖼][🖼] +1枚               │  │
│  │ [👏12][🔥8][⭐5][💪3]       │  │
│  │ 💬 コメント3件               │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ TimelineItem（MatchCard）     │  │
│  └──────────────────────────────┘  │
│  ... 無限スクロール（15件/ページ）  │
├────────────────────────────────────┤
│  BottomNav                         │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `TimelineFilter` | メンバー・種目・タイプ フィルター | `flex gap-2 overflow-x-auto pb-2 px-4 border-b border-zinc-800` |
| `TimelineItem` | タイムラインの1投稿 | `card-base p-4 mx-4 mb-3` |
| `TimelineItemHeader` | 投稿者情報・記録タイプ | `flex items-center gap-3 mb-3` |
| `RecordTypeBadge` | 記録タイプバッジ（練習ノート/試合記録） | note: `bg-blue-500/20 text-blue-400 border border-blue-500/30` / match: `bg-purple-500/20 text-purple-400 border border-purple-500/30` + `rounded-full px-2 py-0.5 text-xs font-semibold` |
| `ContentPreview` | テキスト内容（150字 + 展開） | `text-zinc-300 text-sm leading-relaxed` |
| `ExpandButton` | 「続きを読む」展開ボタン | `text-[var(--color-brand-primary)] text-sm font-medium mt-1` |
| `ThumbnailRow` | 添付画像サムネイル（最大3枚） | `flex gap-2 mt-3` |
| `ExtraImageCount` | 残り枚数バッジ | `w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-semibold` |
| `ReactionBar` | リアクションボタン4種 | `flex gap-2 pt-3 border-t border-zinc-800` |
| `CommentToggle` | コメント件数・展開トグル | `text-zinc-400 text-sm flex items-center gap-1 pt-2` |

#### 空状態・ローディング・エラー状態

- ローディング: `SkeletonCard` × 5（`animate-pulse`）
- 空状態: `EmptyState` 「まだ家族の記録がありません。家族を招待して一緒に記録を始めよう！」
- フィルター結果なし: 「絞り込み条件に一致する記録がありません」

---

### 2.14 `/goals` 目標一覧 / `/goals/new` 目標作成

#### 目標一覧レイアウト（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  AppHeader: [目標] [＋新規]        │
├────────────────────────────────────┤
│  [アクティブ] [達成済み]           │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │ GoalCard                      │  │
│  │ 「週3回練習する」 ⚽           │  │
│  │ 期限: 2026-05-31             │  │
│  │ [■■■■■■░░░░] 6/12回        │  │
│  │ 残り: 6回 / 44日             │  │
│  └──────────────────────────────┘  │
│  ...                               │
├────────────────────────────────────┤
│  BottomNav                         │
└────────────────────────────────────┘
```

#### 目標作成フォームレイアウト

```
┌────────────────────────────────────┐
│  AppHeader: [← 戻る] [目標を設定]  │
├────────────────────────────────────┤
│  タイトル *必須                     │
│  [週3回練習する____]               │
│                                    │
│  スポーツ種目 *必須                  │
│  [⚽サッカー ▼]                    │
│                                    │
│  目標タイプ *必須                   │
│  ◉ 練習回数  ○ 試合出場  ○ スキル習得│
│                                    │
│  目標値（練習回数・試合数の場合）   │
│  [ 12 ] 回                         │
│                                    │
│  期限 *必須                        │
│  [2026-05-31 📅]                   │
│                                    │
│  詳細（任意）                       │
│  [________________________]         │
│                                    │
│  公開設定                          │
│  ◉ 家族に公開  ○ 自分のみ          │
│                                    │
│  [目標を設定する]                  │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `GoalTabBar` | アクティブ/達成済みタブ | `flex border-b border-zinc-800` |
| `GoalTab` | タブボタン | active: `border-b-2 border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]` / inactive: `text-zinc-500` + `py-3 px-6 text-sm font-semibold` |
| `GoalCard` | 目標カード | `card-base p-4` |
| `GoalProgressBar` | 進捗バー | `h-2 rounded-full bg-zinc-700 overflow-hidden` |
| `GoalProgressFill` | 進捗塗り部分 | `h-full bg-[var(--color-brand-primary)] rounded-full transition-all duration-500` |
| `GoalMetaInfo` | 残り回数・期限情報 | `flex justify-between text-xs text-zinc-400 mt-1` |
| `GoalTypeSelector` | 目標タイプラジオ | `flex flex-col gap-2` |
| `GoalTypeOption` | タイプ選択オプション | `flex items-center gap-3 p-3 rounded-xl border border-zinc-700 cursor-pointer` |
| `GoalAchievedModal` | 達成時モーダル | `fixed inset-0 z-50 bg-zinc-950/90 flex items-center justify-center p-4` |
| `ConfettiAnimation` | 紙吹雪アニメーション | `canvas-confetti` 使用 |

#### 目標達成モーダル

```
┌──────────────────────────────────┐
│  🏆                              │
│  目標達成！                       │
│  おめでとうございます！            │
│                                  │
│  「週3回練習する」                │
│  を達成しました！                 │
│                                  │
│  [閉じる]                        │
└──────────────────────────────────┘
```

- 背景: `canvas-confetti` で紙吹雪3秒
- モーダル: `badgeVariants` でスケールアップ
- トロフィーアイコン: `text-8xl` でドーン表示

---

### 2.15 `/profile` 自プロフィール / `/profile/:userId` メンバープロフィール

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  AppHeader: [← 戻る] [⚙️設定]     │
│             （自分の場合のみ）      │
├────────────────────────────────────┤
│  [プロフィールヘッダー]             │
│  [👤 大きなアバター]               │
│  田中太郎                          │
│  [⚽サッカー][⚾野球]             │
│                                    │
│  [統計グリッド]                    │
│  ┌──────┬──────┬──────┐           │
│  │ 練習  │ 試合  │ 連続  │           │
│  │  152  │  23   │  14   │           │
│  │  件   │  件   │  日   │           │
│  └──────┴──────┴──────┘           │
│                                    │
│  [バッジコレクション]               │
│  🏆「月間チャンピオン」             │
│  ⚔️「1週間の戦士」                 │
│  🔥「3日坊主脱出」                 │
│  ...                               │
│                                    │
│  [最近の記録]                       │
│  ┌──────────────────────────────┐  │
│  │ NoteCard                      │  │
│  └──────────────────────────────┘  │
├────────────────────────────────────┤
│  BottomNav（自分のみ）              │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `ProfileHeader` | アバター・名前・スポーツタグ | `flex flex-col items-center gap-3 py-8 border-b border-zinc-800` |
| `LargeAvatar` | 大きなアバター画像 | `w-24 h-24 rounded-full object-cover border-4 border-[var(--color-brand-primary)]` |
| `StatsGrid` | 統計グリッド（3カラム） | `grid grid-cols-3 gap-3 px-4 py-4` |
| `StatCard` | 統計カード（数値＋ラベル） | `card-base p-4 flex flex-col items-center gap-1` |
| `StatValue` | 統計数値 | `text-3xl font-extrabold text-zinc-50` |
| `StatLabel` | 統計ラベル | `text-xs text-zinc-500` |
| `BadgeSection` | バッジコレクションセクション | `px-4 py-4 border-t border-zinc-800` |
| `BadgeGrid` | バッジグリッド | `grid grid-cols-4 gap-4 mt-3` |
| `BadgeItem` | 個別バッジアイテム | `flex flex-col items-center gap-1` |
| `BadgeEmoji` | バッジ絵文字 | `text-4xl` |
| `BadgeNameLabel` | バッジ名ラベル | `text-xs text-zinc-400 text-center leading-tight` |
| `LockedBadge` | 未取得バッジ（グレーアウト） | `opacity-30 grayscale` |

---

### 2.16 `/settings` 設定

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  AppHeader: [← 戻る] [設定]        │
├────────────────────────────────────┤
│  [アカウント設定]                   │
│  ┌──────────────────────────────┐  │
│  │ プロフィール編集           › │  │
│  │ メールアドレス変更         › │  │
│  │ パスワード変更             › │  │
│  └──────────────────────────────┘  │
│                                    │
│  [テーマ]                          │
│  ┌──────────────────────────────┐  │
│  │ カラーテーマを選択            │  │
│  │ [ThemeSelector コンポーネント]│  │
│  └──────────────────────────────┘  │
│                                    │
│  [グループ]                        │
│  ┌──────────────────────────────┐  │
│  │ グループ名: 田中家            │  │
│  │ メンバー: 3名 / 10名         │  │
│  │ 招待コード: ABC123 [📋][🔄]  │  │
│  │ グループ設定                › │  │
│  └──────────────────────────────┘  │
│                                    │
│  [表示設定]                        │
│  ┌──────────────────────────────┐  │
│  │ ダークモード              [🌙]│  │
│  │ 言語              [日本語 ▼] │  │
│  └──────────────────────────────┘  │
│                                    │
│  [プラン]                          │
│  ┌──────────────────────────────┐  │
│  │ 現在: 無料プラン              │  │
│  │ [プレミアムにアップグレード]   │  │
│  └──────────────────────────────┘  │
│                                    │
│  [ログアウト]  [アカウント削除]     │
├────────────────────────────────────┤
│  BottomNav                         │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `SettingsSection` | 設定セクション | `mb-6` |
| `SettingsSectionTitle` | セクションタイトル | `text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1 mb-2` |
| `SettingsItem` | リストアイテム（矢印付き） | `flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800 transition-colors cursor-pointer` |
| `SettingsItemLabel` | 設定項目ラベル | `text-zinc-50 text-base` |
| `ThemeSelector` | テーマ選択UI（詳細は §4） | `p-4` |
| `InviteCodeRow` | 招待コード表示 | `flex items-center gap-3` |
| `InviteCodeText` | 招待コードテキスト | `font-mono text-xl font-bold tracking-widest text-[var(--color-brand-primary)]` |
| `DarkModeToggle` | ダークモードスイッチ | `w-12 h-6 rounded-full relative transition-colors` |
| `LogoutButton` | ログアウトボタン | `w-full text-red-400 border border-red-500/30 rounded-xl py-3 font-semibold hover:bg-red-500/10 transition-colors` |
| `DeleteAccountButton` | アカウント削除（最下部） | `w-full text-zinc-500 text-sm py-2 underline` |

---

### 2.17 `/family` 家族グループ管理

（Settings内に統合、または独立ページ）

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  AppHeader: [← 戻る] [グループ管理] │
├────────────────────────────────────┤
│  [グループ情報]                     │
│  [グループアイコン]                 │
│  田中家                            │
│  [✏️ 編集]                         │
│                                    │
│  招待コード                        │
│  [  ABC123  ] [📋コピー] [🔄更新]  │
│  [共有する]                        │
│                                    │
│  メンバー (3/10名)                  │
│  ┌──────────────────────────────┐  │
│  │ [👤] 田中太郎（オーナー） 自分│  │
│  │ [👤] 田中花子       今日活動  │  │
│  │ [👤] 田中次郎       昨日活動  │  │
│  │ [メンバーを招待...]            │  │
│  └──────────────────────────────┘  │
│                                    │
│  [グループを退出する]               │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `GroupInfoCard` | グループ情報カード | `card-base p-5 flex flex-col items-center gap-3 mb-6` |
| `MemberList` | メンバー一覧 | `card-base divide-y divide-zinc-800` |
| `MemberItem` | メンバーリストアイテム | `flex items-center gap-3 p-4` |
| `MemberRole` | オーナー/メンバーバッジ | owner: `bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 text-xs` |
| `InviteButton` | 招待ボタン | `btn-primary w-full mt-4` |
| `LeaveGroupButton` | グループ退出ボタン | `w-full text-red-400 border border-red-500/30 rounded-xl py-3 mt-6 font-semibold hover:bg-red-500/10` |

---

### 2.18 `/streaks` ストリーク・バッジ

#### レイアウト構造（テキストワイヤーフレーム）

```
┌────────────────────────────────────┐
│  AppHeader: [← 戻る] [ストリーク]  │
├────────────────────────────────────┤
│  [ストリークメインカード]           │
│  🔥  現在の連続記録                │
│      14 日                         │
│  最長記録: 21日                    │
│                                    │
│  [月間カレンダー]                  │
│  Apr 2026                          │
│  月 火 水 木 金 土 日              │
│  ●  ●  ●  ●  ●  ●  ○           │
│  ...                               │
│                                    │
│  [バッジコレクション]               │
│  取得済み (3/7)                    │
│  ┌─────┐ ┌─────┐ ┌─────┐          │
│  │  🏆  │ │  ⚔️  │ │  🔥  │          │
│  │月間  │ │1週間 │ │3日  │          │
│  └─────┘ └─────┘ └─────┘          │
│  ┌─────┐ ┌─────┐ ┌─────┐          │
│  │🔒💎 │ │🔒📝 │ │🔒🤝 │          │
│  │100日 │ │記録魔│ │チーム│          │
│  └─────┘ └─────┘ └─────┘          │
└────────────────────────────────────┘
```

#### コンポーネント一覧

| コンポーネント名 | 役割 | 主要Tailwindクラス |
|----------------|------|--------------------|
| `StreakMainCard` | メインストリーク表示 | `card-base p-8 flex flex-col items-center gap-4 mb-6` |
| `StreakNumberLarge` | 大きなストリーク日数 | `text-8xl font-extrabold text-[var(--color-brand-primary)]` |
| `StreakCalendar` | 月間カレンダー表示 | `card-base p-4 mb-6` |
| `CalendarDay` | カレンダーの1日 | recorded: `w-9 h-9 rounded-full bg-[var(--color-brand-primary)] text-white font-semibold` / empty: `w-9 h-9 rounded-full text-zinc-500` / today: `ring-2 ring-[var(--color-brand-primary)]` |
| `BadgeCollection` | バッジコレクション | `card-base p-4` |
| `BadgeGrid` | バッジグリッド（2列） | `grid grid-cols-3 gap-4` |
| `StreakBadge` | 個別バッジ（取得済み/未取得） | acquired: `opacity-100` / locked: `opacity-30 grayscale` + `flex flex-col items-center gap-2 p-3 rounded-2xl bg-zinc-800` |
| `BadgeAcquiredOverlay` | バッジ取得時オーバーレイ（全画面） | `fixed inset-0 z-50 bg-zinc-950/95 flex flex-col items-center justify-center` |

---

## 3. 共通コンポーネント設計

### 3.1 AppHeader

**役割:** アプリ上部固定ヘッダー

```typescript
interface AppHeaderProps {
  title?: string;           // 画面タイトル（省略でFamNoteロゴ）
  showBack?: boolean;       // 戻るボタン表示
  onBack?: () => void;      // 戻るアクション（省略でrouter.back()）
  rightActions?: ReactNode; // 右側アクションボタン
}
```

**スタイル:**
```
固定ヘッダー: fixed top-0 left-0 right-0 z-40 h-14
背景:         bg-zinc-950/80 backdrop-blur-md
ボーダー:     border-b border-zinc-800
コンテンツ:   flex items-center px-4 gap-3
タイトル:     text-base font-semibold text-zinc-50 flex-1 text-center
戻るボタン:   w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-colors text-zinc-50
右側領域:     flex items-center gap-2
```

**デスクトップ（md:以上）:** サイドナビが表示されるため、`ml-64` でメインコンテンツをオフセット

---

### 3.2 BottomNav（モバイル5タブ）

**役割:** モバイル用ボトムナビゲーション

```typescript
interface BottomNavItem {
  icon: ReactNode;
  label: string;
  path: string;
  isCenter?: boolean;  // 中央ボタン（＋）
}
```

**タブ構成:**
```
1. ホーム     - House アイコン    - /dashboard
2. タイムライン - Users アイコン   - /timeline
3. ＋記録する  - Plus アイコン    - FABメニュー開閉（中央・強調）
4. ノート      - BookOpen アイコン - /notes
5. プロフィール - User アイコン    - /profile
```

**スタイル:**
```
コンテナ:       fixed bottom-0 left-0 right-0 z-40 h-16 md:hidden
背景:           bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800
グリッド:       flex items-center justify-around px-2
通常タブ:       flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl transition-colors
  active:       text-[var(--color-brand-primary)]
  inactive:     text-zinc-500
中央ボタン:     w-14 h-14 -mt-6 rounded-full bg-[var(--color-brand-primary)] shadow-lg shadow-[var(--color-brand-primary)]/30 flex items-center justify-center text-white
タブラベル:     text-xs font-medium
タブアイコン:   w-5 h-5
```

---

### 3.3 NoteCard

**役割:** 練習ノートのカード表示

```typescript
interface NoteCardProps {
  note: Note;
  author?: GroupMember;     // タイムラインで投稿者情報を表示する場合
  showAuthor?: boolean;     // 投稿者を表示するか（タイムライン: true, ノート一覧: false）
  compact?: boolean;        // コンパクト表示（ダッシュボードの最近の記録用）
  onClick?: () => void;
}
```

**レイアウト:**
```
card-base p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer

┌ ヘッダー ────────────────────────────────┐
│ [SportTag]  [条件バッジ]   [日付 右揃え] │
└──────────────────────────────────────────┘
  [著者行（showAuthor=trueの場合）]
┌ コンテンツ ──────────────────────────────┐
│ 練習内容テキスト（2行で省略）             │
└──────────────────────────────────────────┘
  [サムネイル最大3枚（imageUrls.length > 0の場合）]
┌ フッター ────────────────────────────────┐
│ 📍場所 / ⏱練習時間   [👏x][🔥x][⭐x][💪x]│
└──────────────────────────────────────────┘
```

**主要Tailwindクラス:**
```
カード外枠:     card-base p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer
ヘッダー行:     flex items-center gap-2 mb-2
コンテンツ:     text-zinc-300 text-sm line-clamp-2 mb-2
フッター:       flex items-center justify-between text-zinc-500 text-xs mt-2 pt-2 border-t border-zinc-800
メタ情報:       flex items-center gap-3
リアクション:   flex items-center gap-2
```

---

### 3.4 MatchCard

**役割:** 試合記録のカード表示

```typescript
interface MatchCardProps {
  match: Match;
  author?: GroupMember;
  showAuthor?: boolean;
  compact?: boolean;
  onClick?: () => void;
}
```

**レイアウト（NoteCardの差分）:**
```
ヘッダー: [SportTag]  [勝敗バッジ win/draw/loss]  [日付]
スコア行: [自チーム スコア] 対 [相手スコア] — [対戦相手名]
コンテンツ: ハイライトテキスト（2行省略）
```

**勝敗バッジスタイル:**
```
win:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
draw: 'bg-amber-500/20   text-amber-400   border border-amber-500/40'
loss: 'bg-red-500/20     text-red-400     border border-red-500/40'
+ rounded-full px-2 py-0.5 text-xs font-bold
```

---

### 3.5 GoalCard

**役割:** 目標のカード表示

```typescript
interface GoalCardProps {
  goal: Goal;
  onClick?: () => void;
}
```

**レイアウト:**
```
card-base p-4

┌ ヘッダー ────────────────────────────────────────────┐
│ [SportTag]  [GoalTypeBadge]     [期限: 残りN日 右揃え]│
└────────────────────────────────────────────────────────┘
  タイトル: text-base font-semibold text-zinc-50 mt-2
  詳細: text-sm text-zinc-400 mt-1 line-clamp-1
┌ 進捗 ──────────────────────────────────────────────┐
│ [GoalProgressBar] — 6/12回 (50%)                   │
└────────────────────────────────────────────────────┘
  [達成済みバッジ（status=completedの場合）]
```

**GoalTypeBadge スタイル:**
```
practice_count:    'bg-blue-500/20   text-blue-400   border border-blue-500/40'
match_appearance:  'bg-purple-500/20 text-purple-400 border border-purple-500/40'
skill_acquisition: 'bg-amber-500/20  text-amber-400  border border-amber-500/40'
+ rounded-full px-2 py-0.5 text-xs font-semibold
```

---

### 3.6 StreakBadge

**役割:** ストリーク・バッジの表示

```typescript
interface StreakBadgeProps {
  badge: {
    id: string;
    name: string;
    emoji: string;
    description: string;
    condition: string;
  };
  acquired: boolean;      // 取得済みか
  acquiredAt?: Timestamp; // 取得日時
  size?: 'sm' | 'md' | 'lg';
}
```

**スタイル:**
```
コンテナ: flex flex-col items-center gap-2 p-3 rounded-2xl bg-zinc-800
  acquired: opacity-100
  locked:   opacity-30 grayscale cursor-not-allowed

size='sm':  絵文字 text-3xl, ラベル text-xs
size='md':  絵文字 text-4xl, ラベル text-xs
size='lg':  絵文字 text-6xl, ラベル text-sm

ロックアイコン: 絵文字の右下に absolute w-5 h-5 bg-zinc-700 rounded-full text-xs
```

---

### 3.7 ReactionBar

**役割:** リアクションボタン4種

```typescript
interface ReactionBarProps {
  targetType: 'note' | 'match';
  targetId: string;
  reactionCounts: Record<ReactionType, number>;
  myReactions: ReactionType[];   // 自分がしたリアクション
  onToggle: (type: ReactionType) => void;
  loading?: boolean;
}
```

**スタイル:**
```
コンテナ: flex gap-2 flex-wrap

各リアクションボタン:
  ベース: flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all
  active（自分がリアクション済み）:
    bg-[color-mix(in_srgb,var(--color-brand-primary)_20%,transparent)]
    border-[var(--color-brand-primary)]
    text-[var(--color-brand-primary)]
  inactive:
    bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500

Framer Motion: reactionMotionProps（whileHover:1.1, whileTap:0.85）
```

---

### 3.8 SportTag

**役割:** スポーツ種目タグ

```typescript
interface SportTagProps {
  sport: Sport;
  size?: 'sm' | 'md';
  variant?: 'solid' | 'outline';
}
```

**スタイル（各スポーツの色はSPORT_COLORSに従う）:**
```
size='sm': text-xs px-2 py-0.5 rounded-full font-medium
size='md': text-sm px-3 py-1   rounded-full font-medium

variant='solid':
  bg-{sport.bg}/20 text-{sport.text} border border-{sport.border}/40

variant='outline':
  border border-{sport.border} text-{sport.text} bg-transparent

アイコン: スポーツ絵文字を左側に表示
  ⚽ サッカー / ⚾ 野球 / 🏀 バスケ / 🎾 テニス
  🏐 バレー  / 🏊 水泳 / 🏃 陸上  / ⚡ その他
```

---

### 3.9 SkeletonCard

**役割:** ローディング時のスケルトンUI

```typescript
interface SkeletonCardProps {
  type?: 'note' | 'match' | 'goal' | 'timeline';
  count?: number;   // 表示枚数（デフォルト: 1）
}
```

**スタイル:**
```
ベース要素: bg-zinc-800 rounded-xl animate-pulse

NoteCard スケルトン:
  card-base p-4
  ┌ 上部: h-4 w-1/4 rounded-full（SportTag部分）
  │ 右: h-4 w-1/5 rounded-full（日付部分）
  ├ 中部: h-4 w-full mt-3（テキスト行1）
  │      h-4 w-3/4 mt-2（テキスト行2）
  └ 下部: h-3 w-1/3 mt-3（メタ情報）

Tailwind: animate-pulse bg-zinc-800 rounded-xl
```

---

### 3.10 EmptyState

**役割:** データなし時の空状態表示

```typescript
interface EmptyStateProps {
  icon?: string;        // 絵文字アイコン（デフォルト: '📋'）
  title: string;        // タイトルテキスト
  description?: string; // 説明テキスト
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**スタイル:**
```
コンテナ: flex flex-col items-center justify-center py-20 px-4 text-center

アイコン: text-6xl mb-4 opacity-50
タイトル: text-lg font-semibold text-zinc-400 mb-2
説明:     text-sm text-zinc-500 max-w-xs leading-relaxed mb-6
ボタン:   btn-primary（actionがある場合）
```

---

### 3.11 PerformanceStars

**役割:** 5段階星評価UI

```typescript
interface PerformanceStarsProps {
  value: 1 | 2 | 3 | 4 | 5 | null;
  onChange?: (v: 1 | 2 | 3 | 4 | 5) => void; // 省略で読み取り専用
  size?: 'sm' | 'md' | 'lg';
}
```

**スタイル:**
```
コンテナ: flex gap-1

size='sm': text-lg
size='md': text-2xl
size='lg': text-3xl

filled star:   text-amber-400 (★)
empty star:    text-zinc-600  (☆)
interactive時: cursor-pointer hover:scale-110 transition-transform
```

---

### 3.12 ImageUploader

**役割:** 最大5枚の画像アップロード

```typescript
interface ImageUploaderProps {
  images: File[];               // アップロード待ちのFile
  existingUrls?: string[];      // 既存画像URL（編集時）
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  onRemoveExisting?: (url: string) => void;
  uploading?: boolean[];        // 各画像のアップロード中フラグ
  maxImages?: number;           // デフォルト: 5
}
```

**スタイル:**
```
グリッド: grid grid-cols-3 gap-2 (モバイル) / grid-cols-5 (md:)

サムネイル:
  relative aspect-square rounded-xl overflow-hidden bg-zinc-800
  border-2 border-zinc-700

AddButton（maxに達していない場合）:
  aspect-square rounded-xl border-2 border-dashed border-zinc-700
  flex flex-col items-center justify-center gap-1
  text-zinc-500 hover:border-[var(--color-brand-primary)]
  hover:text-[var(--color-brand-primary)] transition-colors cursor-pointer

進捗オーバーレイ:
  absolute inset-0 bg-zinc-900/70 flex items-center justify-center

削除ボタン:
  absolute top-1 right-1 w-6 h-6 rounded-full
  bg-zinc-900/80 text-zinc-300 hover:text-red-400
  flex items-center justify-center text-sm transition-colors

ドラッグ&ドロップ時:
  border-[var(--color-brand-primary)] bg-[color-mix(in_srgb,var(--color-brand-primary)_5%,transparent)]
```

---

### 3.13 ThemeSelector

**役割:** テーマ選択UI（設定画面）

（詳細は §4 参照）

---

## 4. テーマ選択UI仕様

### 4.1 概要レイアウト

```
┌──────────────────────────────────────────────┐
│ カラーテーマ                                  │
│ ─────────────────────────────────────────── │
│                                              │
│  現在: Shimizu  ●  (プレビュー)              │
│                                              │
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐  ← 5列グリッド    │
│  │●│ │●│ │●│ │🔒│ │🔒│                    │
│  └─┘ └─┘ └─┘ └─┘ └─┘                    │
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐                    │
│  │🔒│ │🔒│ │🔒│ │🔒│ │🔒│                    │
│  └─┘ └─┘ └─┘ └─┘ └─┘                    │
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐                    │
│  │🔒│ │🔒│ │🔒│ │🔒│ │🔒│                    │
│  └─┘ └─┘ └─┘ └─┘ └─┘                    │
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐                    │
│  │🔒│ │🔒│ │🔒│ │🔒│ │🔒│                    │
│  └─┘ └─┘ └─┘ └─┘ └─┘                    │
│                                              │
│  ※有料テーマを利用するには                  │
│    プレミアムプランへのアップグレードが必要です│
└──────────────────────────────────────────────┘
```

### 4.2 ThemeSelector コンポーネント

```typescript
interface ThemeSelectorProps {
  currentTheme: Theme;
  themes: Theme[];
  isPremium: boolean;       // ユーザーの課金ステータス
  onSelect: (themeId: string) => void;
  onUpgradeClick: () => void;
}
```

### 4.3 スウォッチグリッドスタイル

```
グリッド:     grid grid-cols-5 gap-3 p-4

スウォッチ（Swatch）:
  サイズ:     w-12 h-12 rounded-full relative cursor-pointer
  背景:       スウォッチ上半分 = primary色, 下半分 = secondary色
              background: linear-gradient(135deg, {primary} 50%, {secondary} 50%)
  選択中:     ring-2 ring-offset-2 ring-offset-zinc-900 ring-[var(--color-brand-primary)]
              + scale-110 transition-transform
  ホバー:     scale-105 transition-transform

ロックバッジ（isPremiumでない場合）:
  absolute bottom-0 right-0 w-5 h-5
  bg-zinc-800 rounded-full border border-zinc-700
  flex items-center justify-center
  text-amber-400 text-xs    ← 👑 クラウンアイコン

ロックされた（選択不可）スウォッチ:
  opacity-70 cursor-pointer（クリックでアップグレードモーダル）

現在のテーマ表示:
  flex items-center gap-2 mb-4 p-3 bg-zinc-800 rounded-xl
  選択中スウォッチ（小） + テーマ名 text-sm font-semibold text-zinc-50
```

### 4.4 テーマ選択時の挙動

```typescript
// 有料ユーザーが選択
onSelect(themeId) → ThemeContext.setTheme(themeId)
                  → CSS変数即時更新（リアルタイムプレビュー）
                  → localStorage保存
                  → Sonnerトースト「テーマを変更しました」

// 無料ユーザーがプレミアムテーマをクリック
→ UpgradeModal表示
```

### 4.5 アップグレード誘導モーダル

```
┌──────────────────────────────────────┐
│  👑                                  │
│  プレミアムテーマを利用するには       │
│  プランのアップグレードが必要です     │
│                                      │
│  Familyプラン ¥480/月から            │
│  ・全20種類のテーマが使い放題        │
│  ・グループメンバー最大10名          │
│  ・記録数無制限                      │
│                                      │
│  [プレミアムにアップグレード]         │
│  [キャンセル]                        │
└──────────────────────────────────────┘
```

**スタイル:**
```
オーバーレイ: fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4
モーダル:     w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 flex flex-col gap-4

クラウンアイコン: text-5xl text-amber-400 text-center
タイトル:     text-lg font-bold text-zinc-50 text-center
特典リスト:   flex flex-col gap-2 bg-zinc-800 rounded-xl p-4 text-sm text-zinc-300
特典行:       flex items-center gap-2 text-sm

アップグレードボタン: btn-primary w-full (Stripe連携 Phase 2)
キャンセルボタン: btn-secondary w-full
```

**アニメーション:**
```typescript
// モーダル出現
modal: { initial:{opacity:0,scale:0.9,y:10}, animate:{opacity:1,scale:1,y:0}, transition:{duration:0.2} }
// オーバーレイ
overlay: { initial:{opacity:0}, animate:{opacity:1} }
```

---

## 5. アクセシビリティ仕様

### 5.1 フォーカス管理

```css
/* グローバルフォーカスリング（すべてのインタラクティブ要素に適用） */
:focus-visible {
  outline: 2px solid var(--color-brand-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Tailwindクラスで表現する場合 */
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-[var(--color-brand-primary)]
focus-visible:ring-offset-2
focus-visible:ring-offset-zinc-950
```

### 5.2 タッチターゲット

```
すべてのタップ可能要素の最小サイズ: 44px × 44px
該当コンポーネント:
  - BottomNavタブ:   min-h-[44px] (flex-1)
  - ボタン全般:      min-h-[44px]
  - ReactionButton:  min-w-[44px] min-h-[44px]
  - SportButton:     min-h-[72px]（グリッド内）
  - ThemeSwatch:     w-12 h-12 = 48px（適合）
  - ImageRemoveButton: w-6 h-6 は小さいため padding でタップ領域拡張
    → p-2 追加で実質 40px（可能な限り 44px を目指す）
```

### 5.3 コントラスト比（WCAG AA）

```
テキスト（主）: zinc-50 (#fafafa) on zinc-950 (#09090b) = 18.1:1 ✓（AAA）
テキスト（副）: zinc-400 (#a1a1aa) on zinc-900 (#18181b) = 4.8:1 ✓（AA）
ブランドプライマリ（#E85513）on zinc-900 = 4.6:1 ✓（AA、大文字テキスト）
エラー red-400 (#f87171) on zinc-900 = 4.5:1 ✓（AA）
警告 amber-400 (#fbbf24) on zinc-900 = 8.1:1 ✓（AAA）

※プレミアムテーマに切り替えた場合、黄色系（Kashiwa #FFE500, Chiba #FFE400）は
  zinc-900背景上で小テキストにはコントラスト不足となるため、
  テキストはすべて large text（18px+）または bold で使用すること。
```

### 5.4 ARIAラベル

```typescript
// 必須ARIAラベルの付与箇所
<button aria-label="戻る">←</button>
<button aria-label={`${badge.name}バッジ、${acquired ? '取得済み' : '未取得'}`}>
<button aria-label={`${reactionType}リアクション、${count}件、${myReactions.includes(reactionType) ? '取り消す' : '追加する'}`}>
<input aria-label="招待コード N文字目" />
<div role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={target} aria-label="目標進捗" />
<nav aria-label="メインナビゲーション">  // BottomNav / SideNav
```

### 5.5 スクリーンリーダー対応

```typescript
// ローディング状態
<div role="status" aria-live="polite" aria-busy={isLoading}>
  {isLoading ? <SkeletonCard /> : <Content />}
</div>

// トースト通知（Sonner）
aria-live="polite" で実装済み（Sonnerデフォルト）

// 画像
<img alt={`${note.authorName}の練習写真 ${index + 1}枚目`} />
<img alt={`${sport}のスポーツアイコン`} />

// 絵文字の文字化け防止
<span aria-hidden="true">🔥</span>
<span className="sr-only">炎アイコン</span>
```

### 5.6 キーボード操作対応

```
Tab:       フォーカス移動（論理的な順序）
Shift+Tab: フォーカス逆移動
Enter / Space: ボタン・リンク実行
Escape:    モーダル・ダイアログ閉じる
Arrow keys: スポーツ選択グリッド内移動
            InviteCodeInput 各セル間移動

フォームの論理順序:
  1. スポーツ種目
  2. 日付
  3. 練習時間（NoteForm）
  4. 場所
  5. 今日の目標
  6. 練習内容
  7. 振り返り
  8. 体調
  9. 画像アップロード
  10. 公開設定
  11. 下書き保存
  12. 公開して保存
```

---

*本デザイン仕様書はGeneratorエージェントがそのままコードに変換できる粒度で記述しています。*
*不明点はDesignerエージェントまたはPlannerエージェントに確認してください。*
