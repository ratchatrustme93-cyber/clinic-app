import nodemailer from 'nodemailer'
import prisma from './prisma.js'

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

function buildEmailHtml(appt) {
  const dateStr = new Date(appt.startAt).toLocaleString('th-TH', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Bangkok'
  })
  const serviceName = appt.service?.name || 'บริการ'
  const clinicName = appt.clinic?.name || 'คลินิก'

  return {
    subject: `🌸 แจ้งเตือนนัดหมาย – ${clinicName}`,
    html: `
      <div style="font-family:Sarabun,Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #fce7f3">
        <div style="background:linear-gradient(135deg,#ec4899,#f43f5e);padding:24px;text-align:center">
          <p style="font-size:28px;margin:0">🌸</p>
          <h2 style="color:#fff;margin:8px 0 0;font-size:18px">${clinicName}</h2>
        </div>
        <div style="padding:24px">
          <p style="color:#374151;font-size:15px;margin:0 0 16px">สวัสดีค่ะ คุณ<strong>${appt.patient.name}</strong></p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 20px">ขอแจ้งเตือนนัดหมายของคุณ</p>

          <div style="background:#fdf2f8;border-radius:10px;padding:16px;margin-bottom:20px">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="color:#9ca3af;font-size:13px;padding:4px 0;width:80px">บริการ</td>
                <td style="color:#111827;font-size:14px;font-weight:600">${serviceName}</td>
              </tr>
              <tr>
                <td style="color:#9ca3af;font-size:13px;padding:4px 0">วันที่</td>
                <td style="color:#111827;font-size:14px;font-weight:600">${dateStr}</td>
              </tr>
              ${appt.doctor ? `
              <tr>
                <td style="color:#9ca3af;font-size:13px;padding:4px 0">แพทย์</td>
                <td style="color:#111827;font-size:14px">${appt.doctor.name}</td>
              </tr>` : ''}
            </table>
          </div>

          <p style="color:#6b7280;font-size:13px;margin:0">หากต้องการเลื่อนหรือยกเลิกนัด กรุณาติดต่อคลินิกล่วงหน้าค่ะ</p>
        </div>
        <div style="background:#fdf2f8;padding:12px 24px;text-align:center">
          <p style="color:#d1d5db;font-size:12px;margin:0">${clinicName}</p>
        </div>
      </div>
    `
  }
}

export async function sendEmailReminder(appt) {
  const isMock = process.env.EMAIL_MOCK === 'true'
  const toEmail = appt.patient.email

  if (!toEmail) {
    return { ok: false, reason: 'Patient has no email' }
  }

  const { subject, html } = buildEmailHtml(appt)

  if (isMock) {
    console.log('\n📧 [EMAIL MOCK] ──────────────────────────')
    console.log(`To     : ${toEmail}`)
    console.log(`Subject: ${subject}`)
    console.log(`Patient: ${appt.patient.name}`)
    console.log('─────────────────────────────────────────\n')
    await prisma.emailLog.create({
      data: { appointmentId: appt.id, toEmail, status: 'MOCK' }
    })
    return { ok: true, status: 'MOCK', toEmail }
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return { ok: false, reason: 'SMTP not configured' }
  }

  try {
    const transporter = createTransport()
    await transporter.sendMail({
      from: `"${appt.clinic?.name || 'Clinic'}" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      html
    })
    await prisma.emailLog.create({ data: { appointmentId: appt.id, toEmail, status: 'SENT' } })
    return { ok: true, status: 'SENT', toEmail }
  } catch (err) {
    await prisma.emailLog.create({ data: { appointmentId: appt.id, toEmail, status: 'FAILED', error: err.message } })
    return { ok: false, error: err.message }
  }
}
