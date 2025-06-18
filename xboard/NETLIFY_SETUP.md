# Netlify デプロイ設定ガイド

## 🚀 Netlify サイト作成

### 1. 手動デプロイ方式

```bash
# プロジェクトのビルド
cd /Users/gotohiro/Documents/user/開発/xboard/apps/widget
pnpm run build

# Netlify CLI でサイト作成 & デプロイ
netlify deploy --dir=dist --prod
```

### 2. Git連携デプロイ方式

#### GitHub リポジトリ準備
```bash
# Gitコミット (まだの場合)
git add .
git commit -m "feat: Complete XBoard widget with embed functionality

🎉 Sprint 1-3 完了:
- Twitter風タイムライン UI実装
- X API v2 連携 & 認証解決
- 埋め込み機能 (script + iframe)
- パフォーマンス最適化

🛠️ 実装済み機能:
- レスポンシブデザイン (1-3カラム)
- ダークモード対応
- 自動更新 (30秒間隔)
- カスタマイズ可能オプション
- 軽量埋め込み (7.4KB)

🎯 準備完了: Sprint 4 QA & リリース

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# GitHub に Push
git push origin main
```

#### Netlify サイト設定
1. **Netlify Dashboard** (https://app.netlify.com/) にアクセス
2. **"Add new site" → "Import from Git"**
3. **GitHub リポジトリ選択**: `xboard`
4. **Build 設定**:
   ```
   Base directory: apps/widget
   Build command: pnpm run build
   Publish directory: apps/widget/dist
   ```

### 3. 環境変数設定

#### Netlify UI から設定
1. **Site Settings → Environment Variables**
2. **Add a variable**:
   - **Key**: `X_BEARER_TOKEN`
   - **Value**: `AAAAAAAAAAAAAAAAAAAAAOAu2gEAAAAAffmIRHSZzA2U7TgMeKdMgXeRajs%3D9ntWXoGfCSfR52lc8Zp2OiLUASUlWM34hWNhfafG3iQdyTWik9`
   - **Scopes**: All deployments

#### CLI から設定 (サイトリンク後)
```bash
netlify env:set X_BEARER_TOKEN "AAAAAAAAAAAAAAAAAAAAAOAu2gEAAAAAffmIRHSZzA2U7TgMeKdMgXeRajs%3D9ntWXoGfCSfR52lc8Zp2OiLUASUlWM34hWNhfafG3iQdyTWik9"
```

### 4. netlify.toml 設定

```toml
# プロジェクトルートに配置
[build]
  base = "apps/widget"
  command = "pnpm run build"
  publish = "apps/widget/dist"

[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "8"

# Functions 設定
[functions]
  directory = "packages/api/netlify-functions"
  node_bundler = "esbuild"

# Headers 設定
[[headers]]
  for = "/xboard-embed.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Access-Control-Allow-Origin = "*"

[[headers]]
  for = "/.netlify/functions/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Headers = "Content-Type"
    Access-Control-Allow-Methods = "GET, OPTIONS"
    Cache-Control = "public, s-maxage=30"

# Redirects 設定
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# SPA 用リダイレクト
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = {Role = ["admin"], Country = ["US"]}
```

### 5. デプロイ確認

#### 成功時の確認項目
```bash
# サイトURL例: https://xboard-widget-xyz123.netlify.app

# API エンドポイント確認
curl "https://xboard-widget-xyz123.netlify.app/.netlify/functions/timeline?accounts=elonmusk&limit=3"

# 埋め込み JavaScript 確認
curl -I "https://xboard-widget-xyz123.netlify.app/xboard-embed.js"
```

#### デプロイログ確認
1. **Netlify Dashboard → Site → Deploys**
2. **最新のデプロイをクリック**
3. **Function logs** で X API 動作確認

### 6. 本番テスト用HTML

埋め込み動作確認用のテストページ:

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XBoard 本番テスト</title>
</head>
<body>
    <h1>XBoard 本番環境テスト</h1>
    
    <!-- Script 埋め込みテスト -->
    <div id="xboard-production-test"></div>
    
    <script src="https://YOUR_NETLIFY_URL/xboard-embed.js"></script>
    <script>
        XBoard.create('#xboard-production-test', {
            accounts: 'elonmusk,twitter',
            limit: 4,
            theme: 'auto'
        });
    </script>
</body>
</html>
```

### 7. トラブルシューティング

#### Build失敗時
```bash
# ローカルでビルドテスト
cd apps/widget
pnpm install
pnpm run build

# 依存関係問題の場合
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Function 実行エラー
1. **Netlify Functions ログ確認**
2. **環境変数設定確認**
3. **X API Bearer Token 有効性確認**

#### CORS エラー
- `netlify.toml` の headers 設定確認
- `Access-Control-Allow-Origin: *` が設定されているか

### 8. パフォーマンス最適化

#### Build 最適化
```json
// package.json の build script最適化
{
  "scripts": {
    "build": "vite build --mode production",
    "build:analyze": "vite build --mode production && vite-bundle-analyzer dist"
  }
}
```

#### Asset 最適化
- 画像圧縮
- JavaScript minification
- CSS 最適化
- Tree shaking

### 9. 成功基準

#### ✅ デプロイ成功
- [ ] ビルドが正常完了
- [ ] 全ファイルが正しく配信
- [ ] Functions が起動

#### ✅ API 動作
- [ ] X API から実データ取得
- [ ] エラーハンドリング正常
- [ ] キャッシュ機能動作

#### ✅ 埋め込み機能
- [ ] CDN から配信
- [ ] 外部サイトで動作
- [ ] CORS 設定適切

---

**🎯 デプロイ完了後:**
1. 本番URL でのテスト実施
2. 実機テスト実行
3. パフォーマンス測定
4. v0.1.0 タグ作成