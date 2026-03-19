import { promises as fs } from "node:fs";
import path from "node:path";

type NotifyTargetsConfig = {
  byPublicTagId?: Record<string, string[]>;
};

function getConfigPath() {
  return (
    process.env.NOTIFY_TARGETS_PATH?.trim() ||
    path.join(process.cwd(), "config", "notifyTargets.json")
  );
}

function normalizeEmails(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const emails = input
    .filter((v) => typeof v === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  // 重複除去（順序維持）
  return emails.filter((v, i) => emails.indexOf(v) === i);
}

export async function getNotifyEmailsForTag(publicTagId: string): Promise<string[]> {
  const configPath = getConfigPath();

  try {
    const raw = await fs.readFile(configPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return [];

    const cfg = parsed as NotifyTargetsConfig;
    const by = cfg.byPublicTagId;
    if (!by || typeof by !== "object") return [];

    return normalizeEmails((by as Record<string, unknown>)[publicTagId]);
  } catch {
    // ファイル未作成/JSON不正などは「未設定」として扱い、安全にスキップできるようにする
    return [];
  }
}

