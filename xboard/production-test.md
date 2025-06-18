# XBoard 本番環境テスト手順

## 🚀 Netlify デプロイ & X API連携テスト

### 1. 環境変数設定

```bash
# X API Bearer Token を Netlify に設定
netlify env:set X_BEARER_TOKEN "AAAAAAAAAAAAAAAAAAAAAOAu2gEAAAAAffmIRHSZzA2U7TgMeKdMgXeRajs%3D9ntWXoGfCSfR52lc8Zp2OiLUASUlWM34hWNhfafG3iQdyTWik9"

# 設定確認
netlify env:list
```

### 2. 本番ビルド & デプロイ

```bash
# 最終ビルド
pnpm run build

# Netlify にデプロイ
netlify deploy --prod --dir dist
```

### 3. 本番環境テスト項目

#### ✅ X API 接続テスト
- [ ] `/api/timeline?accounts=elonmusk&limit=5` でリアルタイムデータ取得
- [ ] Bearer Token認証が正常動作
- [ ] レート制限処理が適切
- [ ] エラーハンドリング（401, 429, 500）が正常
- [ ] キャッシュ機能（30秒TTL）が動作

#### ✅ 埋め込み機能テスト
- [ ] `xboard-embed.js` CDN配信
- [ ] 外部サイトからの埋め込み動作
- [ ] CORS設定が適切
- [ ] CSP (Content Security Policy) 対応

#### ✅ パフォーマンステスト
- [ ] CDN キャッシュが有効
- [ ] Gzip 圧縮が有効
- [ ] 初回読み込み時間 < 2.5秒
- [ ] Lighthouse スコア ≥ 90

### 4. 実際のテストコマンド

#### API エンドポイントテスト
```bash
# 本番環境のAPIをテスト
curl -s "https://your-xboard-domain.netlify.app/.netlify/functions/timeline?accounts=elonmusk&limit=3" | jq '.'

# レスポンス例
{
  "tweets": [
    {
      "id": "...",
      "text": "...",
      "created_at": "...",
      "user": {...},
      "metrics": {...}
    }
  ]
}
```

#### 埋め込みテスト用HTML
```html
<!DOCTYPE html>
<html>
<head>
    <title>XBoard 埋め込みテスト</title>
</head>
<body>
    <div id="xboard-test"></div>
    <script src="https://your-xboard-domain.netlify.app/xboard-embed.js"></script>
    <script>
        XBoard.create('#xboard-test', {
            accounts: 'elonmusk',
            limit: 3
        });
    </script>
</body>
</html>
```

### 5. 監視・ログ設定

#### Netlify Functions ログ
```bash
# リアルタイムログ監視
netlify functions:log

# 過去のログ確認
netlify functions:log --since=1h
```

#### X API 使用量監視
- Twitter Developer Portal でAPI使用状況確認
- レート制限の監視
- 月次使用量の追跡

### 6. トラブルシューティング

#### よくある問題

**🔴 401 Unauthorized**
```json
{
  "title": "Unauthorized",
  "type": "about:blank", 
  "status": 401,
  "detail": "Unauthorized"
}
```
**対策:** Bearer Token を再生成・設定確認

**🔴 429 Too Many Requests**
```json
{
  "title": "Too Many Requests",
  "detail": "Too Many Requests",
  "type": "about:blank",
  "status": 429
}
```
**対策:** レート制限に達している。15分後に復旧。

**🔴 CORS Error**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**対策:** `Access-Control-Allow-Origin: *` ヘッダーを確認

**🔴 Function Timeout**
```
Function timeout error
```
**対策:** X API レスポンス時間を確認、タイムアウト値調整

### 7. パフォーマンス最適化

#### CDN最適化
```toml
# netlify.toml
[[headers]]
  for = "/xboard-embed.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    
[[headers]]
  for = "/.netlify/functions/*"
  [headers.values]
    Cache-Control = "public, s-maxage=30"
```

#### 圧縮設定
```toml
[build]
  command = "pnpm run build"
  publish = "dist"

[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true
```

### 8. セキュリティチェック

#### 環境変数保護
- [ ] Bearer Token が Git履歴に含まれていない
- [ ] 本番環境でのみ有効なトークン使用
- [ ] ログにトークンが出力されていない

#### HTTPS 強制
- [ ] すべての通信がHTTPS
- [ ] Mixed Content警告なし
- [ ] Security Headers設定

### 9. 成功基準

#### ✅ 必須要件
- [ ] X API から実際のツイートデータ取得
- [ ] 埋め込み機能が外部サイトで動作
- [ ] エラーハンドリングが適切
- [ ] パフォーマンス要件を満たす

#### ✅ 品質要件
- [ ] Lighthouse スコア Performance ≥ 90
- [ ] Lighthouse スコア Accessibility ≥ 90
- [ ] Lighthouse スコア Best Practices ≥ 90
- [ ] Lighthouse スコア SEO ≥ 90

### 10. 本番運用準備

#### 監視設定
- Netlify Analytics 有効化
- Function 使用量監視
- エラー率監視

#### バックアップ
- Git tag `v0.1.0` 作成
- 設定ファイルのバックアップ
- 環境変数の安全な保管

---

**🎯 次のステップ:**
1. Netlify プロジェクト設定
2. 環境変数設定
3. 本番デプロイ実行
4. 実機でのテスト実施
5. パフォーマンス測定
6. v0.1.0 リリース