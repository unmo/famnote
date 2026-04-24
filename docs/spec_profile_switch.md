# Netflixモデル・プロフィール切り替え機能 詳細仕様書

作成日: 2026-04-22  
対象フェーズ: 実装済み・テスト未整備（仕様の文書化および今後のテスト実装を目的とする）

---

## 1. 機能概要

### 1.1 目的・背景

FamNoteは家族向けスポーツ記録アプリであり、1つのGoogleアカウントで家族全員（保護者・子供）の記録を管理できることを設計目標とする。Netflixが1アカウントで複数プロフィールを提供するのと同様に、ログイン後にプロフィール選択画面を挟み、記録の書き込み・閲覧を「誰として行うか」を明示する仕組みを実装している。

### 1.2 ユースケース

| アクター | ユースケース |
|---------|------------|
| 保護者（owner） | 子供のプロフィールに切り替えて代わりに記録を入力する |
| 保護者（owner） | 管理者プロフィールで全メンバーのコメントを確認・記入する |
| 子供（member） | 自分のプロフィールを選んで練習ノートや試合記録を入力する |
| 全員 | アプリ使用中にヘッダーのドロップダウンから素早くプロフィールを切り替える |

### 1.3 ユーザーフロー

```
Googleログイン完了
    ↓
グループ参加済み？ ── No ──→ /onboarding/profile（グループ作成・参加）
    ↓ Yes
プロフィール選択済み（sessionStorage）？ ── No ──→ /select-profile
    ↓ Yes
/dashboard（メインアプリ）
    ↓
アプリ使用中にヘッダーのProfileSwitcherで随時切り替え可能
```

### 1.4 既存機能との関係

- `AuthContext` がFirestoreのメンバーサブコレクションをリアルタイム購読し、`groupStore.members` に反映する
- `profileStore.activeProfile` は選択中のプロフィールを保持し、記録作成時の `userId` フィールドに使用される
- `ProtectedRoute` の `requireProfile` ガードが、プロフィール未選択のままメインアプリに入ることを防ぐ
- 記録作成のFirestoreルールは `isGroupMemberProxy` 関数により、代理書き込みを許可する

---

## 2. データモデル

### 2.1 Firestoreコレクション構造

```
groups/{groupId}/
  └── members/{memberId}   ← プロフィール選択の対象
        uid: string          （ドキュメントIDと同じ）
        displayName: string
        avatarUrl: string | null
        sports: Sport[]
        joinedAt: Timestamp
        role: 'owner' | 'member'
        lastActiveAt: Timestamp | null
```

### 2.2 TypeScript型定義（確定済み）

```typescript
// src/types/group.ts

export interface GroupMember {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  sports: Sport[];
  joinedAt: Timestamp;
  role: 'owner' | 'member';
  lastActiveAt: Timestamp | null;
}
```

### 2.3 クライアント状態（Zustandストア）

#### profileStore（src/store/profileStore.ts）

| フィールド / アクション | 型 | 説明 |
|----------------------|---|------|
| `activeProfile` | `GroupMember \| null` | 現在選択中のプロフィール |
| `setActiveProfile(member)` | `(GroupMember) => void` | プロフィールを選択し sessionStorage にUIDを保存する |
| `clearActiveProfile()` | `() => void` | プロフィールをクリアし sessionStorage も削除する |
| `restoreFromSession(members)` | `(GroupMember[]) => void` | sessionStorage に保存されたUIDからプロフィールを復元する |

- sessionStorageキー: `famnote_active_profile_uid`
- タブを閉じると自動的にクリアされる（sessionStorageの仕様）
- sessionStorageが利用不可の環境では例外を無視して動作継続する

#### groupStore（src/store/groupStore.ts）

| フィールド / アクション | 型 | 説明 |
|----------------------|---|------|
| `group` | `Group \| null` | グループ情報 |
| `members` | `GroupMember[]` | 全メンバー一覧（AuthContextがリアルタイム更新） |

---

## 3. 画面仕様

### 3.1 ProfileSelectPage（/select-profile）

**目的:** ログイン後またはプロフィール切り替え要求時に、どのプロフィールとして使うかを選ばせる画面。

**レイアウト:**

```
[ロゴ（FamNote）]
[見出し: だれが使いますか？]
[説明文: プロフィールを選んでください]

[プロフィールカードグリッド（flex wrap、最大幅2xl）]
  各カード:
    - アバター画像（96x96px、rounded-xl）
      - 画像なし: User アイコン（zinc-500）
    - ownerの場合: 右上に Crown アイコンの amber バッジ
    - 表示名（text-sm、zinc-300）
    - ownerの場合: 「管理者」ラベル（amber-400）

[メンバー0件時: 「メンバーを読み込み中...」テキスト]
```

**アニメーション（Framer Motion）:**

| 要素 | 初期状態 | アニメーション |
|------|---------|-------------|
| ロゴ | opacity:0, y:-20 | フェードイン・スライドアップ（0.4s） |
| 見出し | opacity:0 | フェードイン（delay:0.1s） |
| 説明文 | opacity:0 | フェードイン（delay:0.2s） |
| グリッド全体 | opacity:0, y:20 | フェードイン・スライドアップ（delay:0.3s） |
| 各カード | opacity:0, scale:0.9 | delay:0.3 + index × 0.05s ずつずらす |
| カードホバー | scale:1.08 | whileHover |
| カードタップ | scale:0.96 | whileTap |

**インタラクション:**

- カードをクリック → `setActiveProfile(member)` → `/dashboard` にナビゲート
- カードのホバー時: border が `--color-brand-primary` 色に変化

**空状態:**
- `members.length === 0` のとき「メンバーを読み込み中...」を表示
- エラー状態・タイムアウト時の表示は現状未実装（未整備項目参照）

### 3.2 ProfileSwitcher（ヘッダー内ドロップダウン）

**目的:** アプリ使用中に現在のプロフィールを表示し、素早く切り替えられるUI。

**トリガーボタン:**

- 現在のプロフィールアバター（28x28px、rounded-full）
- 表示名（sm以上の画面幅で表示、最大80px、truncate）
- ChevronDown アイコン（開閉に応じて rotate-180）

**ドロップダウンリスト:**

- 幅: 192px（w-48）
- 各メンバー行:
  - アバター（32x32px）+ ownerバッジ（amber）
  - 表示名 + ownerの場合「管理者」サブテキスト（amber-500）
  - 選択中のメンバー: ブランドカラーで強調 + 右端に dot インジケーター
- 下部セパレーター以降: 「プロフィール選択画面へ」リンク（/select-profile に遷移）

**アニメーション（AnimatePresence）:**

- 開: opacity:0, y:-8, scale:0.96 → opacity:1, y:0, scale:1（0.15s）
- 閉: 逆アニメーション

**外側クリックで閉じる:**
- `useEffect` で `document.addEventListener('mousedown', handler)` を設定
- `ref.current.contains(e.target)` で内外を判定

---

## 4. ルーティング仕様

### 4.1 ルート定義（src/routes/index.tsx）

| パス | ガード条件 | 役割 |
|-----|-----------|------|
| `/onboarding/*` | `requireGroup=false`（グループ未参加） | オンボーディングフロー |
| `/select-profile` | `requireGroup=true` | プロフィール選択画面 |
| `/dashboard` 他 | `requireGroup=true`, `requireProfile=true` | メインアプリ（AppLayout） |

### 4.2 ProtectedRoute ガード条件詳細

```
初期化中（!isInitialized || isLoading）
    → ローディングスピナー表示

未認証（!firebaseUser）
    → /login にリダイレクト

requireGroup=true かつ groupId なし（!userProfile?.groupId）
    → /onboarding/profile にリダイレクト

requireGroup=false かつ groupId あり（グループ参加済み）
    → activeProfile があれば /dashboard
    → activeProfile がなければ /select-profile にリダイレクト

requireProfile=true かつ activeProfile なし
    → /select-profile にリダイレクト

上記以外
    → Outlet（子ルートを描画）
```

### 4.3 セッション復元フロー

1. `onAuthStateChanged` でログイン検出
2. `groups/{groupId}/members` サブコレクションをリアルタイム購読
3. メンバー一覧取得後に `restoreFromSession(members)` を呼び出す
4. sessionStorage の `famnote_active_profile_uid` が存在しメンバー一覧に含まれる場合、`activeProfile` を復元
5. 復元できない場合（sessionStorageなし・UIDがメンバー一覧にない）は `null` のまま → `/select-profile` に誘導

---

## 5. セキュリティ仕様

### 5.1 Firestoreセキュリティルール

#### グループメンバーの読み取り

```
match /groups/{groupId}/members/{memberId} {
  allow read: if isGroupMember(groupId);
  // → 同じグループのメンバーのみ読める（他グループから参照不可）
}
```

`isGroupMember` は `groups/{groupId}/members/{request.auth.uid}` の存在確認で判定する。

#### 代理書き込みルール（isGroupMemberProxy）

```javascript
function isGroupMemberProxy(groupId, targetUid) {
  return isAuthenticated() &&
    isGroupMember(groupId) &&
    exists(/databases/.../groups/$(groupId)/members/$(targetUid));
}
```

**意図:** 保護者が子供のプロフィールで記録を入力するユースケースに対応。  
**条件:** 書き込みリクエストをしているユーザー（request.auth.uid）と記録の所有者（data.userId）が同じグループのメンバーであることを確認する。

**代理書き込みが許可されるコレクション:**

| コレクション | 対象フィールド |
|------------|-------------|
| `notes` | `data.userId` |
| `matches` | `data.userId` |
| `matchJournals` | `data.userId` |
| `highlights` | `data.userId` |
| `goals` | `data.userId` |

#### セキュリティ上の注意点

- `members/{memberId}` の `create` は `memberId == request.auth.uid` のみ許可（自分自身のメンバードキュメントのみ作成可）
- `members/{memberId}` の `update` は `isOwner(memberId)` のみ（自分自身のプロフィールのみ更新可）
- Firestoreのクライアント側は `activeProfile.uid` を信頼するが、Firestoreルールで実際の認証UIDと書き込み先の整合性を担保

### 5.2 入力バリデーション

- `displayName`: Firestoreルール上の直接バリデーションなし（メンバードキュメント更新時に型チェックのみ）
- プロフィール選択画面自体に入力フォームはなく、選択操作のみのためインジェクション対策不要

### 5.3 認可の範囲

- プロフィール切り替え自体はクライアント状態の変更であり、Firestoreルールによるアクセス制御の対象外
- 記録作成・更新時に `isGroupMemberProxy` が実際の代理権限を確認する
- 「ownerだけが実行できる操作」（メンバー削除・グループ更新）はFirestoreルール `isGroupOwner` で保護

---

## 6. 未実装・不足項目

### 6.1 テスト（最優先）

| テスト種別 | 対象 | 状況 |
|-----------|------|------|
| ユニットテスト | `profileStore` | 未実装 |
| ユニットテスト | `useActiveProfile` | 未実装 |
| ユニットテスト | `ProtectedRoute`（requireProfile ガード） | 未実装 |
| E2Eテスト | ProfileSelectPage の選択フロー | 未実装 |
| E2Eテスト | ProfileSwitcher のドロップダウン切り替え | 未実装 |
| E2Eテスト | ブラウザリロード後のsessionStorage復元 | 未実装 |

### 6.2 アプリ内バッジ通知

- 背景：プッシュ通知なし・アプリ内バッジ（未読フラグ）方式を採用する方針
- 現状：未実装。通知を表示するUI・データモデルともに存在しない
- 要件例：
  - 親が子供の記録にコメントを追加したとき、子供のプロフィールにバッジ表示
  - 未読のコメント・リアクションの件数をProfileSwitcherのアバターに重ねて表示

### 6.3 ProfileSelectPage の空状態・エラー状態

- メンバーロード中のスケルトンUIが未実装（現状「読み込み中...」テキストのみ）
- Firestoreリスナーエラー時のフォールバック表示が未実装
- メンバーが自分1人の場合、プロフィール選択をスキップして自動選択する最適化が未実装

### 6.4 プロフィールPIN・パスコード保護

- 子供が別の人のプロフィールを勝手に選べてしまうことへの対策が未実装
- 要件として必要かどうかはユーザーヒアリングで確認が必要

### 6.5 lastActiveAt の更新

- `GroupMember.lastActiveAt` フィールドは定義されているが、プロフィール選択時に更新する処理が未実装

### 6.6 ドキュメント

- 本仕様書が初めての文書化。`docs/` ディレクトリがプロジェクトに存在しなかった

---

## 7. テスト観点

### 7.1 ユニットテスト（Vitest）

#### profileStore のテスト

| テストケース | 正常系/異常系 |
|------------|------------|
| `setActiveProfile` で `activeProfile` が更新されること | 正常系 |
| `setActiveProfile` で sessionStorage に UID が保存されること | 正常系 |
| `clearActiveProfile` で `activeProfile` が null になること | 正常系 |
| `clearActiveProfile` で sessionStorage の値が削除されること | 正常系 |
| `restoreFromSession` で sessionStorage の UID に一致するメンバーが復元されること | 正常系 |
| `restoreFromSession` でメンバー一覧に存在しない UID のとき null になること | 異常系 |
| `restoreFromSession` で sessionStorage が空のとき null になること | 異常系 |
| sessionStorage が利用不可（throw）のとき例外なく動作すること | 異常系 |

#### useActiveProfile のテスト

| テストケース | 正常系/異常系 |
|------------|------------|
| `activeProfile` が profileStore から取得されること | 正常系 |
| `members` が groupStore から取得されること | 正常系 |
| `isManager` が role === 'owner' のとき true を返すこと | 正常系 |
| `isManager` が role === 'member' のとき false を返すこと | 正常系 |
| `isManager` が `activeProfile === null` のとき false を返すこと | 正常系 |

#### ProtectedRoute のテスト

| テストケース | 正常系/異常系 |
|------------|------------|
| 未認証時に /login にリダイレクトされること | 正常系 |
| 初期化中にローディングスピナーが表示されること | 正常系 |
| `requireGroup=true` でグループなしのとき /onboarding/profile にリダイレクト | 正常系 |
| `requireProfile=true` でプロフィール未選択のとき /select-profile にリダイレクト | 正常系 |
| 全条件を満たすとき Outlet が描画されること | 正常系 |
| `requireGroup=false` でグループ参加済み・プロフィール選択済みのとき /dashboard にリダイレクト | 正常系 |
| `requireGroup=false` でグループ参加済み・プロフィール未選択のとき /select-profile にリダイレクト | 正常系 |

### 7.2 E2Eテスト（Playwright）

#### シナリオ1: ログイン後のプロフィール選択フロー

```
前提: テストユーザーがグループに所属・メンバーが2件以上存在
1. /login からGoogle認証を模擬ログイン
2. /select-profile が表示されること
3. 「だれが使いますか？」の見出しが表示されること
4. メンバー数分のプロフィールカードが表示されること
5. ownerメンバーのカードに Crown バッジが表示されること
6. いずれかのカードをクリックする
7. /dashboard に遷移すること
8. ヘッダーの ProfileSwitcher に選択したプロフィール名が表示されること
```

#### シナリオ2: ProfileSwitcher でのプロフィール切り替え

```
前提: プロフィール選択済みでダッシュボード表示中
1. ヘッダーのアバター・名前ボタンをクリック
2. ドロップダウンメニューが表示されること
3. 現在のプロフィールがブランドカラーでハイライトされること
4. 別のメンバーをクリックする
5. ドロップダウンが閉じること
6. ヘッダーの表示名が切り替わること
```

#### シナリオ3: ドロップダウンの外側クリックで閉じる

```
1. ProfileSwitcher のドロップダウンを開く
2. ドロップダウン以外の領域をクリックする
3. ドロップダウンが閉じること
```

#### シナリオ4: ブラウザリロード後のセッション復元

```
1. プロフィールを選択して /dashboard を表示
2. ブラウザをリロードする（F5）
3. /select-profile にリダイレクトされず /dashboard のままであること
4. ヘッダーに選択済みプロフィール名が表示されること
```

#### シナリオ5: 「プロフィール選択画面へ」リンク

```
1. ダッシュボードで ProfileSwitcher を開く
2. 「プロフィール選択画面へ」をクリックする
3. /select-profile に遷移すること
```

#### シナリオ6: タブを閉じてから再度開くとプロフィール選択が求められる

```
1. プロフィールを選択して /dashboard を表示
2. タブを閉じて新しいタブで /dashboard にアクセス
3. /select-profile にリダイレクトされること（sessionStorage がクリアされているため）
```

### 7.3 エッジケース

| ケース | 期待動作 |
|--------|---------|
| グループメンバーが1人のとき ProfileSelectPage が表示される | 1枚のカードが表示される（自動選択はしない） |
| メンバーのavatarUrlがnullのとき | User アイコン（フォールバック）が表示される |
| displayNameが非常に長い（40文字以上）とき | ProfileSwitcherでtruncateされる（最大80px） |
| activeProfileのUIDがメンバー一覧から削除された場合 | restoreFromSession が null を返し /select-profile に誘導される |
| 複数タブで異なるプロフィールを選択した場合 | sessionStorage はタブごとに独立するため各タブで別プロフィールになる（仕様） |

---

## 8. 変更対象ファイル（実装済み）

### 新規作成済み

| ファイル | 内容 |
|---------|------|
| `src/store/profileStore.ts` | アクティブプロフィール状態管理 |
| `src/hooks/useActiveProfile.ts` | プロフィール・isManagerを返すカスタムフック |
| `src/routes/app/ProfileSelectPage.tsx` | プロフィール選択画面 |
| `src/components/shared/ProfileSwitcher.tsx` | ヘッダー内プロフィール切り替えUI |

### 修正済み

| ファイル | 変更内容 |
|---------|---------|
| `src/contexts/AuthContext.tsx` | メンバーサブコレクションのリアルタイムリスナー追加・restoreFromSession呼び出し |
| `src/components/shared/ProtectedRoute.tsx` | `requireProfile` ガード追加 |
| `src/routes/index.tsx` | `/select-profile` ルート追加 |
| `firestore.rules` | `isGroupMemberProxy` 関数追加・代理書き込みルール追加 |

### 未作成（テスト）

| ファイル | 内容 |
|---------|------|
| `tests/unit/store/profileStore.test.ts` | profileStore のユニットテスト |
| `tests/unit/hooks/useActiveProfile.test.ts` | useActiveProfile のユニットテスト |
| `tests/unit/components/ProtectedRoute.test.tsx` | ProtectedRoute（requireProfile）のユニットテスト |
| `tests/e2e/profile-select.spec.ts` | プロフィール選択・切り替えのE2Eテスト |

---

## 9. 完了の定義

### 現在の状態（実装済み・テスト未整備）

- [x] `npm run build` が通ること
- [ ] profileStore のユニットテストがパスすること
- [ ] useActiveProfile のユニットテストがパスすること
- [ ] ProtectedRoute（requireProfile）のユニットテストがパスすること
- [ ] E2Eテスト（プロフィール選択・切り替えフロー）がパスすること

### 完了とみなす操作確認

1. Googleログイン後に `/select-profile` が表示される
2. プロフィールカードをクリックすると `/dashboard` に遷移する
3. ダッシュボードのヘッダーに選択したプロフィール名が表示される
4. ヘッダーのドロップダウンから別プロフィールに切り替えられる
5. ブラウザリロード後も選択済みプロフィールが維持される
6. タブを閉じて再度開くと `/select-profile` に誘導される
7. 子供のプロフィールで作成した記録の `userId` が子供の UID になっている（代理書き込み）
