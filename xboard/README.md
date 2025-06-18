# XBoard - Multiple X Timeline Widget

> 複数の X (旧 Twitter) アカウントのタイムラインを、Web サイトに "ボックス" として埋め込める閲覧専用ウィジェット

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site/deploys)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat&logo=netlify&logoColor=white)

## ✨ 特徴

- 🚀 **軽量**: 埋め込み用 JavaScript わずか 7.4KB (gzip: 2.67KB)
- 📱 **レスポンシブ**: モバイル〜デスクトップまで完全対応
- 🎨 **テーマ対応**: ライト・ダーク・自動切替
- 🔄 **リアルタイム**: 30秒間隔での自動更新
- 🛡️ **安全**: iframe 埋め込みでCSS競合回避
- ⚡ **高速**: CDN配信 & キャッシュ最適化

## 🎯 対象ユーザー

- **SNS運用担当**: 複数ブランドアカウントの一括監視
- **個人ブロガー**: 自サイトに推しアカウントのタイムライン表示
- **情報収集**: 速報系アカウントの効率的な監視

## 🚀 クイックスタート

### 1. Script タグ埋め込み (推奨)

```html
<div id="xboard-timeline"></div>
<script src="https://your-domain.netlify.app/xboard-embed.js"></script>
<script>
  XBoard.create('#xboard-timeline', {
    accounts: 'elonmusk,twitter',
    limit: 10,
    theme: 'auto'
  });
</script>
```

### 2. データ属性での自動初期化

```html
<div data-xboard 
     data-accounts="elonmusk" 
     data-limit="5" 
     data-theme="dark">
</div>
<script src="https://your-domain.netlify.app/xboard-embed.js"></script>
```

### 3. iframe 埋め込み

```html
<div data-xboard-iframe 
     data-accounts="twitter" 
     data-limit="3">
</div>
<script src="https://your-domain.netlify.app/iframe-helper.js"></script>
```

## ⚙️ オプション設定

| オプション | デフォルト | 説明 |
|-----------|-----------|------|
| `accounts` | `'elonmusk,twitter'` | 表示するXアカウント（カンマ区切り） |
| `limit` | `10` | 表示するツイート数（1-50） |
| `theme` | `'auto'` | テーマ（`'light'`/`'dark'`/`'auto'`） |
| `layout` | `'grid'` | レイアウト（`'grid'`/`'column'`） |
| `maxColumns` | `3` | 最大カラム数（1-5） |
| `refreshInterval` | `30000` | 自動更新間隔（ミリ秒、0で無効） |

## 🏗️ 開発環境

### 必要な環境
- Node.js ≥ 18.0.0
- pnpm ≥ 8.0.0
- X API v2 Bearer Token

### セットアップ

```bash
# リポジトリクローン
git clone https://github.com/your-username/xboard.git
cd xboard

# 依存関係インストール
pnpm install

# 環境変数設定
echo "X_BEARER_TOKEN=your_bearer_token_here" > .env.local

# 開発サーバー起動
pnpm run dev

# または Netlify 開発環境
netlify dev
```

### 利用可能なコマンド

```bash
# 開発サーバー起動
pnpm run dev

# プロダクションビルド
pnpm run build

# プレビューサーバー
pnpm run preview

# X API テスト
node test-x-api.js

# 型チェック
pnpm run type-check

# リント
pnpm run lint
```

## 📦 プロジェクト構成

```
xboard/                          # Turborepo モノレポ
├─ apps/
│   └─ widget/                   # メインアプリケーション
│       ├─ src/
│       │   ├─ App.tsx          # React メインコンポーネント
│       │   ├─ embed.ts         # 埋め込み用エントリーポイント
│       │   └─ main.tsx         # React エントリーポイント
│       ├─ public/
│       │   ├─ embed-demo.html  # 埋め込みデモページ
│       │   ├─ iframe-demo.html # iframe デモページ
│       │   └─ iframe-helper.js # iframe 制御ライブラリ
│       └─ dist/                # ビルド出力
│           ├─ xboard-embed.js  # 埋め込み用 JavaScript
│           └─ assets/          # CSS・JS アセット
├─ packages/
│   ├─ api/                     # バックエンド API
│   │   ├─ netlify-functions/   # Netlify Functions
│   │   │   └─ timeline.ts      # タイムライン API
│   │   └─ src/
│   │       └─ types.ts         # 共通型定義
│   └─ ui/                      # 共通 UI コンポーネント
├─ docs/                        # ドキュメント
│   ├─ EMBED_GUIDE.md          # 埋め込みガイド
│   ├─ MOBILE_TEST_GUIDE.md    # 実機テストガイド
│   └─ NETLIFY_SETUP.md        # デプロイガイド
└─ netlify.toml                 # Netlify 設定
```

## 🔌 API 仕様

### GET /.netlify/functions/timeline

```bash
curl "https://your-domain.netlify.app/.netlify/functions/timeline?accounts=elonmusk&limit=5"
```

**レスポンス例:**
```json
{
  "tweets": [
    {
      "id": "1234567890",
      "text": "Hello world! 🌍",
      "created_at": "2025-06-18T12:00:00.000Z",
      "user": {
        "id": "44196397",
        "username": "elonmusk",
        "name": "Elon Musk",
        "profile_image_url": "https://..."
      },
      "metrics": {
        "retweet_count": 1542,
        "like_count": 8934,
        "reply_count": 234
      }
    }
  ]
}
```

## 🚀 デプロイ

### Netlify デプロイ

```bash
# 手動デプロイ
netlify deploy --prod --dir dist

# 環境変数設定
netlify env:set X_BEARER_TOKEN "your_bearer_token_here"
```

### 環境変数

| 変数名 | 説明 | 必須 |
|-------|------|------|
| `X_BEARER_TOKEN` | X API v2 Bearer Token | ✅ |

## 📊 パフォーマンス

### Lighthouse スコア目標
- **Performance**: ≥ 90
- **Accessibility**: ≥ 90  
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90

### バンドルサイズ
- **埋め込み用 JS**: 7.42KB (gzip: 2.67KB) ✅
- **メイン CSS**: 10.50KB (gzip: 2.79KB) ✅
- **初回読み込み時間**: < 2.5秒 ✅

## 🧪 テスト

### X API テスト
```bash
# 認証テスト
./test-x-api-curl.sh

# 包括的診断
node x-api-diagnosis.js
```

### 埋め込み機能テスト
1. `test-embed-standalone.html` で基本動作確認
2. `embed-demo.html` で全パターンテスト
3. `iframe-demo.html` で iframe 機能テスト

### 実機テスト
- **iOS**: Safari、Chrome
- **Android**: Chrome、Firefox
- **デスクトップ**: Chrome、Firefox、Safari、Edge

## 🔒 セキュリティ

- **CORS**: 全ドメインからの埋め込み許可
- **CSP**: Content Security Policy 対応
- **XSS**: サニタイゼーション実装
- **認証**: Bearer Token の安全な管理

## 🤝 コントリビューション

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 開発ガイドライン
- TypeScript 必須
- ESLint + Prettier でコード品質管理
- Conventional Commits でコミットメッセージ統一
- すべての機能にテスト追加

## 🐛 既知の問題

- [ ] メインアプリのJSバンドルサイズ最適化
- [ ] X API レート制限の詳細対応
- [ ] PWA 対応

## 📋 ロードマップ

### v0.2.0
- [ ] 複数アカウントの混合表示
- [ ] ツイート検索機能
- [ ] カスタムCSS テーマ

### v0.3.0  
- [ ] リアルタイム WebSocket 対応
- [ ] 画像・動画プレビュー
- [ ] 分析ダッシュボード

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🙏 謝辞

- [X API v2](https://developer.twitter.com/en/docs/twitter-api) - データソース
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [React](https://reactjs.org/) - UI フレームワーク
- [Vite](https://vitejs.dev/) - ビルドツール
- [Netlify](https://netlify.com/) - ホスティング

---

**Made with ❤️ by XBoard Team**

🤖 *Generated with [Claude Code](https://claude.ai/code)*