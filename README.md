# QRスキャン通知システム（STEP0-MVP）

子どもが持つQRコードを、訪問先の保護者や習い事の担当者がスマホで読み取るだけで、保護者へ通知を送る最小MVPです。  
本MVPでは **個人情報（氏名・住所・学校名など）は一切登録・表示しません**。

## できること（今回のScope）

- **入口ページ**: `/s/[publicTagId]`
  - ページ表示時に位置情報取得を試行
  - 位置あり/なしどちらでも `POST /api/scan` へ送信
  - 送信成功後 `/done` へ遷移
- **完了画面**: `/done`
- **無効QRの最小表示**
- **Scan API**: `POST /api/scan`
  - `publicTagId` 妥当性確認 → イベント保存 → メール通知
- **最小データ保持**
  - `src/config/tags.ts` に公開ID（有効/無効）をファイル定義
  - 通知先メールは `config/notifyTargets.json`（git除外）で管理
  - `data/scanEvents.jsonl` にスキャンイベントをJSONLで保存

## セットアップ

```bash
npm install
```

## 起動

```bash
npm run dev -- --port 3000
```

## QRに埋め込むURL

例:

- `http://localhost:3000/s/tag_7f2c9d4a1b8e`

有効な `publicTagId` は `src/config/tags.ts` で管理します（**個人情報を入れない**こと）。

## メール通知（SMTP）

`.env.local` を作成し、以下を設定してください。

```bash
SMTP_HOST=your.smtp.host
SMTP_PORT=587
SMTP_USER=your_user_optional
SMTP_PASS=your_pass_optional
MAIL_FROM=from@example.com
```

- `SMTP_USER/SMTP_PASS` は必要なSMTP環境のみ設定してください
- 未設定の場合は送信をスキップし、`notifyResult` に理由が残ります

## 通知先メールアドレス（環境変数）

通知先はコード本体から分離し、`NOTIFY_EMAILS` 環境変数で設定します。

- 形式: `NOTIFY_EMAILS="test@example.com,another@example.com"`
- 区切り: `,` または改行

`NOTIFY_EMAILS` が未設定の場合、通知は **安全にスキップ**され `notifyResult` に理由が残ります。

## データ保存

- 保存先: `data/scanEvents.jsonl`
- 位置情報を含むため、gitには含めません（`.gitignore` 済み）

## 主要API

### `POST /api/scan`

受信:

- `publicTagId` (string)
- `lat?` (number)
- `lng?` (number)
- `accuracy?` (number)
- `locationStatus` ("granted" | "denied" | "unavailable" | "timeout" | "error")
- `clientTimestamp` (ISO string)

レスポンス:

- `200`: 保存・通知処理（通知は失敗/スキップでも `ok: true` を返す）
- `404`: 無効な `publicTagId`
- `400`: リクエスト不正

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
