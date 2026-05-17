# セットアップガイド

## 環境変数の設定方法

このプロジェクトは `config.json` ファイルを使用して、パスワードハッシュを管理しています。

### 初回セットアップ

#### 1. `config.json` ファイルを作成

`config.example.json` をテンプレートとして、 `config.json` ファイルを作成してください。

```bash
cp config.example.json config.json
```

#### 2. パスワードハッシュを取得

新しいパスワードを設定したい場合は、以下のステップでハッシュ値を生成してください。

**ブラウザのコンソールで実行：**

```javascript
// パスワード「mypassword」のハッシュを生成する例
async function generateHash(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('Generated hash:', hashHex);
    return hashHex;
}

// 実行例
generateHash('mypassword');
```

出力されたハッシュ値をコピーします。

#### 3. `config.json` を編集

```json
{
  "passwordHash": "コピーしたハッシュ値をここに貼り付け"
}
```

### セキュリティ上の注意

⚠️ **重要**
- **`config.json` は `.gitignore` に登録されており、Git で追跡されません**
- **決してリポジトリに含めないでください**
- 公開する前に `config.json` が `.gitignore` に含まれていることを確認してください：

```bash
git status
```

このコマンドで `config.json` が表示されていなければ OK です。

### GitHub Pages でのデプロイ

1. `config.json` をローカルで作成・設定
2. `git push` でリポジトリにプッシュ（`config.json` は含まれません）
3. GitHub Pages でビルド・デプロイ（自動）
4. **本番環境でも `config.json` は手動で設置する必要があります**

本番サーバーで `config.json` を配置してください：

```bash
# 本番サーバーに SSH でログイン
scp config.json user@server:/path/to/site/
```

### トラブルシューティング

**エラー: "設定ファイルが見つかりません"**
- `config.json` がプロジェクトのルートディレクトリに存在することを確認してください
- ブラウザのコンソールで詳細なエラーメッセージを確認してください

**パスワードが間違っている**
- ハッシュ値が正しいか確認してください
- ハッシュ生成時に入力ミスがないか再度チェックしてください

### ファイル構成

```
kanji-search/
├── index.html          # メインページ（config.json を読み込み）
├── app.js              # アプリケーションロジック
├── auth.js             # 認証処理
├── styles.css          # スタイル
├── config.example.json # 設定ファイルのテンプレート（公開用）
├── config.json         # 実際の設定ファイル（.gitignore に登録）
└── .gitignore          # config.json を追跡から除外
```

## 最後に

セットアップが完了したら、`index.html` を開いて正常に動作することを確認してください。
