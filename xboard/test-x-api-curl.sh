#!/bin/bash

# X API v2 curl テストスクリプト
# Bearer Token認証の問題を迅速に特定

echo "🔍 X API v2 Bearer Token テスト (curl版)"
echo ""

if [ -z "$X_BEARER_TOKEN" ]; then
    echo "❌ X_BEARER_TOKEN 環境変数が設定されていません"
    echo ""
    echo "設定方法:"
    echo "export X_BEARER_TOKEN=\"your_bearer_token_here\""
    echo ""
    echo "または:"
    echo "X_BEARER_TOKEN=\"your_token\" ./test-x-api-curl.sh"
    exit 1
fi

echo "Token prefix: ${X_BEARER_TOKEN:0:20}..."
echo "Token length: ${#X_BEARER_TOKEN}"
echo ""

# テスト1: 最もシンプルなAPI呼び出し (ユーザー情報取得)
echo "📋 テスト1: ユーザー情報取得 (elonmusk)"
echo "URL: https://api.twitter.com/2/users/by/username/elonmusk"
echo ""

response1=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.twitter.com/2/users/by/username/elonmusk?user.fields=id,name,username")

echo "Response:"
echo "$response1"
echo ""

# HTTP ステータスコードを抽出
status1=$(echo "$response1" | grep "HTTP_STATUS:" | cut -d: -f2)

if [ "$status1" = "200" ]; then
    echo "✅ テスト1: 成功 (HTTP $status1)"
else
    echo "❌ テスト1: 失敗 (HTTP $status1)"
fi
echo ""

# テスト2: 最近の公開ツイート検索
echo "📋 テスト2: 公開ツイート検索"
echo "URL: https://api.twitter.com/2/tweets/search/recent"
echo ""

response2=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.twitter.com/2/tweets/search/recent?query=hello&max_results=5")

echo "Response:"
echo "$response2"
echo ""

status2=$(echo "$response2" | grep "HTTP_STATUS:" | cut -d: -f2)

if [ "$status2" = "200" ]; then
    echo "✅ テスト2: 成功 (HTTP $status2)"
else
    echo "❌ テスト2: 失敗 (HTTP $status2)"
fi
echo ""

# 結果サマリー
echo "🎯 テスト結果サマリー:"
if [ "$status1" = "200" ]; then
    echo "- ユーザー情報取得: ✅ 成功"
else
    echo "- ユーザー情報取得: ❌ 失敗 (HTTP $status1)"
fi

if [ "$status2" = "200" ]; then
    echo "- 公開ツイート検索: ✅ 成功"
else
    echo "- 公開ツイート検索: ❌ 失敗 (HTTP $status2)"
fi
echo ""

# 診断と対処法
if [ "$status1" != "200" ] && [ "$status2" != "200" ]; then
    echo "💡 考えられる問題:"
    case "$status1" in
        "401")
            echo "- Bearer Token が無効または間違っている"
            echo "- Twitter Developer Portal で Token を再生成してください"
            ;;
        "403")
            echo "- API の権限が不足している"
            echo "- Developer Portal でアプリの権限設定を確認してください"
            ;;
        "429")
            echo "- Rate limit に達している"
            echo "- 15分後に再試行してください"
            ;;
        "000")
            echo "- ネットワーク接続エラーまたはDNS問題"
            ;;
        *)
            echo "- 予期しないエラー (HTTP $status1)"
            ;;
    esac
    echo ""
    echo "対処手順:"
    echo "1. https://developer.twitter.com/en/portal/dashboard にアクセス"
    echo "2. アプリの 'Keys and tokens' で Bearer Token を再生成"
    echo "3. 新しい Token で再テスト"
fi