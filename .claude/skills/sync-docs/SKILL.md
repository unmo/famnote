---
name: sync-docs
description: docs/以下のドキュメントを現在のコードベースと同期し、仕様書PDF(SkillSync_Specification.pdf)も再生成する。仕様変更・機能追加・設定変更の後に使う。
---

`docs/` 以下のドキュメントを現在のコードベースと照合し、古くなった情報を更新してください。

## 対象ドキュメントと照合元

| ドキュメント | 照合する情報源 |
|------------|-------------|
| `docs/task.md` | git log の最新コミット・実装済み機能 |
| `docs/test_spec.md` | `src/**/*.test.ts(x)` / `functions/src/**/*.test.ts` の一覧とテスト数 |
| `docs/deploy_guide.md` | `firebase/firestore.rules` の内容 |
| `docs/firebase_setup_guide.md` | `firebase.json` / `firestore.rules` の構成 |

## 手順

### 1. 変更範囲の特定

直近の変更を確認し、どのドキュメントに影響するか判断する：

```bash
git log --oneline -10
git diff HEAD~1 --name-only
```

### 2. 各ドキュメントの照合と更新

#### docs/task.md
- 「進行中のタスク」に残っているが、git log から完了が確認できるものを `✅ 完了したタスク` に移す
- 新たに実装された機能・修正をカテゴリ別に `完了したタスク` へ追記する

#### docs/test_spec.md（自動テストセクション）
以下を実行してテストファイル一覧と件数を取得し、セクション12を書き直す：

```bash
# フロントエンドのテストファイル一覧
find src -name "*.test.ts" -o -name "*.test.tsx" | sort

# Cloud Functions のテストファイル一覧
find functions/src -name "*.test.ts" | sort

# テスト件数（実行して確認）
npm run test:all 2>&1 | tail -20
```

#### docs/deploy_guide.md（Firestore ルールセクション）
`firebase/firestore.rules` の内容をそのままコピーして、手順6のコードブロックを置き換える。

### 3. 更新しない情報

以下は変更しないこと：
- 手動テストのテストケース表（#1〜#68）— 仕様が変わった場合や追加になった場合は修正、追加すること
- デプロイ手順のステップ（GCP 設定・GitHub Secrets 登録など）— 構成変更時のみ更新
- Stripe テストカード番号

### 4. 仕様書 PDF の再生成

ドキュメントを更新したら、仕様書 PDF を必ず再生成してください：

```bash
npm run generate-spec
```

生成物:
- `docs/SkillSync_Specification.html` — スタイル付き HTML（参照用）
- `docs/SkillSync_Specification.pdf` — 最終仕様書 PDF（A4・ページ番号付き）

**スクリプト内で手動同期が必要な箇所（コードベース変更時は合わせて更新すること）:**
- `scripts/generate-spec.mjs` 内の `PLANS` 配列 — プラン名・価格・制限値が `src/lib/planLimits.ts` と一致しているか確認
- `scripts/generate-spec.mjs` 内の `collections` 配列 — Firestoreコレクションが `firebase/firestore.rules` と一致しているか確認
- 新しい画面が追加された場合は `pages` 配列にワイヤーフレームを追加

### 5. 完了報告

更新したファイルと変更箇所を箇条書きで報告してください。変更がなかったファイルも「変更なし」と明記すること。PDF の生成成否も必ず報告する。
