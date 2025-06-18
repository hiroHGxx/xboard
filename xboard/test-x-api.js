#!/usr/bin/env node

/**
 * X API v2 テストプログラム
 * Bearer Token認証をテストし、問題を特定する
 */

const https = require('https');

// 環境変数から Bearer Token を取得
const BEARER_TOKEN = process.env.X_BEARER_TOKEN;

if (!BEARER_TOKEN) {
  console.error('❌ X_BEARER_TOKEN 環境変数が設定されていません');
  console.log('');
  console.log('設定方法:');
  console.log('export X_BEARER_TOKEN="your_bearer_token_here"');
  process.exit(1);
}

console.log('🔍 X API v2 Bearer Token テスト開始');
console.log('Token:', BEARER_TOKEN.substring(0, 20) + '...');
console.log('');

// テスト1: 簡単なユーザー情報取得 (elonmusk)
async function testUserLookup() {
  console.log('📋 テスト1: ユーザー情報取得 (elonmusk)');
  
  const url = 'https://api.twitter.com/2/users/by/username/elonmusk?user.fields=id,name,username,profile_image_url';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ エラーレスポンス:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ 成功:', JSON.stringify(data, null, 2));
    return true;
    
  } catch (error) {
    console.error('❌ ネットワークエラー:', error.message);
    return false;
  }
}

// テスト2: 公開ツイート取得
async function testPublicTweets() {
  console.log('📋 テスト2: 公開ツイート検索');
  
  const url = 'https://api.twitter.com/2/tweets/search/recent?query=from:elonmusk&max_results=5&tweet.fields=id,text,created_at,public_metrics&user.fields=id,name,username&expansions=author_id';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ エラーレスポンス:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ 成功:', JSON.stringify(data, null, 2));
    return true;
    
  } catch (error) {
    console.error('❌ ネットワークエラー:', error.message);
    return false;
  }
}

// テスト3: Bearer Token形式確認
function testTokenFormat() {
  console.log('📋 テスト3: Bearer Token形式確認');
  
  console.log('Token length:', BEARER_TOKEN.length);
  console.log('Token prefix:', BEARER_TOKEN.substring(0, 10));
  
  // X API v2 Bearer Token は通常70文字以上
  if (BEARER_TOKEN.length < 50) {
    console.warn('⚠️  Token が短すぎる可能性があります (通常70+文字)');
  }
  
  // Base64風の文字列かチェック
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  if (!base64Pattern.test(BEARER_TOKEN)) {
    console.warn('⚠️  Token が Base64 形式ではない可能性があります');
  }
  
  console.log('✅ Token形式チェック完了');
}

// メイン実行
async function main() {
  testTokenFormat();
  console.log('');
  
  const test1Result = await testUserLookup();
  console.log('');
  
  const test2Result = await testPublicTweets();
  console.log('');
  
  console.log('🎯 テスト結果サマリー:');
  console.log('- ユーザー情報取得:', test1Result ? '✅ 成功' : '❌ 失敗');
  console.log('- 公開ツイート検索:', test2Result ? '✅ 成功' : '❌ 失敗');
  
  if (!test1Result && !test2Result) {
    console.log('');
    console.log('💡 対処法:');
    console.log('1. Twitter Developer Portal で Bearer Token を再生成');
    console.log('2. X API v2 の権限設定を確認 (Read permissions)');
    console.log('3. Developer Portal の承認ステータスを確認');
    console.log('4. Rate limit に引っかかっていないか確認');
  }
}

// Node.js 18+ の fetch を使用、なければ axios フォールバック
if (typeof fetch === 'undefined') {
  console.log('📦 fetch が利用できません。node-fetch をインストールしてください:');
  console.log('npm install node-fetch');
  process.exit(1);
}

main().catch(console.error);