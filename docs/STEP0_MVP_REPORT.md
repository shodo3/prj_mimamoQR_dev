# STEP0-MVP（QRスキャン通知システム初期実装）完了レポート

## 実装概要

子どもが持つQRコードに **ランダムな公開ID付きURL** を埋め込み、訪問先の保護者/担当者がスマホで開くだけで、保護者へ **「スキャンされた事実」「時刻」「位置情報（取得できた場合）」** をメール通知する最小MVPを実装しました。  
本MVPでは **個人情報は登録も表示もしません**。到着/帰宅などの意味判定も行いません。

## 変更ファイル一覧（主要）

- `src/config/tags.ts`
  - 公開ID（`publicTagId`）と通知先メール（`notifyEmails`）をファイルで管理
- `src/server/storage/scanEvents.ts`
  - `data/scanEvents.jsonl` へスキャンイベントをJSONL追記保存
- `src/server/notify/email.ts`
  - nodemailer によるSMTPメール通知（環境変数で設定）
- `src/app/api/scan/route.ts`
  - `POST /api/scan`（妥当性確認 → 保存 → 通知）
- `src/app/s/[publicTagId]/*`
  - 入口ページ（位置情報取得→自動送信→`/done`）
- `src/app/done/page.tsx`
  - 完了画面
- `.gitignore`
  - `data/*.jsonl` を除外（位置情報を含みうるため）
- `README.md`
  - セットアップ/テスト/SMTP設定

## データ設計（最小）

- **tags 相当**: `src/config/tags.ts`
  - `publicTagId`: ランダムな公開ID
  - `enabled`: 有効/無効
  - `notifyEmails`: 通知先メールアドレス（MVPはファイル定義）
- **scanEvents 相当**: `data/scanEvents.jsonl`
  - `publicTagId`
  - `serverTimestamp`
  - `clientTimestamp`
  - `lat/lng/accuracy`（取得できた場合）
  - `locationStatus`
  - `mapUrl`（位置あり時）
  - `notifyResult`（メール送信結果/スキップ理由）

## 動作確認手順（主要フロー）

### 1) ビルド（Acceptance: build/型エラー無し）

```bash
npm run build
```

### 2) 開発サーバ起動

```bash
npm run dev -- --port 3000
```

### 3) 入口ページ（位置あり/なし）

- 有効なQR（例）: `http://localhost:3000/s/tag_7f2c9d4a1b8e`
  - 初回はブラウザ標準の位置情報許可フローが出る場合あり
  - 許可済み端末では、追加ボタン操作なしで自動送信→`/done`
  - 位置取得に失敗しても送信は継続（位置なしとして記録）

### 4) API（curlでの簡易確認）

- **有効ID（位置なし）**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/scan \
  -H 'content-type: application/json' \
  -d '{"publicTagId":"tag_7f2c9d4a1b8e","locationStatus":"unavailable","clientTimestamp":"2026-03-18T10:00:00.000Z"}'
```

- **無効ID（404）**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/scan \
  -H 'content-type: application/json' \
  -d '{"publicTagId":"invalid_tag","locationStatus":"unavailable","clientTimestamp":"2026-03-18T10:00:00.000Z"}'
```

- **有効ID（位置あり）**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/scan \
  -H 'content-type: application/json' \
  -d '{"publicTagId":"tag_7f2c9d4a1b8e","locationStatus":"granted","clientTimestamp":"2026-03-18T10:01:00.000Z","lat":35.681236,"lng":139.767125,"accuracy":25}'
```

### 5) 保存データ確認

`data/scanEvents.jsonl` にJSONLで追記されます（位置ありの場合 `mapUrl` も入る）。

## 通知テスト方法（メール）

1. `.env.local` にSMTPを設定（`README.md` を参照）
2. `src/config/tags.ts` の `notifyEmails` をテスト用メールアドレスに変更
3. `/s/[publicTagId]` を開く（または `curl`）→ メール受信を確認

通知文に含めるのは以下のみ:

- QRがスキャンされたこと
- 時刻（サーバ/端末）
- 位置情報（取得できた場合）
- Google Mapsリンク
- `publicTagId`

## 個人情報/識別方針の確認

- 個人情報（子どもの名前等）を登録していない（tags設定にも入れていない）
- UIに個人情報を表示していない
- QRはランダムな公開ID付きURLのみ
- `publicTagId` は原則画面に表示しない（エラー時も表示しない）

## 残課題（次ステップ候補）

- SMTP未設定環境でも確実にテストできる仕組み（例: メール送信のテスト用プロバイダ/モック）
- `tags` の管理をFirestore等へ移行する場合のマイグレーション方針
- いたずら防止（レート制限/署名付きURL/簡易BOT対策）
- 監査/運用向けのログ設計（個人情報を入れない前提の強化）

