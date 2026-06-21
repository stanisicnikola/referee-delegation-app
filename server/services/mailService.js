const nodemailer = require("nodemailer");

class MailService {
  constructor() {
    this.transporter = null;
  }

  getClientUrl() {
    return (
      process.env.CLIENT_URL ||
      process.env.FRONTEND_URL ||
      "http://localhost:5173"
    ).replace(/\/$/, "");
  }

  getFromAddress() {
    return (
      process.env.MAIL_FROM ||
      process.env.SMTP_FROM ||
      '"RefDelegate" <no-reply@refdelegate.local>'
    );
  }

  getTransporter() {
    if (this.transporter) return this.transporter;
    if (!process.env.SMTP_HOST) return null;

    const port = Number(process.env.SMTP_PORT || 587);

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });

    return this.transporter;
  }

  async sendMail(mailOptions) {
    const transporter = this.getTransporter();

    if (!transporter) {
      console.warn(
        `[mail] SMTP_HOST is not configured. Skipping email to ${mailOptions.to}.`,
      );
      console.warn(`[mail] Subject: ${mailOptions.subject}`);
      if (mailOptions.text) {
        console.warn(`[mail] Preview:\n${mailOptions.text}`);
      }
      return { skipped: true, reason: "SMTP is not configured." };
    }

    return transporter.sendMail({
      from: this.getFromAddress(),
      ...mailOptions,
    });
  }

  buildWelcomeText({ user, resetUrl }) {
    const lines = [
      `Hello ${user.firstName},`,
      "",
      "Your RefDelegate account has been created.",
      `Email: ${user.email}`,
      `Role: ${user.role}`,
      "",
    ];

    if (resetUrl) {
      lines.push(
        "Please set your password before signing in:",
        resetUrl,
        "",
        "This link expires in 7 days.",
      );
    } else {
      lines.push(
        "You can sign in with the password shared by your administrator.",
      );
    }

    lines.push("", "RefDelegate");
    return lines.join("\n");
  }

  buildWelcomeHtml({ user, resetUrl }) {
    const actionBlock = resetUrl
      ? `
        <p style="margin:0 0 18px;color:#d4d4d8;line-height:1.6">
          Please set your password before signing in. This link expires in 7 days.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#8b5cf6;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">
          Set password
        </a>
      `
      : `
        <p style="margin:0;color:#d4d4d8;line-height:1.6">
          You can sign in with the password shared by your administrator.
        </p>
      `;

    return `
      <div style="margin:0;padding:32px;background:#0f0f11;font-family:Inter,Arial,sans-serif;color:#ffffff">
        <div style="max-width:560px;margin:0 auto;background:#18181b;border:1px solid #27272a;border-radius:12px;padding:28px">
          <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25">Welcome to RefDelegate</h1>
          <p style="margin:0 0 20px;color:#d4d4d8;line-height:1.6">
            Hello ${user.firstName}, your account has been created.
          </p>
          <div style="margin:0 0 22px;padding:14px 16px;background:#111113;border-radius:8px;color:#d4d4d8">
            <div><strong style="color:#ffffff">Email:</strong> ${user.email}</div>
            <div><strong style="color:#ffffff">Role:</strong> ${user.role}</div>
          </div>
          ${actionBlock}
          <p style="margin:26px 0 0;color:#71717a;font-size:13px;line-height:1.6">
            If you did not expect this account, you can ignore this email.
          </p>
        </div>
      </div>
    `;
  }

  async sendWelcomeEmail({ user, resetToken }) {
    const resetUrl = resetToken
      ? `${this.getClientUrl()}/reset-password/${resetToken}`
      : null;

    return this.sendMail({
      to: user.email,
      subject: resetUrl
        ? "Welcome to RefDelegate - set your password"
        : "Welcome to RefDelegate",
      text: this.buildWelcomeText({ user, resetUrl }),
      html: this.buildWelcomeHtml({ user, resetUrl }),
    });
  }

  buildPasswordResetText({ user, resetUrl }) {
    return [
      `Hello ${user.firstName || "there"},`,
      "",
      "We received a request to reset your RefDelegate password.",
      "Use the link below to choose a new password:",
      resetUrl,
      "",
      "If you did not request this, you can ignore this email.",
      "",
      "RefDelegate",
    ].join("\n");
  }

  buildPasswordResetHtml({ user, resetUrl }) {
    return `
      <div style="margin:0;padding:32px;background:#0f0f11;font-family:Inter,Arial,sans-serif;color:#ffffff">
        <div style="max-width:560px;margin:0 auto;background:#18181b;border:1px solid #27272a;border-radius:12px;padding:28px">
          <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25">Reset your password</h1>
          <p style="margin:0 0 20px;color:#d4d4d8;line-height:1.6">
            Hello ${user.firstName || "there"}, we received a request to reset your RefDelegate password.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">
            Reset password
          </a>
          <p style="margin:26px 0 0;color:#71717a;font-size:13px;line-height:1.6">
            If you did not request this, you can ignore this email.
          </p>
        </div>
      </div>
    `;
  }

  async sendPasswordResetEmail({ user, resetToken }) {
    const resetUrl = `${this.getClientUrl()}/reset-password/${resetToken}`;

    return this.sendMail({
      to: user.email,
      subject: "Reset your RefDelegate password",
      text: this.buildPasswordResetText({ user, resetUrl }),
      html: this.buildPasswordResetHtml({ user, resetUrl }),
    });
  }
}

module.exports = new MailService();
