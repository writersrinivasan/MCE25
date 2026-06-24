import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM    = process.env.EMAIL_FROM    ?? 'MCE Silver Reunion <onboarding@resend.dev>'
const ADMIN   = process.env.ADMIN_EMAIL   ?? ''
const PORTAL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mce25.vercel.app'

// ─── Welcome email to new member ────────────────────────────────────────────

function welcomeHtml(name: string, sprno: string, branch: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 32px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">🎓</div>
            <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 4px;">MCE Silver Reunion 2026</h1>
            <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">Mookambigai College of Engineering · Batch 1997–2001</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <p style="color:#1e293b;font-size:20px;font-weight:600;margin:0 0 8px;">Welcome, ${name}! 👋</p>
            <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">
              You're now part of the official MCE Silver Reunion portal — 25 years in the making. Your registration is confirmed and you're ready to reconnect with your batchmates.
            </p>

            <!-- Details card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="color:#64748b;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 12px;">Your Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#64748b;font-size:14px;padding:4px 0;width:100px;">SPRNO</td>
                      <td style="color:#1e293b;font-size:14px;font-weight:600;padding:4px 0;">${sprno}</td>
                    </tr>
                    <tr>
                      <td style="color:#64748b;font-size:14px;padding:4px 0;">Branch</td>
                      <td style="color:#1e293b;font-size:14px;font-weight:600;padding:4px 0;">${branch}</td>
                    </tr>
                    <tr>
                      <td style="color:#64748b;font-size:14px;padding:4px 0;">Reunion</td>
                      <td style="color:#1e293b;font-size:14px;font-weight:600;padding:4px 0;">27 June 2026 · Pudukkottai</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- What to do next -->
            <p style="color:#1e293b;font-size:15px;font-weight:600;margin:0 0 12px;">What to do next 👇</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['📝', 'Complete your profile', 'Add your photo, city, and current role'],
                ['📸', 'Share a memory', 'Upload photos or stories from your branch memory wall'],
                ['🎟️', 'RSVP for the reunion', 'Let us know you\'re coming on 27 June 2026'],
                ['🗺️', 'Pin your location', 'Show up on the global alumni map'],
              ].map(([icon, title, desc]) => `
              <tr>
                <td style="padding:8px 0;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:20px;width:36px;vertical-align:top;padding-top:2px;">${icon}</td>
                      <td style="padding-left:8px;">
                        <p style="color:#1e293b;font-size:14px;font-weight:600;margin:0;">${title}</p>
                        <p style="color:#64748b;font-size:13px;margin:2px 0 0;">${desc}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>

            <!-- CTA -->
            <div style="text-align:center;margin-top:32px;">
              <a href="${PORTAL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;">
                Go to Your Dashboard →
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 32px;text-align:center;">
            <p style="color:#94a3b8;font-size:13px;margin:0;">MCE Silver Reunion 2026 · Batch 1997–2001 · Pudukkottai, Tamil Nadu</p>
            <p style="color:#cbd5e1;font-size:12px;margin:8px 0 0;">This email was sent because you registered on the MCE Reunion portal.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Admin notification ──────────────────────────────────────────────────────

function adminNotifHtml(member: { name: string; email: string; sprno: string; branch: string; batch_year: number }) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:100%;">
        <tr>
          <td style="background:#1e293b;padding:28px 32px;">
            <p style="color:#94a3b8;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px;">MCE Reunion · Admin Alert</p>
            <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:0;">New Member Registered 🎓</h2>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
              <tr><td style="padding:20px 24px;">
                ${[
                  ['Name',       member.name],
                  ['SPRNO',      member.sprno],
                  ['Branch',     member.branch],
                  ['Batch Year', String(member.batch_year)],
                  ['Email',      member.email],
                ].map(([k, v]) => `
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                  <tr>
                    <td style="color:#64748b;font-size:13px;width:100px;">${k}</td>
                    <td style="color:#1e293b;font-size:13px;font-weight:600;">${v}</td>
                  </tr>
                </table>`).join('')}
              </td></tr>
            </table>
            <div style="text-align:center;margin-top:24px;">
              <a href="${PORTAL}/admin/members" style="display:inline-block;background:#1e293b;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">
                View in Admin Panel →
              </a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string, sprno: string, branch: string) {
  if (!process.env.RESEND_API_KEY) return
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Welcome to MCE Silver Reunion, ${name}! 🎓`,
      html: welcomeHtml(name, sprno, branch),
    })
  } catch (e) {
    console.error('[email] welcome send failed:', e)
  }
}

export async function sendAdminNotification(member: {
  name: string; email: string; sprno: string; branch: string; batch_year: number
}) {
  if (!process.env.RESEND_API_KEY || !ADMIN) return
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN,
      subject: `New MCE Member: ${member.name} (${member.branch}) 🎓`,
      html: adminNotifHtml(member),
    })
  } catch (e) {
    console.error('[email] admin notif send failed:', e)
  }
}
