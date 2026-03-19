function normalizeEmails(input: string): string[] {
  // `NOTIFY_EMAILS="a@b.com,c@d.com"` のような形式を想定
  const emails = input
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  // 重複除去（順序維持）
  return emails.filter((v, i) => emails.indexOf(v) === i);
}

/**
 * MVP用: publicTagId ごとの分岐は一旦不要にし、環境変数 `NOTIFY_EMAILS` だけを返す。
 * - 個人情報をコード本体に残さない目的に合わせる
 */
export async function getNotifyEmailsForTag(
  _publicTagId: string,
): Promise<string[]> {
  const raw = process.env.NOTIFY_EMAILS?.trim();
  if (!raw) return [];
  return normalizeEmails(raw);
}

