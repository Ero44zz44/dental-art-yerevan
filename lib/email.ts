import nodemailer from 'nodemailer'
import { BUSINESS } from './config'
import type { Booking, Staff, Service } from './types'

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

const FROM = `Dental Art Yerevan <${process.env.GMAIL_USER ?? 'noreply@dental-art.am'}>`

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('hy-AM', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('hy-AM', { hour: '2-digit', minute: '2-digit' })
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 16px 10px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#C9A96E;white-space:nowrap;vertical-align:top;border-bottom:1px solid #e8e5de;">${label}</td>
      <td style="padding:10px 0;font-size:15px;color:#1A1A1A;font-weight:600;vertical-align:top;border-bottom:1px solid #e8e5de;">${value}</td>
    </tr>`
}

export async function sendCustomerConfirmation(
  booking: Booking,
  staff: Staff,
  service: Service
) {
  const date = formatDate(booking.start_time)
  const time = formatTime(booking.start_time)

  await getTransporter().sendMail({
    from: FROM,
    to: booking.customer_email,
    subject: `Ձեր ժամադրությունը հաստատված է — ${date}`,
    html: `<!DOCTYPE html>
<html lang="hy">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Ժամադրության հաստատում</title>
</head>
<body style="margin:0;padding:0;background:#F5F4F0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#1B3A4B;">🦷 ${BUSINESS.name}</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:12px;padding:40px 36px;border:1px solid #e8e5de;">

              <!-- Success icon -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:56px;height:56px;background:#fdf6ec;border-radius:50%;text-align:center;vertical-align:middle;font-size:28px;">✓</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:6px;">
                    <span style="font-size:22px;font-weight:700;color:#1B3A4B;">Ձեր ժամադրությունը հաստատված է!</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <span style="font-size:15px;color:#5a6475;">Մենք սպասում ենք ձեզ:</span>
                  </td>
                </tr>
              </table>

              <!-- Details table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8e5de;">
                ${row('Ծառայություն', service.name)}
                ${row('Բժիշկ', staff.name)}
                ${row('Ամսաթիվ', date)}
                ${row('Ժամ', time)}
                ${row('Տևողություն', `${service.duration_minutes} ր.`)}
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;font-size:13px;color:#5a6475;line-height:1.6;">
              <p style="margin:0 0 4px;">Հարցերի դեպքում զանգահարեք <a href="${BUSINESS.phoneHref}" style="color:#C9A96E;text-decoration:none;">${BUSINESS.phone}</a></p>
              <p style="margin:0;">${BUSINESS.addressArm}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}

export async function sendStaffNotification(
  booking: Booking,
  staff: Staff,
  service: Service
) {
  const date = formatDate(booking.start_time)
  const time = formatTime(booking.start_time)
  const notifyEmail = process.env.RESEND_NOTIFY_EMAIL || staff.email

  await getTransporter().sendMail({
    from: FROM,
    to: notifyEmail,
    subject: `New Appointment — ${booking.customer_name} | ${date} ${time}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New Appointment</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <tr>
            <td style="background:#ffffff;border-radius:10px;padding:32px;border:1px solid #e2e0da;">
              <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#1B3A4B;">🦷 New Appointment</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e0da;">
                <tr>
                  <td style="padding:10px 16px 10px 0;font-size:13px;font-weight:700;color:#5a6475;white-space:nowrap;vertical-align:top;border-bottom:1px solid #e2e0da;width:130px;">Patient</td>
                  <td style="padding:10px 0;font-size:14px;color:#1A1A1A;vertical-align:top;border-bottom:1px solid #e2e0da;">${booking.customer_name}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px 10px 0;font-size:13px;font-weight:700;color:#5a6475;white-space:nowrap;vertical-align:top;border-bottom:1px solid #e2e0da;">Phone</td>
                  <td style="padding:10px 0;font-size:14px;color:#1A1A1A;vertical-align:top;border-bottom:1px solid #e2e0da;"><a href="tel:${booking.customer_phone}" style="color:#C9A96E;text-decoration:none;">${booking.customer_phone}</a></td>
                </tr>
                <tr>
                  <td style="padding:10px 16px 10px 0;font-size:13px;font-weight:700;color:#5a6475;white-space:nowrap;vertical-align:top;border-bottom:1px solid #e2e0da;">Email</td>
                  <td style="padding:10px 0;font-size:14px;color:#1A1A1A;vertical-align:top;border-bottom:1px solid #e2e0da;">${booking.customer_email}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px 10px 0;font-size:13px;font-weight:700;color:#5a6475;white-space:nowrap;vertical-align:top;border-bottom:1px solid #e2e0da;">Service</td>
                  <td style="padding:10px 0;font-size:14px;color:#1A1A1A;vertical-align:top;border-bottom:1px solid #e2e0da;">${service.name} (${service.duration_minutes} min)</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px 10px 0;font-size:13px;font-weight:700;color:#5a6475;white-space:nowrap;vertical-align:top;border-bottom:1px solid #e2e0da;">Date</td>
                  <td style="padding:10px 0;font-size:14px;color:#1A1A1A;vertical-align:top;border-bottom:1px solid #e2e0da;">${date}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px 10px 0;font-size:13px;font-weight:700;color:#5a6475;white-space:nowrap;vertical-align:top;${booking.notes ? 'border-bottom:1px solid #e2e0da;' : ''}">Time</td>
                  <td style="padding:10px 0;font-size:14px;color:#1A1A1A;vertical-align:top;${booking.notes ? 'border-bottom:1px solid #e2e0da;' : ''}">${time}</td>
                </tr>
                ${booking.notes ? `
                <tr>
                  <td style="padding:10px 16px 10px 0;font-size:13px;font-weight:700;color:#5a6475;white-space:nowrap;vertical-align:top;">Notes</td>
                  <td style="padding:10px 0;font-size:14px;color:#1A1A1A;vertical-align:top;">${booking.notes}</td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}
