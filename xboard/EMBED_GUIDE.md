# XBoard 埋め込みガイド

XBoardをあなたのWebサイトに簡単に埋め込む方法を説明します。

## 🚀 クイックスタート

### 1. 基本的な埋め込み

```html
<!-- HTMLのbodyタグ内 -->
<div id="xboard-timeline"></div>

<!-- スクリプト読み込み -->
<script src="https://your-domain.com/xboard-embed.js"></script>
<script>
  XBoard.create('#xboard-timeline', {
    accounts: 'elonmusk,twitter',
    limit: 10
  });
</script>
```

### 2. データ属性での自動初期化

```html
<div data-xboard 
     data-accounts="elonmusk" 
     data-limit="5" 
     data-theme="auto">
</div>
<script src="https://your-domain.com/xboard-embed.js"></script>
```

## ⚙️ 設定オプション

| オプション | デフォルト | 説明 |
|-----------|-----------|------|
| `accounts` | `'elonmusk,twitter'` | 表示するXアカウント（カンマ区切り） |
| `limit` | `10` | 表示するツイート数（1-50） |
| `theme` | `'auto'` | テーマ（`'light'` / `'dark'` / `'auto'`） |
| `layout` | `'grid'` | レイアウト（`'grid'` / `'column'`） |
| `maxColumns` | `3` | 最大カラム数（1-5） |
| `refreshInterval` | `30000` | 自動更新間隔（ミリ秒、0で無効） |
| `apiUrl` | `'/.netlify/functions/timeline'` | API エンドポイント |

## 📱 レスポンシブ対応

XBoardは自動的にレスポンシブ対応されます：

- **モバイル**: 1カラム
- **タブレット**: 2カラム  
- **デスクトップ**: 指定したカラム数（最大5）

## 🎨 テーマ

### ライトテーマ
```javascript
XBoard.create('#timeline', {
  theme: 'light',
  accounts: 'elonmusk'
});
```

### ダークテーマ
```javascript
XBoard.create('#timeline', {
  theme: 'dark',
  accounts: 'twitter'
});
```

### 自動テーマ（推奨）
```javascript
XBoard.create('#timeline', {
  theme: 'auto', // ユーザーのシステム設定に従う
  accounts: 'elonmusk,twitter'
});
```

## 📐 レイアウトオプション

### グリッドレイアウト（デフォルト）
```javascript
XBoard.create('#timeline', {
  layout: 'grid',
  maxColumns: 3,
  accounts: 'elonmusk,twitter'
});
```

### カラムレイアウト
```javascript
XBoard.create('#timeline', {
  layout: 'column', // 縦1列で表示
  accounts: 'elonmusk'
});
```

## 🔄 自動更新

```javascript
XBoard.create('#timeline', {
  accounts: 'elonmusk',
  refreshInterval: 60000 // 1分ごとに更新
});

// 自動更新を無効にする
XBoard.create('#timeline', {
  accounts: 'elonmusk',
  refreshInterval: 0
});
```

## 🛠️ 高度な使用方法

### 動的な制御

```javascript
// ウィジェット作成
const widget = XBoard.create('#timeline', {
  accounts: 'elonmusk',
  limit: 5
});

// 手動で更新
widget.refresh();

// 設定変更
widget.updateOptions({
  accounts: 'elonmusk,twitter',
  limit: 10
});

// ウィジェット破棄
widget.destroy();
```

### 複数ウィジェット

```html
<div class="timeline-container">
  <div id="elon-timeline"></div>
  <div id="twitter-timeline"></div>
</div>

<script>
  XBoard.create('#elon-timeline', {
    accounts: 'elonmusk',
    limit: 5,
    theme: 'light'
  });
  
  XBoard.create('#twitter-timeline', {
    accounts: 'twitter',
    limit: 5,
    theme: 'dark'
  });
</script>
```

## 💅 カスタムスタイリング

### CSS変数でのカスタマイズ

```css
.xboard-widget {
  --xboard-bg-primary: #ffffff;
  --xboard-bg-secondary: #f8f9fa;
  --xboard-text-primary: #1a1a1a;
  --xboard-text-secondary: #6b7280;
  --xboard-border: #e5e7eb;
  --xboard-hover: #f3f4f6;
}

.xboard-widget.dark {
  --xboard-bg-primary: #1f2937;
  --xboard-bg-secondary: #111827;
  --xboard-text-primary: #ffffff;
  --xboard-text-secondary: #9ca3af;
  --xboard-border: #374151;
  --xboard-hover: #2d3748;
}
```

### カスタムCSS

```css
.xboard-container {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.xboard-tweet {
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.xboard-tweet:hover {
  transform: translateY(-2px);
}
```

## 🚦 ステータス確認

ウィジェットの読み込み状況は自動的に表示されます：

- **Loading**: データ取得中
- **Success**: タイムライン表示成功
- **Error**: エラー発生時（フォールバックデータ表示）

## 📦 ファイル構成

```
dist/
├── xboard-embed.js       # 埋め込み用JavaScript（7.4KB）
├── xboard-embed.js.map   # ソースマップ
├── embed-demo.html       # デモページ
└── assets/
    ├── index-*.css       # メインアプリ用CSS
    └── main-*.js         # メインアプリ用JavaScript
```

## 🔧 トラブルシューティング

### ウィジェットが表示されない
- スクリプトが正しく読み込まれているか確認
- コンソールエラーをチェック
- コンテナ要素が存在するか確認

### スタイリングが崩れる
- TailwindCSSとの競合を確認
- カスタムCSSの優先度を調整
- ダークモード設定を確認

### API エラー
- ネットワーク接続を確認
- APIエンドポイントが正しいか確認
- フォールバックデータが表示されるか確認

## 🎯 ベストプラクティス

1. **パフォーマンス**
   - `refreshInterval` を適切に設定（推奨: 30秒以上）
   - 必要以上に多くのツイートを表示しない

2. **アクセシビリティ**
   - `theme: 'auto'` でユーザー設定に従う
   - 適切なコントラスト比を維持

3. **ユーザビリティ**
   - レスポンシブデザインを活用
   - 読み込み状態を明確に表示

## 🔗 関連リンク

- [メインアプリケーション](http://localhost:3000/)
- [デモページ](./embed-demo.html)
- [API ドキュメント](../packages/api/README.md)

---

💡 **質問やフィードバック**: [GitHub Issues](https://github.com/your-username/xboard/issues) でお気軽にお知らせください。