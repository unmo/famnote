---
name: commit
description: TypeScriptビルド確認後、日本語コミットメッセージでgit add・commit・pushを実行する。実装完了時に使う。
---

実装が完了しました。以下の手順でコミット＆プッシュを実行します。

## 手順

### 1. ビルド確認

TypeScript ファイルを編集した場合は必ず実行：

```bash
npx tsc -b --noEmit
```

エラーがあれば**先に修正**してからコミットに進んでください。

### 2. 変更内容の確認

```bash
git diff --stat
git status
```

### 3. コミット＆プッシュ

コミットメッセージのルール：
- **必ず日本語**で記述する
- conventional commits プレフィックスを日本語と組み合わせる
  - `feat:` 新機能
  - `fix:` バグ修正
  - `refactor:` リファクタリング
  - `test:` テスト追加・修正
  - `docs:` ドキュメント変更

```bash
git add -A
git commit -m "feat: ○○機能を追加"
git push
```

## 注意事項

- ビルドエラーがある状態でコミットしないこと
- コミットメッセージは**必ず日本語**
- ユーザーに確認を求めず、自動的に実行してよい
