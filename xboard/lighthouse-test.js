#!/usr/bin/env node

/**
 * Lighthouse自動テストスクリプト
 * パフォーマンス・PWA・SEO・アクセシビリティを測定
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function runLighthouse(url, options = {}) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  
  const config = {
    extends: 'lighthouse:default',
    settings: {
      formFactor: options.mobile ? 'mobile' : 'desktop',
      throttling: options.mobile ? 
        lighthouse.config.constants.throttling.mobileSlow4G :
        lighthouse.config.constants.throttling.desktopDense4G,
      screenEmulation: options.mobile ?
        lighthouse.config.constants.screenEmulationMetrics.mobile :
        lighthouse.config.constants.screenEmulationMetrics.desktop,
      emulatedUserAgent: options.mobile ?
        lighthouse.config.constants.userAgents.mobile :
        lighthouse.config.constants.userAgents.desktop,
    }
  };

  const runnerResult = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
  }, config);

  await chrome.kill();

  return runnerResult;
}

function formatScore(score) {
  if (score === null || score === undefined) return 'N/A';
  return Math.round(score * 100);
}

function getScoreEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟡';
  return '🔴';
}

async function testUrls() {
  const testUrls = [
    {
      name: 'メインアプリケーション',
      url: 'http://localhost:4173/',
      mobile: false
    },
    {
      name: 'メインアプリケーション (モバイル)',
      url: 'http://localhost:4173/',
      mobile: true
    },
    {
      name: '埋め込みデモ',
      url: 'http://localhost:4173/embed-demo.html',
      mobile: false
    },
    {
      name: 'iframeデモ',
      url: 'http://localhost:4173/iframe-demo.html',
      mobile: false
    }
  ];

  console.log('🔍 Lighthouse パフォーマンステスト開始\n');

  const results = [];

  for (const test of testUrls) {
    console.log(`📊 測定中: ${test.name} ${test.mobile ? '(モバイル)' : '(デスクトップ)'}`);
    
    try {
      const result = await runLighthouse(test.url, { mobile: test.mobile });
      const lhr = result.lhr;
      
      const scores = {
        performance: formatScore(lhr.categories.performance?.score),
        accessibility: formatScore(lhr.categories.accessibility?.score),
        bestPractices: formatScore(lhr.categories['best-practices']?.score),
        seo: formatScore(lhr.categories.seo?.score),
        pwa: lhr.categories.pwa ? formatScore(lhr.categories.pwa.score) : 'N/A'
      };

      results.push({
        name: test.name,
        mobile: test.mobile,
        url: test.url,
        scores
      });

      console.log(`  ${getScoreEmoji(scores.performance/100)} Performance: ${scores.performance}`);
      console.log(`  ${getScoreEmoji(scores.accessibility/100)} Accessibility: ${scores.accessibility}`);
      console.log(`  ${getScoreEmoji(scores.bestPractices/100)} Best Practices: ${scores.bestPractices}`);
      console.log(`  ${getScoreEmoji(scores.seo/100)} SEO: ${scores.seo}`);
      if (scores.pwa !== 'N/A') {
        console.log(`  ${getScoreEmoji(scores.pwa/100)} PWA: ${scores.pwa}`);
      }
      console.log('');

    } catch (error) {
      console.error(`❌ ${test.name} のテストに失敗:`, error.message);
      results.push({
        name: test.name,
        mobile: test.mobile,
        url: test.url,
        error: error.message
      });
    }
  }

  return results;
}

function generateReport(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(__dirname, `lighthouse-report-${timestamp}.json`);
  
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log('📋 Lighthouse テスト結果サマリー');
  console.log('================================');
  
  let allPassed = true;
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.name}: エラー - ${result.error}`);
      allPassed = false;
      return;
    }
    
    const scores = result.scores;
    const deviceType = result.mobile ? 'モバイル' : 'デスクトップ';
    
    console.log(`\n📱 ${result.name} (${deviceType})`);
    console.log(`   Performance: ${getScoreEmoji(scores.performance/100)} ${scores.performance}`);
    console.log(`   Accessibility: ${getScoreEmoji(scores.accessibility/100)} ${scores.accessibility}`);
    console.log(`   Best Practices: ${getScoreEmoji(scores.bestPractices/100)} ${scores.bestPractices}`);
    console.log(`   SEO: ${getScoreEmoji(scores.seo/100)} ${scores.seo}`);
    if (scores.pwa !== 'N/A') {
      console.log(`   PWA: ${getScoreEmoji(scores.pwa/100)} ${scores.pwa}`);
    }
    
    // 90点未満のカテゴリをチェック
    const failedCategories = [];
    if (scores.performance < 90) failedCategories.push(`Performance(${scores.performance})`);
    if (scores.accessibility < 90) failedCategories.push(`Accessibility(${scores.accessibility})`);
    if (scores.bestPractices < 90) failedCategories.push(`Best Practices(${scores.bestPractices})`);
    if (scores.seo < 90) failedCategories.push(`SEO(${scores.seo})`);
    
    if (failedCategories.length > 0) {
      console.log(`   ⚠️  90点未満: ${failedCategories.join(', ')}`);
      allPassed = false;
    }
  });
  
  console.log('\n================================');
  
  if (allPassed) {
    console.log('🎉 すべてのテストで90点以上を達成！');
  } else {
    console.log('⚠️  一部テストで90点未満のカテゴリがあります');
  }
  
  console.log(`\n📄 詳細レポート: ${reportPath}`);
  
  return allPassed;
}

async function main() {
  console.log('⚡ Lighthouse自動テストツール');
  console.log('対象要件: Performance, Accessibility, Best Practices, SEO ≥ 90点\n');
  
  // サーバーが起動しているかチェック
  try {
    const response = await fetch('http://localhost:4173/');
    if (!response.ok) {
      throw new Error('Server not responding');
    }
  } catch (error) {
    console.error('❌ localhost:4173 にアクセスできません');
    console.log('以下のコマンドでサーバーを起動してください:');
    console.log('pnpm run preview --port 4173');
    process.exit(1);
  }
  
  try {
    const results = await testUrls();
    const allPassed = generateReport(results);
    
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('❌ テスト実行中にエラーが発生:', error);
    process.exit(1);
  }
}

// Node.js 18+ fetch polyfill
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runLighthouse, testUrls, generateReport };