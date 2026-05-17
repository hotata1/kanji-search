# 漢字検索ツール - GitHub Actions サイト監視セットアップガイド

## 📋 概要

GitHub Actionsを使用して、漢字検索ツールのサイト（https://hotata1.github.io/kanji-search/）を定期的に監視します。

### 監視内容
- **実行スケジュール**: 毎週月曜日 07:00 UTC（日本時間：月曜16:00）
- **チェック項目**:
  - HTTP ステータスコード（200確認）
  - ページタイトルの存在
  - 検索フォームの存在
  - JavaScriptの読み込み
  - ページサイズ（最小1000bytes）
- **問題検出時**: GitHub Issue自動作成 → GitHub通知メール

### ✅ セキュリティ
- 外部APIサービス不要
- 追加認証情報なし
- GitHub ネイティブ機能のみ使用

---

## 🚀 セットアップ手順（2ステップ）

### ステップ1: ワークフローをリポジトリにプッシュ

ワークフローファイル `.github/workflows/site-monitor.yml` は既に作成されています。

リポジトリにプッシュしてください：

```bash
git add .github/workflows/site-monitor.yml
git commit -m "feat: GitHub Actions でサイト監視を実装"
git push origin main
```

---

### ステップ2: GitHub通知をメール有効化

#### 2-1. GitHub Settings を開く

1. GitHub トップページ → 右上の **プロフィール画像** をクリック
2. **[Settings](https://github.com/settings/profile)** をクリック

#### 2-2. 通知設定を変更

1. 左側メニュー → **[Notifications](https://github.com/settings/notifications)**
2. 「**Email notifications**」セクションで以下を確認：

```
✅ Subscriptions
  └─ Watching
      └─ Email notifications: チェック
  
✅ Issues assigned to you
  └─ Email notifications: チェック
```

3. **[Save]** をクリック（変更がある場合）

#### 2-3. リポジトリの Watch 設定を確認

1. リポジトリのトップページ → **[Watch](../../subscription)** ボタン
2. ドロップダウン → **Watching** が選択されているか確認

```
Watching
  └─ Get notified of all conversations
```

---

## 📊 動作確認

### ✅ 成功した場合

**定期実行時**:
- 毎週月曜日 07:00 UTC に自動実行
- サイトが正常なら何も起こらない（成功時はIssue作成なし）

**手動テスト**:

1. リポジトリの **[Actions](../../actions)** タブを開く
2. 左側メニュー → **「漢字検索ツール - サイト監視」** をクリック
3. **[Run workflow]** ボタンをクリック
4. **[Run workflow]** をクリック

実行ログを確認：

```
✅ HTTP 200 OK
✅ サイト監視が正常に完了しました
```

→ **メール通知なし**（正常なため）

### ❌ 失敗した場合

**自動で以下が発生**:

1. GitHub Issue が自動作成される
   - タイトル: 「⚠️ 【アラート】漢字検索ツール - サイト異常検知」
   - ラベル: `🚨 bug`, `🔍 monitoring`

2. **GitHub通知メール** が自動配信される
   - 件名: Issue のタイトル
   - 本文: Issue の詳細内容

---

## 🔧 トラブルシューティング

### Q: メール通知が届かない

**A:** 以下を確認してください：

1. **GitHub通知設定を確認**
   - [Settings → Notifications](https://github.com/settings/notifications) を開く
   - 「Email notifications」が有効になっているか確認

2. **リポジトリを Watch しているか**
   - リポジトリトップ → **[Watch]** → **Watching** になっているか確認

3. **ジャンク/スパムフォルダを確認**
   - Gmail などのスパムフィルターに引っかかっていないか確認

4. **GitHub メールアドレスを確認**
   - [Settings → Emails](https://github.com/settings/emails) で通知先メールが正しいか確認

### Q: ワークフローが実行されない

**A:** スケジュール実行の要件を確認：

- **リポジトリはパブリック**か？
- **main ブランチに最新のワークフローが含まれている**か？
- **最近（過去60日以内）に push されている**か？
- GitHub Settings → **[Actions]** → **[General]** で Actions が有効になっているか確認

### Q: Issue が作成されたが、メールが来ない

**A:** GitHub通知の設定を再確認：

1. GitHub Settings → [Notifications](https://github.com/settings/notifications)
2. 「Issues assigned to you」に✅が入っているか確認
3. または、「Subscriptions」の「Watching」が有効か確認

---

## 📝 スケジュール変更方法

### 実行日時を変更したい場合

`.github/workflows/site-monitor.yml` の以下の行を編集：

```yaml
on:
  schedule:
    - cron: '0 7 * * 1'  # ← この行を編集
```

**cron フォーマット**: `分 時 日 月 曜日` (UTC)

| 希望の実行時刻 | cron 値 |
|---|---|
| 毎日09時UTC | `0 9 * * *` |
| 毎日09時と18時UTC | `0 9,18 * * *` |
| 毎週月曜16時UTC | `0 16 * * 1` |
| 毎月1日00時UTC | `0 0 1 * *` |

編集後、プッシュすれば自動で新しいスケジュールが適用されます。

---

## 📊 仕組み

```
毎週月曜日 07:00 UTC
        ↓
GitHub Actions がワークフローを実行
        ↓
サイトをチェック
        ↓
    問題なし          問題あり
      ↓                  ↓
   終了             Issue作成
                         ↓
                    GitHub通知
                         ↓
                    メール配信
```

---

## 🎯 メリット

✅ **セットアップが簡単** - 2ステップで完了  
✅ **外部サービス不要** - GitHub だけで完結  
✅ **セキュリティ高い** - GitHub ネイティブ  
✅ **料金無料** - ずっと無料  
✅ **Issue で一元管理** - ブラウザで詳細確認可能  
✅ **追加認証不要** - Client ID/Secret 設定なし  

---

## 📞 サポート

問題が発生した場合：

1. [GitHub Actions のドキュメント](https://docs.github.com/en/actions)
2. [GitHub 通知設定](https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github)
3. ワークフロー実行ログ（Actions タブ）の詳細を確認
4. リポジトリの Issues で報告

---

**最終更新**: 2026-05-17  
**セットアップ時間**: 約5分  
**料金**: 無料 🎉
