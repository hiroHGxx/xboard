#!/usr/bin/env node

/**
 * X API v2 包括的診断プログラム
 * 認証問題の根本原因を特定し、解決策を提案
 */

console.log('🔬 X API v2 包括的診断ツール');
console.log('=====================================');
console.log('');

// 環境チェック
const BEARER_TOKEN = process.env.X_BEARER_TOKEN;

if (!BEARER_TOKEN) {
    console.log('❌ 診断失敗: X_BEARER_TOKEN 環境変数が設定されていません');
    console.log('');
    console.log('設定方法:');
    console.log('  export X_BEARER_TOKEN="your_bearer_token_here"');
    console.log('  node x-api-diagnosis.js');
    console.log('');
    console.log('または:');
    console.log('  X_BEARER_TOKEN="your_token" node x-api-diagnosis.js');
    process.exit(1);
}

// Bearer Token 分析
function analyzeBearerToken(token) {
    console.log('📊 Bearer Token 分析');
    console.log('─────────────────────');
    
    const length = token.length;
    const prefix = token.substring(0, 10);
    const suffix = token.substring(token.length - 10);
    
    console.log(`長さ: ${length} 文字`);
    console.log(`プレフィックス: ${prefix}...`);
    console.log(`サフィックス: ...${suffix}`);
    
    // X API v2 Bearer Token の一般的な特徴
    const issues = [];
    
    if (length < 50) {
        issues.push('⚠️  Token が短すぎます (通常70+文字)');
    }
    
    if (length > 200) {
        issues.push('⚠️  Token が長すぎます (通常200文字以下)');
    }
    
    // 一般的なBase64文字セットチェック
    const base64Pattern = /^[A-Za-z0-9+/=_-]+$/;
    if (!base64Pattern.test(token)) {
        issues.push('⚠️  Token に無効な文字が含まれています');
    }
    
    // よくある間違い
    if (token.includes(' ')) {
        issues.push('❌ Token にスペースが含まれています');
    }
    
    if (token.startsWith('Bearer ')) {
        issues.push('❌ Token に "Bearer " プレフィックスが含まれています（不要）');
    }
    
    if (issues.length === 0) {
        console.log('✅ Token 形式: 正常');
    } else {
        console.log('Token の問題:');
        issues.forEach(issue => console.log(`  ${issue}`));
    }
    
    console.log('');
    return issues.length === 0;
}

// API テスト実行
async function testAPIEndpoint(name, url, expectedField) {
    console.log(`🧪 ${name} テスト`);
    console.log(`URL: ${url}`);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        
        const status = response.status;
        console.log(`ステータス: ${status} ${response.statusText}`);
        
        if (status === 200) {
            const data = await response.json();
            if (expectedField && data[expectedField]) {
                console.log(`✅ 成功: ${expectedField} フィールド確認`);
                return { success: true, status, data };
            } else {
                console.log(`✅ 成功: API レスポンス取得`);
                return { success: true, status, data };
            }
        } else {
            const errorText = await response.text();
            console.log(`❌ 失敗: ${errorText}`);
            return { success: false, status, error: errorText };
        }
        
    } catch (error) {
        console.log(`❌ ネットワークエラー: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// 包括的診断実行
async function runDiagnosis() {
    // 1. Token 分析
    const tokenOK = analyzeBearerToken(BEARER_TOKEN);
    
    // 2. 基本的なユーザー情報取得テスト
    const userTest = await testAPIEndpoint(
        'ユーザー情報取得',
        'https://api.twitter.com/2/users/by/username/elonmusk?user.fields=id,name,username',
        'data'
    );
    console.log('');
    
    // 3. ツイート検索テスト
    const searchTest = await testAPIEndpoint(
        'ツイート検索',
        'https://api.twitter.com/2/tweets/search/recent?query=hello&max_results=5',
        'data'
    );
    console.log('');
    
    // 4. より複雑なテスト（ユーザーのツイート取得）
    let timelineTest = null;
    if (userTest.success && userTest.data?.data?.id) {
        const userId = userTest.data.data.id;
        timelineTest = await testAPIEndpoint(
            'ユーザータイムライン取得',
            `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=id,text,created_at`,
            'data'
        );
        console.log('');
    }
    
    // 5. 診断結果とレコメンデーション
    console.log('🎯 診断結果サマリー');
    console.log('==================');
    console.log(`Token 形式: ${tokenOK ? '✅ 正常' : '❌ 問題あり'}`);
    console.log(`ユーザー情報取得: ${userTest.success ? '✅ 成功' : '❌ 失敗'}`);
    console.log(`ツイート検索: ${searchTest.success ? '✅ 成功' : '❌ 失敗'}`);
    if (timelineTest) {
        console.log(`タイムライン取得: ${timelineTest.success ? '✅ 成功' : '❌ 失敗'}`);
    }
    console.log('');
    
    // 6. 問題診断と解決策
    if (!userTest.success || !searchTest.success) {
        console.log('🔧 問題診断と解決策');
        console.log('===================');
        
        const status = userTest.status || searchTest.status;
        
        switch (status) {
            case 401:
                console.log('問題: 認証エラー (401 Unauthorized)');
                console.log('');
                console.log('考えられる原因:');
                console.log('• Bearer Token が無効または期限切れ');
                console.log('• Token が正しくコピーされていない');
                console.log('• Developer Portal での設定ミス');
                console.log('');
                console.log('解決手順:');
                console.log('1. https://developer.twitter.com/en/portal/dashboard にアクセス');
                console.log('2. 対象アプリの "Keys and tokens" タブを開く');
                console.log('3. "Bearer Token" セクションで "Regenerate" をクリック');
                console.log('4. 新しい Token をコピーして環境変数に設定');
                console.log('5. このスクリプトで再テスト');
                break;
                
            case 403:
                console.log('問題: 権限不足 (403 Forbidden)');
                console.log('');
                console.log('考えられる原因:');
                console.log('• アプリの権限設定が不十分');
                console.log('• Twitter Developer 申請が未承認');
                console.log('• 有料プランが必要な機能へのアクセス');
                console.log('');
                console.log('解決手順:');
                console.log('1. Developer Portal でアプリ設定を確認');
                console.log('2. "App permissions" を "Read" 以上に設定');
                console.log('3. 必要に応じて審査申請を完了');
                break;
                
            case 429:
                console.log('問題: レート制限 (429 Too Many Requests)');
                console.log('');
                console.log('解決策:');
                console.log('• 15分後に再試行');
                console.log('• より少ない頻度でAPIを呼び出す');
                console.log('• 有料プランへの升级を検討');
                break;
                
            default:
                console.log(`問題: 予期しないエラー (HTTP ${status})`);
                console.log('');
                console.log('一般的な解決策:');
                console.log('• ネットワーク接続を確認');
                console.log('• X API ステータスページを確認: https://api.twitterstat.us/');
                console.log('• Bearer Token を再生成');
        }
    } else {
        console.log('🎉 すべてのテストが成功しました！');
        console.log('');
        console.log('次のステップ:');
        console.log('• メインアプリケーションでX APIを有効化');
        console.log('• 本番環境の環境変数設定');
        console.log('• レート制限を考慮したキャッシュ実装');
    }
}

// Node.js 18+ の fetch サポート確認
if (typeof fetch === 'undefined') {
    console.log('❌ この環境では fetch がサポートされていません');
    console.log('');
    console.log('Node.js 18+ を使用するか、以下をインストールしてください:');
    console.log('npm install node-fetch');
    process.exit(1);
}

// メイン実行
runDiagnosis().catch(error => {
    console.error('診断中にエラーが発生しました:', error);
    process.exit(1);
});