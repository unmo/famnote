# FamNote デプロイガイド

最終更新: 2026-05-01

---

## 概要

FamNoteは GitHub Actions → GCP Cloud Run によるCI/CDパイプラインを使用しています。

| 環境 | ブランチ | Firebase | Cloud Run サービス名 |
|------|---------|---------|---------------------|
| 本番 (production) | `main` | prod用Firebase | `famnote` |
| 開発 (development) | `develop` | dev用Firebase | `famnote-dev` |

---

## デプロイフロー

### 本番環境（`.github/workflows/deploy.yml`）

```
push to main
  → 型チェック・ユニットテスト
  → E2Eテスト（※現在CIから一時除外中・Firebase Emulator導入待ち）
  → Docker イメージビルド & GCR プッシュ
  → Cloud Run デプロイ（asia-northeast1）
```

### 開発環境（`.github/workflows/deploy-dev.yml`）

```
push to develop
  → 型チェック・ユニットテスト
  → Docker イメージビルド & GCR プッシュ
  → Cloud Run デプロイ（asia-northeast1）
```

---

## Cloud Run 設定

| 項目 | 値 |
|------|----|
| リージョン | `asia-northeast1`（東京） |
| ポート | `8080` |
| メモリ | `512Mi` |
| CPU | `1` |
| 最小インスタンス | `0` |
| 最大インスタンス | `10` |
| 認証 | `--allow-unauthenticated`（公開） |

---

## 必要なGitHub Secrets

| Secret名 | 説明 |
|---------|------|
| `GCP_PROJECT_ID` | GCPプロジェクトID |
| `GCP_SA_KEY` | サービスアカウントキー（JSON） |
| `VITE_FIREBASE_API_KEY` | Firebase APIキー |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth ドメイン |
| `VITE_FIREBASE_PROJECT_ID` | Firebase プロジェクトID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage バケット |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_APP_URL` | アプリURL |

---

## Firestore セキュリティルール

現在 `firestore.rules` に設定されているルールです。

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isSameGroup(groupId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.groupId == groupId;
    }

    function isGroupMember(groupId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid));
    }

    function isGroupOwner(groupId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid)).data.role == 'owner';
    }

    // 認証ユーザーが指定uidのグループメンバーの代理で書けるか検証
    // 条件: 書き込みユーザーと対象uidが同じグループに所属している
    function isGroupMemberProxy(groupId, targetUid) {
      return isAuthenticated() &&
        isGroupMember(groupId) &&
        exists(/databases/$(database)/documents/groups/$(groupId)/members/$(targetUid));
    }

    function isValidNote(data) {
      return data.content is string && data.content.size() > 0 && data.content.size() <= 1000 &&
             data.sport in ['soccer', 'baseball', 'basketball', 'tennis', 'volleyball', 'swimming', 'athletics', 'other'] &&
             data.isPublic is bool &&
             data.isDraft is bool;
    }

    function isValidMatch(data) {
      return data.opponent is string && data.opponent.size() > 0 &&
             data.sport in ['soccer', 'baseball', 'basketball', 'tennis', 'volleyball', 'swimming', 'athletics', 'other'] &&
             data.isPublic is bool;
    }

    // ユーザードキュメント
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && request.resource.data.uid == userId;
      allow update: if isOwner(userId) &&
                       !request.resource.data.diff(resource.data).affectedKeys()
                         .hasAny(['uid', 'createdAt', 'totalNotes', 'totalMatches', 'currentStreak', 'longestStreak']);
      allow delete: if false;
    }

    // グループドキュメント
    match /groups/{groupId} {
      allow read: if isGroupMember(groupId);
      allow create: if isAuthenticated() &&
                       request.resource.data.ownerUid == request.auth.uid &&
                       request.resource.data.memberCount == 1 &&
                       request.resource.data.maxMembers == 10;
      allow update: if isGroupOwner(groupId) &&
                       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['id', 'createdAt', 'ownerUid']);
      allow delete: if false;

      match /members/{memberId} {
        allow read: if isGroupMember(groupId);
        // 自分自身の参加 または 同グループメンバーによる子プロフィール追加
        allow create: if isAuthenticated() &&
                         (memberId == request.auth.uid || isGroupMember(groupId));
        allow update: if isOwner(memberId) || isGroupMember(groupId);
        allow delete: if isOwner(memberId) || isGroupMember(groupId);
      }
    }

    // 招待コード
    match /inviteCodes/{code} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }

    // 練習ノート
    match /notes/{noteId} {
      allow read: if isOwner(resource.data.userId) ||
                     (resource.data.groupId != null &&
                      isSameGroup(resource.data.groupId));
      // 同グループメンバーなら他のメンバープロフィールIDで代理作成可
      allow create: if isAuthenticated() &&
                       isValidNote(request.resource.data) &&
                       request.resource.data.imageUrls.size() <= 5 &&
                       (request.resource.data.userId == request.auth.uid ||
                        (request.resource.data.groupId != null &&
                         isGroupMemberProxy(request.resource.data.groupId, request.resource.data.userId)));
      // 更新・削除は記録の所有者または同グループオーナー
      allow update: if (isOwner(resource.data.userId) || isSameGroup(resource.data.groupId)) &&
                       resource.data.userId == request.resource.data.userId &&
                       isValidNote(request.resource.data) &&
                       request.resource.data.imageUrls.size() <= 5;
      allow delete: if isOwner(resource.data.userId) ||
                       (resource.data.groupId != null && isGroupOwner(resource.data.groupId));

      match /comments/{commentId} {
        allow read: if isOwner(get(/databases/$(database)/documents/notes/$(noteId)).data.userId) ||
                       isSameGroup(get(/databases/$(database)/documents/notes/$(noteId)).data.groupId);
        allow create: if isAuthenticated() &&
                         request.resource.data.userId == request.auth.uid &&
                         request.resource.data.text is string &&
                         request.resource.data.text.size() > 0 &&
                         request.resource.data.text.size() <= 200;
        allow delete: if isOwner(resource.data.userId);
        allow update: if false;
      }
    }

    // 試合記録
    match /matches/{matchId} {
      allow read: if isOwner(resource.data.userId) ||
                     (resource.data.groupId != null &&
                      isSameGroup(resource.data.groupId));
      allow create: if isAuthenticated() &&
                       isValidMatch(request.resource.data) &&
                       request.resource.data.imageUrls.size() <= 5 &&
                       (request.resource.data.userId == request.auth.uid ||
                        (request.resource.data.groupId != null &&
                         isGroupMemberProxy(request.resource.data.groupId, request.resource.data.userId)));
      allow update: if (isOwner(resource.data.userId) || isSameGroup(resource.data.groupId)) &&
                       resource.data.userId == request.resource.data.userId &&
                       isValidMatch(request.resource.data);
      allow delete: if isOwner(resource.data.userId) ||
                       (resource.data.groupId != null && isGroupOwner(resource.data.groupId));

      match /comments/{commentId} {
        allow read: if isOwner(get(/databases/$(database)/documents/matches/$(matchId)).data.userId) ||
                       isSameGroup(get(/databases/$(database)/documents/matches/$(matchId)).data.groupId);
        allow create: if isAuthenticated() &&
                         request.resource.data.userId == request.auth.uid &&
                         request.resource.data.text is string &&
                         request.resource.data.text.size() > 0 &&
                         request.resource.data.text.size() <= 200;
        allow delete: if isOwner(resource.data.userId);
        allow update: if false;
      }
    }

    // リアクション
    match /reactions/{reactionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.reactionType in ['applause', 'fire', 'star', 'muscle'];
      allow delete: if isOwner(resource.data.userId);
      allow update: if false;
    }

    // 試合ジャーナル
    match /matchJournals/{journalId} {
      allow read: if isOwner(resource.data.userId) ||
                     (resource.data.groupId != null &&
                      isSameGroup(resource.data.groupId));
      allow create: if isAuthenticated() &&
                       isValidJournal(request.resource.data) &&
                       (request.resource.data.userId == request.auth.uid ||
                        (request.resource.data.groupId != null &&
                         isGroupMemberProxy(request.resource.data.groupId, request.resource.data.userId)));
      allow update: if (isOwner(resource.data.userId) || isSameGroup(resource.data.groupId)) &&
                       resource.data.userId == request.resource.data.userId;
      allow delete: if isOwner(resource.data.userId) ||
                       (resource.data.groupId != null && isGroupOwner(resource.data.groupId));

      match /comments/{commentId} {
        allow read: if isOwner(get(/databases/$(database)/documents/matchJournals/$(journalId)).data.userId) ||
                       isSameGroup(get(/databases/$(database)/documents/matchJournals/$(journalId)).data.groupId);
        allow create: if isAuthenticated() &&
                         request.resource.data.userId == request.auth.uid &&
                         request.resource.data.text is string &&
                         request.resource.data.text.size() <= 200 &&
                         (request.resource.data.text.size() > 0 || request.resource.data.stampId is string) &&
                         request.resource.data.role in ['parent', 'child', 'member'] &&
                         (
                           request.resource.data.role != 'parent' ||
                           isGroupOwner(get(/databases/$(database)/documents/matchJournals/$(journalId)).data.groupId)
                         );
        allow delete: if isOwner(resource.data.userId);
        allow update: if false;
      }
    }

    // ハイライトピン
    match /highlights/{highlightId} {
      allow read: if isOwner(resource.data.userId) ||
                     (resource.data.groupId != null && isSameGroup(resource.data.groupId));
      allow create: if isAuthenticated() &&
                       (request.resource.data.userId == request.auth.uid ||
                        (request.resource.data.groupId != null &&
                         isGroupMemberProxy(request.resource.data.groupId, request.resource.data.userId)));
      allow delete: if isOwner(resource.data.userId) ||
                       (resource.data.groupId != null && isGroupOwner(resource.data.groupId));
      allow update: if false;
    }

    // 目標
    match /goals/{goalId} {
      allow read: if isOwner(resource.data.userId) ||
                     (isSameGroup(resource.data.groupId) && resource.data.isPublic == true);
      allow create: if isAuthenticated() &&
                       request.resource.data.title.size() <= 100 &&
                       (request.resource.data.userId == request.auth.uid ||
                        (request.resource.data.groupId != null &&
                         isGroupMemberProxy(request.resource.data.groupId, request.resource.data.userId)));
      allow update: if (isOwner(resource.data.userId) || isSameGroup(resource.data.groupId)) &&
                       resource.data.userId == request.resource.data.userId;
      allow delete: if isOwner(resource.data.userId) ||
                       (resource.data.groupId != null && isGroupOwner(resource.data.groupId));
    }
  }
}
```

---

## Firestoreルール デプロイ手順

```bash
# Firebase CLIでルールをデプロイ
firebase deploy --only firestore:rules

# 環境を指定する場合
firebase use dev  # または prod
firebase deploy --only firestore:rules
```

---

## ローカル開発環境

```bash
# 依存関係インストール
npm install

# 開発サーバー起動（dev用Firebase）
npm run dev

# ビルド（本番用）
npm run build

# ユニットテスト実行
npm run test

# E2Eテスト実行（Firebase Emulator必要）
npm run test:e2e
```
