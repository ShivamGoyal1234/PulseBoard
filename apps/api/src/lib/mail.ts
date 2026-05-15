import nodemailer from 'nodemailer'

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  const host = process.env.SMTP_HOST ?? 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM ?? user

  const html = `
    <p>You asked to reset your pulseBoard password.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p style="color:#666;font-size:12px;">This link expires in 1 hour. If you didn’t request this, you can ignore this email.</p>
    <p style="color:#666;font-size:11px;word-break:break-all;">${resetUrl}</p>
  `

  if (!user || !pass || !from) {
    console.warn('[mail] SMTP not configured (SMTP_USER / SMTP_PASS / SMTP_FROM). Reset URL:', resetUrl)
    return
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  await transporter.sendMail({
    from,
    to,
    subject: 'Reset your pulseBoard password',
    html,
  })
}
