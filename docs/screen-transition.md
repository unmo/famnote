# FamNote 画面遷移図

最終更新: 2026-04-29

## 全体遷移図

```mermaid
flowchart TD
    subgraph 未認証
        LANDING["/ ランディングページ"]
        LOGIN["/login ログイン（Google認証）"]
        SIGNUP_REDIRECT["/signup → /login リダイレクト"]
    end

    subgraph オンボーディング
        PROFILE_SETUP["/onboarding/profile プロフィール設定"]
        CREATE_GROUP["/onboarding/create-group グループ作成"]
        JOIN_GROUP["/onboarding/join-group グループ参加（招待コード）"]
        GROUP_SELECT["/onboarding/group-select グループ選択"]
    end

    subgraph プロフィール選択
        SELECT_PROFILE["/select-profile プロフィール選択"]
    end

    subgraph メインアプリ
        DASHBOARD["/dashboard ダッシュボード"]

        subgraph 練習ノート
            NOTES["/notes ノート一覧"]
            NOTE_NEW["/notes/new ノート作成"]
            NOTE_DETAIL["/notes/:id ノート詳細"]
            NOTE_EDIT["/notes/:id/edit ノート編集"]
        end

        subgraph 試合記録
            MATCHES["/matches 試合一覧"]
            MATCH_NEW["/matches/new 試合作成"]
            MATCH_DETAIL["/matches/:id 試合詳細"]
            MATCH_EDIT["/matches/:id/edit 試合編集"]
        end

        subgraph 試合ジャーナル
            JOURNALS["/journals ジャーナル一覧"]
            JOURNAL_NEW["/journals/new 試合前入力"]
            JOURNAL_DETAIL["/journals/:id ジャーナル詳細"]
            JOURNAL_POST["/journals/:id/post 試合後入力"]
            JOURNAL_PRE_EDIT["/journals/:id/edit/pre 試合前編集"]
            JOURNAL_POST_EDIT["/journals/:id/edit/post 試合後編集"]
        end

        subgraph ゴール
            GOALS["/goals ゴール一覧"]
            GOAL_NEW["/goals/new ゴール作成"]
        end

        TIMELINE["/timeline タイムライン"]
        HIGHLIGHTS["/highlights ハイライト"]
        PROFILE_PAGE["/profile/:userId メンバープロフィール"]
        SETTINGS["/settings 設定"]
        THEME["/theme テーマ選択"]
    end

    %% 未認証フロー
    LANDING --> LOGIN
    LOGIN -->|認証成功 グループ未参加| PROFILE_SETUP
    LOGIN -->|認証成功 グループ参加済み| SELECT_PROFILE

    %% オンボーディングフロー
    PROFILE_SETUP --> CREATE_GROUP
    PROFILE_SETUP --> JOIN_GROUP
    PROFILE_SETUP --> GROUP_SELECT
    CREATE_GROUP -->|作成完了| SELECT_PROFILE
    JOIN_GROUP -->|参加完了| SELECT_PROFILE
    GROUP_SELECT -->|選択完了| SELECT_PROFILE

    %% プロフィール選択
    SELECT_PROFILE -->|選択完了| DASHBOARD

    %% メインナビゲーション
    DASHBOARD --> NOTES
    DASHBOARD --> MATCHES
    DASHBOARD --> JOURNALS
    DASHBOARD --> GOALS
    DASHBOARD --> TIMELINE
    DASHBOARD --> HIGHLIGHTS
    DASHBOARD --> SETTINGS

    %% 練習ノート
    NOTES --> NOTE_NEW
    NOTES --> NOTE_DETAIL
    NOTE_DETAIL --> NOTE_EDIT

    %% 試合記録
    MATCHES --> MATCH_NEW
    MATCHES --> MATCH_DETAIL
    MATCH_DETAIL --> MATCH_EDIT

    %% 試合ジャーナル
    JOURNALS --> JOURNAL_NEW
    JOURNALS --> JOURNAL_DETAIL
    JOURNAL_NEW -->|試合前保存| JOURNAL_DETAIL
    JOURNAL_DETAIL --> JOURNAL_POST
    JOURNAL_DETAIL --> JOURNAL_PRE_EDIT
    JOURNAL_DETAIL --> JOURNAL_POST_EDIT

    %% ゴール
    GOALS --> GOAL_NEW

    %% 設定
    SETTINGS --> THEME
    SETTINGS --> PROFILE_PAGE

    %% プロフィール切り替え（ヘッダー）
    SELECT_PROFILE -.->|ヘッダーから切替| SELECT_PROFILE
```

## 認証ガード条件

| 条件 | リダイレクト先 |
|------|-------------|
| 未認証 | `/login` |
| 認証済み・グループ未参加 | `/onboarding/profile` |
| 認証済み・グループ参加済み・プロフィール未選択 | `/select-profile` |
| 認証済み・グループ参加済み・プロフィール選択済み | アクセス許可 |

## ボトムナビゲーション

| タブ | パス |
|-----|------|
| ホーム | `/dashboard` |
| ノート | `/notes` |
| 試合 | `/matches` |
| ジャーナル | `/journals` |
| 設定 | `/settings` |
