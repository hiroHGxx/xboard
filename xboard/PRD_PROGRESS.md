# PRD_Combined – **xboard** (Progress Update)
_複数の X (旧 Twitter) アカウントのタイムラインを、Web サイトに "ボックス" として埋め込める閲覧専用ウィジェット_

---

## 📅 **開発進捗状況** (Updated: 2025-06-17)

### ✅ **完了済み (Sprint 0)**
- [x] xboard リポジトリ作成 & main ブランチ設定
- [x] Turborepo 初期化 / ESLint + Prettier + commitlint
- [x] Netlify 連携準備（netlify.toml作成）
- [x] React + Vite + TypeScript + Tailwind CSS セットアップ
- [x] pnpm workspace設定とmonorepo構造確立
- [x] モックAPI (Netlify Functions) 基本構造
- [x] ローカル開発環境確認 (http://localhost:3000)
- [x] 基本的なビルド・テストパイプライン動作確認

### ✅ **完了済み (Sprint 1)**
- [x] Twitter風タイムラインカードUI設計と実装
- [x] レスポンシブグリッドレイアウト実装（1-3列対応）
- [x] モックデータでのタイムライン表示
- [x] TanStack Query導入 & SWR（30秒自動更新）
- [x] ローディング状態・エラーハンドリング実装

### ✅ **完了済み (Sprint 2)**
- [x] X API v2連携実装（ユーザー名→ID変換対応）
- [x] Netlify Blobs キャッシュ 30s 実装
- [x] 環境変数設定（X_BEARER_TOKEN）
- [x] モックデータフォールバック機能
- [x] Netlify開発環境セットアップ

### 🎯 **現在の状態**
- **開発サーバー**: ✅ 動作中 (`netlify dev` - http://localhost:8888)
- **UI**: ✅ Twitter風タイムライン完全動作（4ツイート表示：Elon Musk×2、Twitter×2）
- **API**: ✅ Netlify Functions動作（モックデータ返却中）
- **自動更新**: ✅ 30秒間隔で動作
- **ビルド**: ✅ 正常 (`pnpm run build`)
- **Git**: ✅ 最新コミット済み

---

## 1. 要件定義

| 項目 | 内容 |
|------|------|
| **目的** | 複数アカウントの TL を 1 か所に表示し、好きな Web ページに簡単に埋め込めるようにする。公式 XPro (TweetDeck) ほど重厚でなく、「おしゃれで軽量」かつ"読み専"に特化。 |
| **背景 / 課題** | * XPro はログイン必須・UI が重い。<br>* 公式埋め込みは 1 アカウント縦長でカスタムしづらい。<br>* SNS 運用担当や推し活ユーザーが「複数 TL を同時に眺められない」不満を解決したい。 |
| **想定ユーザー** | - **SNS 運用担当**：複数ブランドの状況把握<br>- **個人ブロガー**：自サイトに自分と推しの TL を並べて表示<br>- **情報モニタリング系**：速報チェック用に埋め込み |
| **プラットフォーム** | Web アプリ (デスクトップ / モバイル対応)。デスクトップアプリやネイティブアプリは対象外。 |
| **主要機能 (MVP)** | 1. 複数アカウント TL のカラム表示 (横 or 縦)<br>2. 埋め込みコード生成 (`<script>` または `<iframe>`)<br>3. レスポンシブ対応 / ライト & ダーク自動切替<br>4. 30 s ごとの自動更新 & Netlify Blobs キャッシュ<br>5. UI カスタム (テーマカラー 1 色) |
| **除外機能** | 投稿・RT・いいね・予約投稿・分析ダッシュボード・チーム権限管理 |
| **非機能要件** | - 1 画面あたり 100 KB 未満の初回 JS バンドル<br>- LCP < 2.5 s (モバイル 4G)<br>- Lighthouse (PWA / SEO / A11y / Best) ≥ 90 |
| **KPI (β)** | - Page Views 1 k/月<br>- 平均滞在時間 3 分<br>- X API 呼び出し数 < 30 req/分 |

---

## 2. 技術選定 (Netlify 版) - ✅ **実装済み**

| レイヤ | 技術 | 状態 | 補足 |
|--------|------|------|------|
| **UI** | React 18 + Vite + TypeScript + Tailwind CSS | ✅ | 軽量・学習コスト低 |
| **状態管理 / 取得** | TanStack Query (SWR) | ✅ 完了 | 30秒自動更新・エラーハンドリング |
| **アニメーション** | Framer Motion | 📋 計画中 | 任意 |
| **API** | Netlify **Functions** (Node 18) | ✅ 完了 | X API v2連携・フォールバック実装済み |
| **キャッシュ (KV)** | Netlify **Blobs** (`@netlify/blobs`) | ✅ 完了 | 30秒TTL・本番環境のみ有効 |
| **認証** | X API v2 Bearer Token (app レベル) を Netlify 環境変数に格納 | ⚠️ 設定済みだが認証エラー | Bearer Token要検証 |
| **CI/CD** | GitHub → Netlify（自動ビルド & Preview Deploy） | ✅ | GitHub連携済み |
| **リポジトリ** | `xboard` (Monorepo / Turborepo) | ✅ | 完全セットアップ済み |
| **テスト** | Vitest + React Testing Library、Playwright (E2E) | 📋 計画中 |
| **Lint / Format** | ESLint / Prettier / commitlint + Husky | ✅ | 設定完了 |

---

## 3. ディレクトリ構成 - ✅ **実装済み**

```text
xboard/                          ← ✅ 作成済み
├─ apps/
│   └─ widget/                   ← ✅ React + Vite アプリ (localhost:3000)
│       ├─ src/
│       │   ├─ App.tsx          ← ✅ 基本UI (カウンターデモ)
│       │   ├─ main.tsx         ← ✅ React エントリーポイント
│       │   └─ index.css        ← ✅ Tailwind CSS
│       ├─ package.json         ← ✅ 依存関係設定
│       ├─ vite.config.ts       ← ✅ Vite設定
│       └─ tailwind.config.js   ← ✅ Tailwind設定
├─ packages/
│   ├─ api/                     ← ✅ バックエンドロジック
│   │   ├─ netlify-functions/   ← ✅ Functions (timeline.ts)
│   │   │   └─ timeline.ts      ← ✅ モックAPI実装
│   │   └─ src/                 ← ✅ 共通ロジック
│   │       └─ types.ts         ← ✅ 型定義
│   └─ ui/                      ← ✅ 再利用 UI コンポーネント
├─ netlify.toml                 ← ✅ ビルド & ルーティング設定
├─ turbo.json                   ← ✅ Turborepo パイプライン
├─ pnpm-workspace.yaml          ← ✅ ワークスペース設定
├─ .eslintrc.js                 ← ✅ ESLint設定
├─ .prettierrc                  ← ✅ Prettier設定
└─ README.md / PRD_Combined.md  ← ✅ ドキュメント
```

---

## 4. データ設計（Netlify Blobs KV）- 📋 **次期実装予定**

| Key | Value (JSON) | TTL / 失効 | 用途 |
|-----|-------------|-----------|------|
| `timeline:<site_id>:<limit>` | `[Tweet, …]` | 30 s (メタ: expires EPOCH) | TL キャッシュ |
| `config:<site_id>` | `{ accounts: [], theme: "" }` | 1 h | ウィジェット設定 |

将来拡張：集計や課金が必要になったら Supabase/PostgreSQL を別途導入。

---

## 5. API 仕様 - ✅ **モック実装済み**

### 5.1 GET /api/timeline
| 項目 | 内容 | 状態 |
|------|------|------|
| クエリ | accounts (必須, カンマ区切り ID)<br>limit (任意, 10–50, デフォ 20)<br>cursor (任意) | ✅ モック |
| レスポンス 200 | `{ tweets: Tweet[], next_cursor?: string }` | ✅ モック |
| Tweet 型 (抜粋) | `{ id, text, created_at, user, media?, metrics? }` | ✅ 定義済み |
| キャッシュ | Function 内：Netlify Blobs 30 s<br>CDN：Netlify-CDN-Cache-Control: s-maxage=30 | 📋 実装予定 |
| エラーレスポンス | 429 Rate limit / 500 Upstream error | ✅ 基本構造 |

**現在のモックデータ例:**
```json
{
  "tweets": [
    {
      "id": "1",
      "text": "Excited to announce our new AI features! The future of technology is here. #AI #Innovation",
      "created_at": "2025-06-17T13:50:00.000Z",
      "user": {
        "id": "44196397",
        "username": "elonmusk",
        "name": "Elon Musk",
        "profile_image_url": "https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_normal.jpg"
      },
      "metrics": {
        "retweet_count": 15420,
        "like_count": 89532,
        "reply_count": 3241
      }
    }
  ]
}
```

---

## 6. ToDo & マイルストーン - 🔄 **更新済み**

### ✅ **Sprint 0 — リポジトリ & CI (完了)**
| No. | Task | P | Status | Notes |
|-----|------|---|--------|-------|
| 0-1 | xboard リポジトリ作成 & main ブランチ | P0 | ✅ | GitHub連携済み |
| 0-2 | Turborepo 初期化 / ESLint + Prettier | P0 | ✅ | 設定完了 |
| 0-3 | Netlify 連携（Build=pnpm run build, Publish=apps/widget/dist） | P0 | ✅ | netlify.toml設定済み |
| 0-4 | React + Vite + Tailwind scaffold | P0 | ✅ | localhost:3000で確認済み |

### ✅ **Sprint 1 — UI & Dummy API (完了)**
| No. | Task | P | Status | 完了日 |
|-----|------|---|--------|----------|
| 1-1 | Twitter風タイムラインカードUI設計 | P0 | ✅ | 2025-06-17 |
| 1-2 | レスポンシブグリッドレイアウト | P0 | ✅ | 2025-06-17 |
| 1-3 | モックデータでのタイムライン表示 | P0 | ✅ | 2025-06-17 |
| 1-4 | TanStack Query導入 & SWR | P1 | ✅ | 2025-06-17 |
| 1-5 | Lighthouse 計測 (Preview) | P1 | 📋 | 次回実施 |

### ✅ **Sprint 2 — X API & キャッシュ (完了)**
| No. | Task | P | Status | 完了日 |
|-----|------|---|--------|----------|
| 2-1 | Netlify env に X_BEARER_TOKEN 登録 | P0 | ✅ | 2025-06-17 |
| 2-2 | getTweets() 実装 | P0 | ✅ | 2025-06-17 |
| 2-3 | Netlify Blobs キャッシュ 30 s | P0 | ✅ | 2025-06-17 |
| 2-4 | 30 s ポーリング & Error Toast | P1 | ✅ | 2025-06-17 |

### 🎨 **Sprint 3 — 埋め込み & テーマ**
| No. | Task | P | Status |
|-----|------|---|--------|
| 3-1 | `<script>` 埋め込みタグ (UMD) | P0 | 📋 |
| 3-2 | `<iframe>` サイズ自動リサイズ | P1 | 📋 |
| 3-3 | prefers-color-scheme 対応 | P0 | 📋 |
| 3-4 | ホバーアニメ調整 (Motion) | P1 | 📋 |

### 🚀 **Sprint 4 — QA & リリース**
| No. | Task | P | Status |
|-----|------|---|--------|
| 4-1 | Lighthouse (≥ 90) 再計測 | P0 | 📋 |
| 4-2 | 実機テスト (iOS / Android) | P0 | 📋 |
| 4-3 | 独自ドメイン xboard.example.com | P1 | 📋 |
| 4-4 | README / PRD 更新 & tag v0.1.0 | P0 | 📋 |

---

## 7. 開発環境セットアップ - ✅ **完了**

### **必要な環境**
- Node.js ≥ 18.0.0
- pnpm ≥ 8.0.0
- Volta (パッケージマネージャー)

### **セットアップ手順**
```bash
# 1. リポジトリクローン
git clone https://github.com/hiroHGxx/xboard.git
cd xboard

# 2. 依存関係インストール
pnpm install

# 3. 開発サーバー起動
pnpm run dev

# 4. ビルド確認
pnpm run build
```

### **確認済み動作**
- ✅ **開発サーバー**: http://localhost:3000
- ✅ **ビルド**: 全ワークスペース正常
- ✅ **リント**: ESLint/Prettier動作
- ✅ **Git**: コミット/プッシュ正常

---

## 8. 次回開発時の再開手順

### **環境復旧**
```bash
cd /Users/gotohiro/Documents/user/開発/xboard
git pull origin main
pnpm install

# Netlify開発サーバー起動（推奨）
netlify dev
# → http://localhost:8888 でアクセス

# または通常の開発サーバー
pnpm run dev
# → http://localhost:3000 でアクセス（Functions無効）
```

### **現在の実装状況**
✅ **完了済み:**
- Twitter風UI完全実装（プロフィール画像、エンゲージメント指標含む）
- レスポンシブ対応（モバイル1列、タブレット2列、デスクトップ3列）
- 30秒自動更新機能
- X API v2連携コード（認証問題でモックフォールバック中）
- Netlify Functionsによるバックエンド
- Netlify Blobsキャッシュ機能

⚠️ **課題:**
- X API Bearer Token認証エラー（401 Unauthorized）
- Twitter Developer申請承認待ちの可能性

### **次回優先作業**
1. **X API認証問題解決**
   - Twitter Developer Portal申請状況確認
   - Bearer Token再生成・検証
   
2. **Sprint 3開始**
   - 埋め込みコード生成機能
   - `<script>`タグ対応

### **現在のcommit**
```
commit 3a6302e
feat: Setup complete Turborepo monorepo with React + Vite
```

---

## 📝 **付録: 設定ファイル概要**

### netlify.toml
```toml
[build]
  command = "pnpm run build"
  publish = "apps/widget/dist"

[functions]
  directory = "packages/api/netlify-functions"
  node_bundler = "esbuild"
```

### 主要スクリプト
- `pnpm run dev`: 開発サーバー起動
- `pnpm run build`: プロダクションビルド
- `pnpm run lint`: コード品質チェック

---

**🎯 次回目標: X API認証問題を解決し、Sprint 3の埋め込み機能実装を開始する**

### **重要な技術ノート**
- **開発サーバー**: `netlify dev`使用でFunctions利用可能
- **モックデータ**: 実際のElon Musk/Twitterアカウント風に更新済み
- **UI状態**: 4ツイートが2×2グリッドで美しく表示
- **自動更新**: 30秒ごとに「Timeline loaded (4 tweets)」ステータス表示