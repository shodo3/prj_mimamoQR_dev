import nodemailer from "nodemailer";

export type EmailNotifyInput = {
  to: string[];
  subject: string;
  text: string;
};

export type EmailNotifyResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function env(name: string) {
  return process.env[name]?.trim();
}

export async function sendEmail(
  input: EmailNotifyInput,
): Promise<EmailNotifyResult> {
  const toDomains = input.to
    .map((e) => e.trim())
    .filter(Boolean)
    .map((e) => {
      const at = e.indexOf("@");
      return at >= 0 ? e.slice(at + 1).toLowerCase() : "unknown";
    });
  const uniqueDomains = Array.from(new Set(toDomains));

  const host = env("SMTP_HOST");
  const portRaw = env("SMTP_PORT");
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");
  const from = env("MAIL_FROM") || user;

  if (!host || !portRaw || !from) {
    console.error("[sendEmail] SMTP設定不足", {
      host: Boolean(host),
      port: Boolean(portRaw),
      from: Boolean(from),
      toDomains: uniqueDomains,
    });
    return {
      ok: false,
      message:
        "SMTP設定が不足しているため送信をスキップしました（SMTP_HOST/SMTP_PORT/MAIL_FROM）。",
    };
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) {
    console.error("[sendEmail] SMTP_PORT不正", { portRaw, toDomains: uniqueDomains });
    return { ok: false, message: "SMTP_PORT が不正です。" };
  }

  console.log("[sendEmail] sending mail", {
    host,
    port,
    secure: port === 465,
    hasAuth: Boolean(user && pass),
    toDomains: uniqueDomains,
  });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  try {
    const info = await transporter.sendMail({
      from,
      to: input.to.join(","),
      subject: input.subject,
      text: input.text,
    });

    console.log("[sendEmail] send ok", {
      hasMessageId: Boolean(info.messageId),
      toDomains: uniqueDomains,
    });
    return { ok: true, message: `sent:${info.messageId || "ok"}` };
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    console.error("[sendEmail] send failed", {
      toDomains: uniqueDomains,
      error: message,
    });
    return { ok: false, message };
  }
}

