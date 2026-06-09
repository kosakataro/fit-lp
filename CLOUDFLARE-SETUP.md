# Cloudflare Pages デプロイ手順

`kosakataro/fit-lp` を Cloudflare Pages に接続し、Basic Auth で保護する手順。

---

## ステップ 1 — Cloudflare アカウント作成（無料）

1. https://dash.cloudflare.com/sign-up を開く
2. メールアドレス + パスワードで登録
3. メール認証を完了

---

## ステップ 2 — Pages プロジェクト作成

1. ダッシュボード左メニュー → **Workers & Pages**
2. **Create application** → **Pages** タブ → **Connect to Git**
3. GitHub認証 → 「Only select repositories」→ `kosakataro/fit-lp` を許可 → **Install & Authorize**
4. リポ一覧から `fit-lp` を選択 → **Begin setup**
5. ビルド設定:
   - Project name: `fit-lp`（自動入力でOK）
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: 空欄
   - Build output directory: `/`
6. **Save and Deploy**

初回デプロイ後、`https://fit-lp.pages.dev` のような無料URLが発行されます（まだ認証なし）。

---

## ステップ 3 — Basic Auth 設定

1. プロジェクト画面 → **Settings** → **Environment variables**
2. **Production** タブで **Add variable**:
   - 変数 1
     - Variable name: `BASIC_AUTH_USER`
     - Value: 任意のユーザー名（例: `client`）
   - 変数 2
     - Variable name: `BASIC_AUTH_PASS`
     - Value: 強力なパスワード（**長く**ランダムに。例: `8nF#kQ2pL9wXr5vZ`）
3. **Save**
4. **Deployments** タブ → 最新デプロイの **⋯** → **Retry deployment**（再デプロイで反映）

→ これで `https://fit-lp.pages.dev` を開くとブラウザ認証ダイアログが出るようになります。

---

## ステップ 4 — 独自ドメイン接続

`fit.vivivi.co.jp` のようなサブドメインを接続するパターン。

### A. ドメインがCloudflareで管理されていない場合

1. プロジェクト → **Custom domains** → **Set up a custom domain**
2. `fit.vivivi.co.jp` を入力 → **Continue**
3. 表示されるDNS設定を、ドメイン管理元（お名前.com/HETEMLなど）で追加:
   - レコードタイプ: **CNAME**
   - 名前: `fit`
   - 値: `fit-lp.pages.dev`
   - TTL: 自動 or 3600
4. DNS反映後（数分〜数時間）自動でSSL証明書発行・有効化

### B. ドメインをCloudflareに移管する場合（推奨・将来のため）

1. ダッシュボード → **Websites** → **Add a site**
2. `vivivi.co.jp` を入力 → **Free** プラン選択
3. Cloudflareが現行DNSをスキャン → 確認
4. ドメイン管理元で**ネームサーバー**をCloudflare指定のものに変更
5. 反映後、PagesのCustom domainsで `fit.vivivi.co.jp` を追加するだけ

---

## 多案件運用（複数LP）

1案件1リポ → 1Pagesプロジェクト → 1サブドメイン、の構成が清潔。

```
fit.vivivi.co.jp         → kosakataro/fit-lp
dx.vivivi.co.jp          → kosakataro/dx-lp
project-x.vivivi.co.jp   → kosakataro/project-x
```

各プロジェクトに別々の `BASIC_AUTH_PASS` を設定可能。

---

## メンテナンス

- **コンテンツ更新**: GitHubに `git push` → Cloudflareが自動再デプロイ（30秒〜1分）
- **パスワード変更**: Environment variables を更新 → Retry deployment
- **アクセスログ**: Pages → Analytics タブ
- **プレビュー環境**: PRごとに自動でプレビューURL発行（こちらにもBASIC認証適用）

---

## トラブル

- **401 が消えない** → 環境変数のスペル確認、Retry deployment必須
- **DNSが浸透しない** → `dig fit.vivivi.co.jp` で確認、数時間待つ
- **HTTPS証明書エラー** → Custom domain追加から最大15分待つ
- **Worker動かない** → ファイル位置確認: `functions/_middleware.js` が repo root の直下
