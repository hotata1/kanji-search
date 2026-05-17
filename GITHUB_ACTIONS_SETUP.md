# GitHub Actions でのパスワード管理セットアップ

このドキュメントでは、GitHub Actions を使用してパスワードハッシュを安全に管理する方法を説明します。

## セットアップ手順

### 1. GitHub Secrets に PASSWORD_HASH を登録

#### 手順：
1. GitHub でリポジトリを開く
2. **Settings** → **Secrets and variables** → **Actions** をクリック
3. **New repository secret** をクリック
4. 以下の情報を入力：
   - **Name**: `PASSWORD_HASH`
   - **Secret**: `71c352cfad6c7f094b3c2dd07804157a180ae01c57f55710fecae3b6af882c3d`
5. **Add secret** をクリック

#### スクリーンショット（イメージ）：
```
Repository → Settings → Secrets and variables → Actions
    ↓
[New repository secret]
    ↓
Name: PASSWORD_HASH
Secret: 71c352cfad6c7f094b3c2dd07804157a180ae01c57f55710fecae3b6af882c3d
    ↓
[Add secret]
```

### 2. パスワードハッシュを変更したい場合

1. Settings → Secrets で既存の `PASSWORD_HASH` をクリック
2. **Update secret** をクリック
3. 新しいハッシュ値を入力
4. **Update secret** をクリック

### 3. 自動デプロイの確認

1. リポジトリに push すると、自動的に GitHub Actions が実行されます
2. **Actions** タブで実行状況を確認できます
3. ビルド成功後、GitHub Pages に自動デプロイされます

## ワークフローの仕組み

### `build-and-deploy.yml` の流れ

```
1. コードをチェックアウト
   ↓
2. Node.js をセットアップ
   ↓
3. build.js を実行（環境変数を HTML に埋め込み）
   ↓
4. ビルドを検証（プレースホルダーが置き換わったか確認）
   ↓
5. GitHub Pages にデプロイ
```

### 環境変数の安全性

- ✅ `PASSWORD_HASH` は GitHub Secrets に安全に保存
- ✅ ビルド時のみ使用、ログには出力されない
- ✅ リポジトリには含まれない
- ✅ Secrets の値は GitHub 画面にも表示されない

## トラブルシューティング

### エラー: "PASSWORD_HASH 環境変数が設定されていません"

**原因**: Secrets が正しく登録されていない

**解決方法**:
1. Settings → Secrets で `PASSWORD_HASH` が存在するか確認
2. 名前が正確に `PASSWORD_HASH` であることを確認（大文字小文字区別）
3. リポジトリが正しいことを確認

### エラー: "プレースホルダーが見つかりません"

**原因**: index.html に `___PASSWORD_HASH_PLACEHOLDER___` が含まれていない

**解決方法**:
```javascript
const PASSWORD_HASH = "___PASSWORD_HASH_PLACEHOLDER___";
```
を index.html に追加

### GitHub Pages にデプロイされない

**解決方法**:
1. Repository → Settings → Pages
2. **Source** が "GitHub Actions" に設定されていることを確認
3. Actions タブでワークフローが成功しているか確認

## セキュリティ上の注意

⚠️ **重要**
- `PASSWORD_HASH` を直接リポジトリに commit しないでください
- Secrets は GitHub が暗号化して保管します
- Secrets の値は誤って表示されません

## ファイル構成

```
kanji-search/
├── .github/workflows/
│   └── build-and-deploy.yml    # GitHub Actions ワークフロー
├── build.js                     # ビルドスクリプト
├── index.html                   # プレースホルダー付き
└── その他のファイル
```

## 使用例

### パスワードハッシュを新しいものに変更

1. 新しいパスワードのハッシュを生成
   ```javascript
   // ブラウザコンソール
   async function generateHash(password) {
       const msgBuffer = new TextEncoder().encode(password);
       const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
       const hashArray = Array.from(new Uint8Array(hashBuffer));
       return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
   }
   generateHash('newpassword');
   ```

2. GitHub Settings → Secrets で `PASSWORD_HASH` を更新

3. リポジトリに push すると、自動的に新しいハッシュでビルド・デプロイされます

## 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Pages](https://docs.github.com/en/pages)
