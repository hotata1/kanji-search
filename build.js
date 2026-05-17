#!/usr/bin/env node
/**
 * ビルドスクリプト
 * 環境変数を index.html に埋め込む
 */

const fs = require('fs');
const path = require('path');

// 環境変数からパスワードハッシュを取得
const passwordHash = process.env.PASSWORD_HASH;

if (!passwordHash) {
    console.error('❌ エラー: PASSWORD_HASH 環境変数が設定されていません');
    process.exit(1);
}

console.log('🔨 ビルド開始...');
console.log(`📝 PASSWORD_HASH: ${passwordHash.substring(0, 10)}...`);

// index.html を読み込む
const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

// プレースホルダーを環境変数に置き換え
const placeholder = 'const PASSWORD_HASH = "___PASSWORD_HASH_PLACEHOLDER___";';
const replacement = `const PASSWORD_HASH = "${passwordHash}";`;

if (!html.includes(placeholder)) {
    console.error('❌ エラー: プレースホルダーが見つかりません');
    console.error('index.html に以下の行が必要です:');
    console.error(placeholder);
    process.exit(1);
}

html = html.replace(placeholder, replacement);

// ビルド済みファイルを保存
fs.writeFileSync(indexPath, html, 'utf-8');

console.log('✅ ビルド完了！');
console.log('📦 index.html を更新しました');
