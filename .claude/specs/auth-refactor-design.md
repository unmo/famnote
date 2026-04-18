# デザイン仕様書: 認証フロー リデザイン (auth-refactor-design)

作成日: 2026-04-18
フェーズ: Designer 完了
参照仕様書: `.claude/specs/auth-refactor.md`
デザイン方針: FamNote独自のプレミアムUI（SkillSyncの画面遷移・インタラクション構造を踏襲しつつビジュアルを刷新）

---

## 1. デザインコンセプト

### ビジュアルコンセプト
「家族の絆、スポーツの情熱」を表現する。背景にはフィールドのラインを想起させる繊細なグリッドパターンと、ブランドカラーの温かみのあるグロー。静謐なダーク背景の上に、家族をつなぐ温かさを演出する。

### カラーフィーリング
- プライマリ（#E85513 オレンジ）: 情熱・エネルギー・スポーツ
- セカンダリ（#00133F ネイビー）: 信頼・深み・家族の安心感
- 背景ダーク: 落ち着いた没入感

### SkillSyncとの同線
- 画面構造: 全画面ダーク背景 + 中央グラスカード + フッター
- インタラクション: カードホバーシャイン、ボタンシマー、Framer Motionフェードイン
- 1ボタン完結: Googleログインのみ

---

## 2. 画面レイアウト仕様

### 対象画面: `/login` (LoginPage)

#### ワイヤーフレーム

```
┌────────────────────────────────────────────────────────────┐
│  bg-zinc-950  全画面背景                                     │
│                                                            │
│  ░░ フィールドグリッドパターン（SVGオーバーレイ、opacity:0.03） ░░  │
│                                                            │
│       ◯ ブランドオレンジグロー（左上、blur-[160px]）           │
│                          ◯ ネイビーグロー（右下）              │
│              ◯ グリーングロー（中央下）                        │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  グラスカード（backdrop-blur-3xl）                     │  │
│  │  上部アクセントライン（グラデーション）                  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  [家族アイコン]  FamNote   [オンラインバッジ]   │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                      │  │
│  │  家族の記録を、                                       │  │
│  │  ひとつの場所に。  ←グラデーションテキスト              │  │
│  │                                                      │  │
│  │  スポーツに励む子供の成長を、                          │  │
│  │  家族みんなで記録・応援しよう                          │  │
│  │                                                      │  │
│  │  ─────────────── 機能バッジ行 ───────────────        │  │
│  │  [記録] [共有] [応援]                                 │  │
│  │                                                      │  │
│  │  [エラーバナー（エラー時のみ）]                        │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────┐       │  │
│  │  │  [G]  Googleでログイン / 登録              │       │  │
│  │  └──────────────────────────────────────────┘       │  │
│  │                                                      │  │
│  │  プライバシーポリシーと利用規約に同意の上ご利用ください  │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│              POWERED BY FAMNOTE                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### グリッドレイアウト

| ブレークポイント | カード幅 | 横パディング |
|---------------|--------|-----------|
| モバイル (< 640px) | `w-full` | `px-4` |
| sm (>= 640px) | `max-w-lg` | `px-6` |
| md以上 | `max-w-lg` | `px-6` |

#### スペーシング

```
外部コンテナ:      relative z-10 w-full max-w-lg px-4 sm:px-6 flex flex-col items-center
カード内:          p-8 sm:p-10
ロゴブロック下:    mb-10
ヘッドライン下:    mb-4
サブタイトル下:    mb-8
機能バッジ行下:    mb-8
ボタン下:          mb-6
利用規約テキスト下: mb-0
フッター上:        mt-8
```

---

## 3. コンポーネント設計

### 3-1. LoginPage コンポーネント

#### ファイルパス
`src/routes/auth/LoginPage.tsx`

#### 内部状態

```typescript
interface LoginPageState {
  error: string;
  isLoading: boolean;
}
```

#### 全体Tailwindクラス

```
// 背景ラッパー
"relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 text-white"
```

#### Framer Motionアニメーション（ページ全体）

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
```

---

### 3-2. 背景レイヤー

背景は3層構造で構成する。

#### 層1: フィールドグリッドSVGパターン

```tsx
// サッカー/スポーツフィールドを想起させる細いグリッド線
<div
  className="absolute inset-0 opacity-[0.03] pointer-events-none"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3Ccircle cx='30' cy='30' r='10'/%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: '60px 60px',
  }}
/>
```

#### 層2: アンビエントグロー（3点）

```tsx
// グロー1: ブランドプライマリ（オレンジ、左上）
<div
  className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[160px] animate-pulse"
  style={{
    background: 'radial-gradient(circle, rgba(232,85,19,0.25) 0%, transparent 70%)',
    animationDuration: '6000ms',
  }}
/>

// グロー2: ブランドセカンダリ（ネイビー、右下）
<div
  className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] animate-pulse"
  style={{
    background: 'radial-gradient(circle, rgba(0,19,63,0.4) 0%, transparent 70%)',
    animationDuration: '8000ms',
    animationDelay: '2s',
  }}
/>

// グロー3: グリーン（中央下）
<div
  className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full blur-[120px]"
  style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)' }}
/>
```

#### 層3: ノイズオーバーレイ

```tsx
<div
  className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
  style={{
    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")',
  }}
/>
```

---

### 3-3. グラスカード コンポーネント

SkillSyncより透過度を高め、上部にブランドカラーのアクセントラインを追加して差別化する。

#### Tailwindクラス

```
"backdrop-blur-3xl bg-white/[0.04] border border-white/[0.09] p-8 sm:p-10 w-full rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500"
```

#### 上部アクセントライン（FamNote独自要素）

```tsx
// カード上部のグラデーションライン（高さ1px）
<div
  className="absolute top-0 left-0 right-0 h-px"
  style={{
    background: 'linear-gradient(to right, transparent, var(--color-brand-primary), rgba(251,191,36,0.8), transparent)',
  }}
/>
```

#### カード内シャインオーバーレイ

```tsx
<div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
```

#### カード底部グロー（ホバー時に強調）

```tsx
<div
  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
  style={{ background: 'var(--color-brand-primary)', opacity: 0 }}
/>
```

---

### 3-4. ブランドロゴブロック

SkillSyncよりアイコンを大きく、バッジ要素を追加して情報密度を上げる。

#### 構造

```tsx
<div className="flex items-center justify-between mb-10">
  <div className="flex items-center gap-4">
    {/* アイコン */}
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-500 relative"
      style={{
        background: 'linear-gradient(135deg, var(--color-brand-primary), #f97316)',
        boxShadow: '0 8px 24px -4px rgba(232,85,19,0.4)',
      }}
    >
      {/* アイコン内部にさらにシャイン */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
      <Users className="w-7 h-7 text-white relative z-10" />
    </div>

    {/* ブランド名 */}
    <div>
      <h1 className="text-2xl font-black tracking-tight text-white">
        FamNote
      </h1>
      <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase">
        Family Sports Record
      </p>
    </div>
  </div>

  {/* オンラインバッジ（FamNote独自） */}
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
    <span className="text-[10px] font-semibold text-green-400 tracking-wide">ONLINE</span>
  </div>
</div>
```

---

### 3-5. ヘッドライン・サブタイトルブロック

#### 構造

```tsx
<div className="mb-8">
  <h2 className="text-3xl sm:text-[2.5rem] font-extrabold tracking-tight leading-[1.15] mb-4">
    <span className="block text-white">家族の記録を、</span>
    <span
      className="block text-transparent bg-clip-text"
      style={{
        backgroundImage: 'linear-gradient(135deg, var(--color-brand-primary) 0%, #f97316 40%, #fbbf24 100%)',
      }}
    >
      ひとつの場所に。
    </span>
  </h2>
  <p className="text-zinc-400 text-sm sm:text-base font-medium leading-relaxed">
    スポーツに励む子供の成長を、<br className="hidden sm:block" />
    家族みんなで記録・応援しよう
  </p>
</div>
```

#### タイポグラフィ詳細

| 要素 | モバイル | sm以上 | フォントウェイト | カラー |
|------|--------|-------|--------------|------|
| ヘッドライン通常 | text-3xl | text-[2.5rem] | font-extrabold | text-white |
| ヘッドラインアクセント | 同上 | 同上 | font-extrabold | グラデーション（ブランドプライマリ→オレンジ→アンバー） |
| サブタイトル | text-sm | text-base | font-medium | text-zinc-400 |

---

### 3-6. 機能バッジ行（FamNote独自要素）

SkillSyncにはない要素。FamNoteの主要機能を3つのバッジで表示し、価値訴求を強化する。

#### 構造

```tsx
<div className="flex items-center gap-2 flex-wrap mb-8">
  {[
    { icon: ClipboardList, label: '成長記録' },
    { icon: Share2,        label: '家族共有' },
    { icon: Heart,         label: '応援機能' },
  ].map(({ icon: Icon, label }) => (
    <div
      key={label}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 text-xs font-medium"
    >
      <Icon className="w-3 h-3" />
      {label}
    </div>
  ))}
</div>
```

#### 使用するlucide-reactアイコン

```typescript
import { Users, ClipboardList, Share2, Heart } from "lucide-react";
```

---

### 3-7. エラーバナー コンポーネント

#### Props定義

```typescript
interface ErrorBannerProps {
  message: string;
}
```

#### 構造（AnimatePresenceで高さアニメーション）

```tsx
<AnimatePresence>
  {error && (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-md overflow-hidden"
    >
      <div className="flex items-start gap-3 text-red-400">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <span className="text-sm font-medium" role="alert">{error}</span>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

追加インポート:
```typescript
import { AlertCircle } from "lucide-react";
```

---

### 3-8. Googleログインボタン コンポーネント

SkillSyncのシマーエフェクトを維持しつつ、ブランドカラーの微細なグラデーションボーダーを追加してFamNote感を強調する。

#### Props定義

```typescript
interface GoogleLoginButtonProps {
  onClick: () => void;
  isLoading: boolean;
}
```

#### 状態パターン

| 状態 | 変化内容 |
|------|---------|
| default | `bg-white/[0.06]`、`border-white/[0.12]` |
| hover | `bg-white/[0.10]`、`border-white/[0.22]`、シマー発動、グロー強化 |
| active | `scale-[0.98]` |
| loading | スピナー表示、テキスト「ログイン中...」、`disabled` |
| disabled | `opacity-50 cursor-not-allowed`、シマー無効化 |

#### Tailwindクラス

```
// ボタン本体
"relative w-full flex items-center justify-center py-4 px-6 rounded-2xl font-semibold text-white text-base bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.10] hover:border-white/[0.22] transition-all duration-300 overflow-hidden group/btn hover:shadow-[0_0_40px_-8px_rgba(232,85,19,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"

// シマー（左→右に白光が流れる）
"absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent -translate-x-[200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none"
```

ホバー時のシャドウはSkillSyncの白ではなくブランドオレンジをベースにしてFamNote感を出す点がポイント。

#### Framer Motionアニメーション

```typescript
<motion.button
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.1 }}
  onClick={handleLogin}
  disabled={isLoading}
  aria-busy={isLoading}
  aria-label={isLoading ? 'ログイン処理中' : 'Googleでログイン / 登録'}
>
```

#### ローディングスピナー

```tsx
{isLoading ? (
  <motion.svg
    className="w-5 h-5 mr-3 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    aria-hidden="true"
  >
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </motion.svg>
) : (
  <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    {/* Googleカラーアイコン（公式SVGパス） */}
  </svg>
)}
```

---

### 3-9. 利用規約テキスト（FamNote独自要素）

```tsx
<p className="text-center text-xs text-zinc-600 leading-relaxed mt-5">
  ご利用により
  <a href="/privacy" className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors duration-200 mx-1">
    プライバシーポリシー
  </a>
  と
  <a href="/terms" className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors duration-200 mx-1">
    利用規約
  </a>
  に同意したものとみなします
</p>
```

---

### 3-10. フッター コンポーネント

```tsx
<motion.div
  className="mt-8 text-center"
  initial={{ opacity: 0 }}
  animate={{ opacity: 0.5 }}
  transition={{ delay: 0.4, duration: 0.4 }}
>
  <p className="text-[10px] text-zinc-500 font-bold tracking-[0.25em] uppercase">
    POWERED BY FAMNOTE
  </p>
</motion.div>
```

---

## 4. インタラクション仕様

### 4-1. ホバー・クリック挙動

| 要素 | ホバー挙動 | クリック挙動 |
|------|----------|-----------|
| カード | ボーダー濃化（`border-white/[0.15]`）、シャインオーバーレイ表示、底部グロー出現 | なし |
| ロゴアイコン | `scale-105`（カードの `group` クラスで制御） | なし |
| Googleボタン | シマーエフェクト、ブランドオレンジグロー、背景濃化 | `scale-[0.98]` |
| 利用規約リンク | `text-zinc-400 → text-white` フェード | ページ遷移 |

### 4-2. ページ遷移アニメーション

```typescript
// ページ全体
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, ease: "easeOut" }}

// フッター（遅延フェードイン）
initial={{ opacity: 0 }}
animate={{ opacity: 0.5 }}
transition={{ delay: 0.4, duration: 0.4 }}
```

### 4-3. トースト通知（Sonner）

| タイミング | メッセージ | 種別 |
|-----------|----------|------|
| 認証失敗 | 「Googleログインに失敗しました。再度お試しください。」 | `toast.error()` |
| ネットワークエラー | 「接続エラーが発生しました。通信環境をご確認ください。」 | `toast.error()` |
| Firestore作成失敗 | 「データの初期化に失敗しました。再度お試しください。」 | `toast.error()` |

カード内エラーバナーとSonnerトーストは両方表示する（バナーは操作継続を示し、Sonnerは即時フィードバック）。

### 4-4. ローディング中の挙動フロー

1. ボタンクリック → `isLoading = true`、`error = ""`
2. ボタン: スピナー表示、テキスト「ログイン中...」、`disabled` 設定
3. Googleポップアップ表示（ブラウザ制御）
4. 成功 → `useAuth.loginWithGoogle()` がリダイレクト処理
5. 失敗 → `error` stateにメッセージ、Sonnerトースト、`isLoading = false`
6. ポップアップキャンセル（`auth/popup-closed-by-user`）→ `error` なし、`isLoading = false`（静かな失敗）

---

## 5. ダークモード対応

本実装はダークモード固定のため `dark:` プレフィックスは不要。

| 要素 | カラー値 |
|------|--------|
| 背景 | `bg-zinc-950` (#09090b) |
| カード背景 | `bg-white/[0.04]` |
| カードボーダー | `border-white/[0.09]` → hover: `border-white/[0.15]` |
| テキスト主 | `text-white` |
| テキスト副 | `text-zinc-400` |
| テキスト弱 | `text-zinc-500`, `text-zinc-600` |
| エラーテキスト | `text-red-400` |
| エラーバナー背景 | `bg-red-500/10` |
| エラーバナーボーダー | `border-red-500/20` |
| バッジ背景 | `bg-white/[0.05]` |
| バッジボーダー | `border-white/[0.08]` |
| ONLINEバッジ | `bg-green-500/10 border-green-500/20` |

---

## 6. モバイル対応仕様

### ブレークポイント別変化

| ブレークポイント | カード角丸 | パディング | ヘッドライン | ヘッドライン改行 |
|---------------|---------|---------|-----------|--------------|
| デフォルト (< 640px) | `rounded-[2rem]` | `p-8` | `text-3xl` | `flex-col`（縦積み） |
| sm (>= 640px) | `rounded-[2.5rem]` | `p-10` | `text-[2.5rem]` | `block` |

### タッチ操作の考慮

- Googleボタン高さ: `py-4` で56px以上（タップターゲット44px基準を超える）
- ボタン幅: `w-full`（全幅タップエリア）
- 利用規約リンク: テキスト間に `mx-1` でタップ余裕を確保
- `active:scale-[0.98]` でタッチフィードバック

### モバイル向け調整

```
// サブタイトルの<br>はsmでのみ表示
<br className="hidden sm:block" />

// 機能バッジはflex-wrapで折り返し対応
<div className="flex items-center gap-2 flex-wrap">
```

---

## 7. 空状態・ローディング・エラー状態

### ページ初期ローディング

LoginPageはAuthContextが `loading: false` を返してからレンダリングされる前提（ProtectedRoute / AuthGuardで制御）。
ページ自体のスケルトンは不要。

### ボタンローディング状態

```tsx
// isLoading=true時のボタン内容
<motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
  {/* スピナー */}
</motion.svg>
<span>ログイン中...</span>
```

### エラー状態（AnimatePresence）

高さが0からautoにアニメーションして表示される。ユーザーが再試行するとフェードアウト（`error = ""`でexitアニメーション）。

---

## 8. アクセシビリティ

### コントラスト比（WCAG AA準拠）

| テキスト | 推定コントラスト比 | 判定 |
|---------|----------------|------|
| white on zinc-950 | 19.6:1 | AA合格 |
| zinc-400 on zinc-950 | 5.1:1 | AA合格（通常テキスト） |
| red-400 on zinc-950 | 4.8:1 | AA合格（通常テキスト） |
| green-400 on zinc-950 | 6.2:1 | AA合格 |
| ヘッドラインアクセント（グラデーション） | 装飾的扱い、非テキスト情報なし | 許容 |

### フォーカス表示

```
// Googleボタンのフォーカスリング
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950

// リンクのフォーカスリング
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:rounded-sm
```

### aria属性

```tsx
<main role="main" aria-label="FamNoteログインページ">

// エラーバナー
<span role="alert" aria-live="assertive">{error}</span>

// ローディング中ボタン
<button aria-busy={isLoading} aria-label={isLoading ? 'ログイン処理中' : 'Googleでログイン'}>

// 装飾SVG
<svg aria-hidden="true" focusable="false">
```

---

## 9. i18n対応

### 翻訳キー（`src/i18n/ja/auth.json` に追加）

```json
{
  "loginWithGoogle": "Googleでログイン / 登録",
  "loggingIn": "ログイン中...",
  "loginFailed": "Googleログインに失敗しました。再度お試しください。",
  "networkError": "接続エラーが発生しました。通信環境をご確認ください。",
  "firestoreError": "データの初期化に失敗しました。再度お試しください。",
  "privacyPolicy": "プライバシーポリシー",
  "termsOfService": "利用規約",
  "termsNotice": "ご利用により{{privacyPolicy}}と{{termsOfService}}に同意したものとみなします"
}
```

```json
// src/i18n/ja/login.json に追加
{
  "headline": "家族の記録を、",
  "headlineAccent": "ひとつの場所に。",
  "subtitle": "スポーツに励む子供の成長を、家族みんなで記録・応援しよう",
  "footer": "POWERED BY FAMNOTE",
  "brandTagline": "Family Sports Record",
  "featureRecord": "成長記録",
  "featureShare": "家族共有",
  "featureSupportCheer": "応援機能",
  "onlineStatus": "ONLINE"
}
```

---

## 10. CSS変数の前提条件

LoginPageレンダリング前に以下がグローバルCSS（`index.css`）に定義済みであること：

```css
:root {
  --color-brand-primary: #E85513;
  --color-brand-secondary: #00133F;
}
```

テーマ切替（J1チームカラー）時もCSS変数が更新されれば自動でグロー・ボタンシャドウ・グラデーションが追従する。

---

## 11. 完全なコンポーネント骨格（Generatorへの実装ガイド）

```tsx
// src/routes/auth/LoginPage.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, ClipboardList, Share2, Heart, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const FEATURE_BADGES = [
  { icon: ClipboardList, key: "featureRecord" },
  { icon: Share2,        key: "featureShare" },
  { icon: Heart,         key: "featureSupportCheer" },
] as const;

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(["login", "auth"]);

  useEffect(() => {
    if (user) {
      navigate(user.groupId ? "/dashboard" : "/onboarding/profile", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      // auth/popup-closed-by-user は静かに失敗
      const code = (err as { code?: string }).code;
      if (code === "auth/popup-closed-by-user") {
        setIsLoading(false);
        return;
      }
      const message = t("auth:loginFailed");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.main
      role="main"
      aria-label={t("login:pageLabel", "FamNoteログインページ")}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 text-white"
    >
      {/* 背景レイヤー: グリッド・グロー・ノイズ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* グリッドパターン */}
        {/* グロー3点 */}
        {/* ノイズオーバーレイ */}
      </div>

      <div className="relative z-10 w-full max-w-lg px-4 sm:px-6 flex flex-col items-center">
        {/* グラスカード */}
        <div className="backdrop-blur-3xl bg-white/[0.04] border border-white/[0.09] p-8 sm:p-10 w-full rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500">

          {/* カード上部アクセントライン */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--color-brand-primary), rgba(251,191,36,0.8), transparent)' }} />

          {/* カードシャインオーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* ブランドロゴブロック */}
          <div className="flex items-center justify-between mb-10">
            {/* ロゴ + ブランド名 */}
            {/* ONLINEバッジ */}
          </div>

          {/* ヘッドライン・サブタイトル */}
          <div className="mb-8">
            {/* h2 ヘッドライン */}
            {/* p サブタイトル */}
          </div>

          {/* 機能バッジ行 */}
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {FEATURE_BADGES.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 text-xs font-medium">
                <Icon className="w-3 h-3" aria-hidden="true" />
                {t(`login:${key}`)}
              </div>
            ))}
          </div>

          {/* エラーバナー */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-md overflow-hidden"
              >
                <div className="flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium" role="alert">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Googleログインボタン */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            onClick={handleLogin}
            disabled={isLoading}
            aria-busy={isLoading}
            aria-label={isLoading ? t("auth:loggingIn") : t("auth:loginWithGoogle")}
            className="relative w-full flex items-center justify-center py-4 px-6 rounded-2xl font-semibold text-white text-base bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.10] hover:border-white/[0.22] transition-all duration-300 overflow-hidden group/btn hover:shadow-[0_0_40px_-8px_rgba(232,85,19,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            {/* シマーエフェクト */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent -translate-x-[200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none" />

            {/* アイコン（スピナー or Google SVG） */}
            {/* テキスト */}
          </motion.button>

          {/* 利用規約テキスト */}
          <p className="text-center text-xs text-zinc-600 leading-relaxed mt-5">
            ご利用により
            <Link to="/privacy" className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors duration-200 mx-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:rounded-sm">
              {t("auth:privacyPolicy")}
            </Link>
            と
            <Link to="/terms" className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors duration-200 mx-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:rounded-sm">
              {t("auth:termsOfService")}
            </Link>
            に同意したものとみなします
          </p>
        </div>

        {/* フッター */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <p className="text-[10px] text-zinc-500 font-bold tracking-[0.25em] uppercase">
            {t("login:footer")}
          </p>
        </motion.div>
      </div>
    </motion.main>
  );
}
```
