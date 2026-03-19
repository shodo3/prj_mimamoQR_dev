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
  const host = env("SMTP_HOST");
  const portRaw = env("SMTP_PORT");
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");
  const from = env("MAIL_FROM") || user;

  if (!host || !portRaw || !from) {
    return {
      ok: false,
      message:
        "SMTP設定が不足しているため送信をスキップしました（SMTP_HOST/SMTP_PORT/MAIL_FROM）。",
    };
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) {
    return { ok: false, message: "SMTP_PORT が不正です。" };
  }

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

    return { ok: true, message: `sent:${info.messageId || "ok"}` };
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return { ok: false, message };
  }
}

