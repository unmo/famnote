# ビルドステージ
FROM node:22-alpine AS builder

WORKDIR /app

# 依存関係のインストール（キャッシュ最適化）
COPY package*.json ./
RUN npm ci --frozen-lockfile

# ソースコードのコピーとビルド
COPY . .
RUN npm run build

# 本番ステージ（Nginxで静的ファイルを配信）
FROM nginx:1.27-alpine AS production

# セキュリティ: 非rootユーザーで実行
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

# ビルド成果物をコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA用のNginx設定（全パスをindex.htmlにフォールバック）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ポート設定
EXPOSE 8080

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Nginxをフォアグラウンドで起動
CMD ["nginx", "-g", "daemon off;"]
