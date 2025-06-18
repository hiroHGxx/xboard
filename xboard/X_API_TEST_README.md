# X API v2 認証テストツール

X API Bearer Token の認証問題を特定・解決するためのテストツール集です。

## 🚀 クイックスタート

### 1. Bearer Token の準備

[Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) から Bearer Token を取得し、環境変数に設定：

```bash
export X_BEARER_TOKEN="AAAAAAAAAAAAAAAAAAAAAOAu2gEAAAAAffmIRHSZzA2U7TgMeKdMgXeRajs%3D9ntWXoGfCSfR52lc8Zp2OiLUASUlWM34hWNhfafG3iQdyTWik9"
```

### 2. テスト実行

#### 最速テスト (curl版)
```bash
./test-x-api-curl.sh
```

#### 詳細テスト (Node.js版)
```bash
node test-x-api.js
```

#### 包括的診断
```bash
node x-api-diagnosis.js
```

## 📋 テストツール概要

### `test-x-api-curl.sh`
- **用途**: 最速での認証テスト
- **依存**: curl のみ
- **実行時間**: 数秒
- **テスト内容**:
  - ユーザー情報取得 (elonmusk)
  - 公開ツイート検索

### `test-x-api.js`
- **用途**: 詳細なAPI動作確認
- **依存**: Node.js 18+
- **実行時間**: 10-20秒
- **テスト内容**:
  - Token形式チェック
  - ユーザー情報取得
  - 公開ツイート検索

### `x-api-diagnosis.js`
- **用途**: 包括的な問題診断
- **依存**: Node.js 18+
- **実行時間**: 30-60秒
- **テスト内容**:
  - Token詳細分析
  - 複数のAPIエンドポイントテスト
  - 問題診断と解決策提案

## 🔧 よくある問題と解決策

### ❌ 401 Unauthorized
**原因**: Bearer Token が無効または期限切れ

**解決手順**:
1. [Developer Portal](https://developer.twitter.com/en/portal/dashboard) にアクセス
2. アプリの "Keys and tokens" タブを開く
3. "Bearer Token" の "Regenerate" をクリック
4. 新しいTokenを環境変数に設定
5. 再テスト

### ❌ 403 Forbidden
**原因**: アプリの権限設定不足

**解決手順**:
1. Developer Portal でアプリ設定を確認
2. "App permissions" を "Read" 以上に設定
3. 必要に応じて審査申請を完了

### ❌ 429 Too Many Requests
**原因**: レート制限に達している

**解決策**:
- 15分待ってから再実行
- API呼び出し頻度を下げる
- 有料プランの検討

## 🔍 診断結果の見方

### ✅ 成功時
```
🎯 テスト結果サマリー:
- ユーザー情報取得: ✅ 成功
- 公開ツイート検索: ✅ 成功
```
→ Bearer Token は正常に動作しています

### ❌ 失敗時
テストツールが具体的な問題と解決策を表示します。
指示に従って Bearer Token を再生成してください。

## 📦 メインアプリケーションへの適用

テストが成功したら、以下のファイルを更新：

### Netlify環境変数設定
```bash
netlify env:set X_BEARER_TOKEN "your_working_token"
```

### ローカル開発用
```bash
# .env.local ファイル作成
echo "X_BEARER_TOKEN=your_working_token" > .env.local
```

## 🚀 次のステップ

1. **X API認証問題解決** ✅
2. **メインアプリケーションでのAPI有効化**
3. **本番環境での環境変数設定**
4. **レート制限対応のキャッシュ実装改善**

## 📊 X API v2 制限事項

- **レート制限**: 15分間隔でリセット
- **無料プラン**: 月500,000ツイート取得
- **必要権限**: Read permissions 以上

## 🆘 トラブルシューティング

問題が解決しない場合：

1. **X API ステータス確認**: https://api.twitterstat.us/
2. **ネットワーク接続確認**: `curl https://api.twitter.com/2/`
3. **Node.js バージョン確認**: `node --version` (18+ 必要)
4. **新しいアプリ作成**: Developer Portal で新規アプリ作成

---

💡 **ヒント**: 包括的診断ツール (`x-api-diagnosis.js`) が最も詳細な情報を提供します。