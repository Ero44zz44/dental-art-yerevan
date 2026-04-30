import { Resend } from 'resend'
import { BUSINESS } from './config'
import type { Booking, Staff, Service } from './types'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}
const FROM = () => process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('hy-AM', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('hy-AM', { hour: '2-digit', minute: '2-digit' })
}

export async function sendCustomerConfirmation(
  booking: Booking,
  staff: Staff,
  service: Service
) {
  const date = formatDate(booking.start_time)
  const time = formatTime(booking.start_time)

  await getResend().emails.send({
    from: `${BUSINESS.name} <${FROM()}>`,
    to: booking.customer_email,
    subject: `Ձեր ժամադրությունը հաստատված է — ${date}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Noto Sans Armenian', Arial, sans-serif; background: #FAFAF7; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 16px rgba(0,0,0,.08); }
    .logo { font-family: Georgia, serif; font-size: 22px; color: #1B3A4B; margin-bottom: 24px; }
    .check { width: 56px; height: 56px; background: rgba(201,169,110,.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    h1 { color: #1B3A4B; font-size: 22px; margin: 0 0 8px; text-align: center; }
    .sub { color: #5a6475; font-size: 15px; text-align: center; margin-bottom: 32px; }
    .detail-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e2e0da; }
    .detail-row:last-child { border-bottom: none; margin-bottom: 0; }
    .detail-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #C9A96E; width: 120px; flex-shrink: 0; margin-top: 2px; }
    .detail-value { font-size: 15px; color: #1A1A1A; font-weight: 600; }
    .footer { text-align: center; margin-top: 32px; font-size: 13px; color: #5a6475; }
    .footer a { color: #C9A96E; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">🦷 ${BUSINESS.name}</div>
      <h1>Ձեր ժամադրությունը հաստատված է!</h1>
      <p class="sub">Մենք սպասում ենք ձեզ:</p>

      <div class="detail-row">
        <div class="detail-label">Ծառայություն</div>
        <div class="detail-value">${service.name}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Բժիշկ</div>
        <div class="detail-value">${staff.name}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Ամսաթիվ</div>
        <div class="detail-value">${date}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Ժամ</div>
        <div class="detail-value">${time}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Տևողություն</div>
        <div class="detail-value">${service.duration_minutes} min</div>
      </div>

      <div class="footer">
        <p>Եթե կարիք ունեք, զանգահարեք <a href="${BUSINESS.phoneHref}">${BUSINESS.phone}</a></p>
        <p>${BUSINESS.addressArm}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  })
}

export async function sendStaffNotification(
  booking: Booking,
  staff: Staff,
  service: Service
) {
  const date = formatDate(booking.start_time)
  const time = formatTime(booking.start_time)

  await getResend().emails.send({
    from: `${BUSINESS.name} <${FROM()}>`,
    to: staff.email,
    subject: `Նոր ժամադրություն — ${booking.customer_name} | ${date} ${time}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .wrapper { max-width: 520px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #fff; border-radius: 10px; padding: 32px; }
    h2 { color: #1B3A4B; margin: 0 0 24px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 10px 0; border-bottom: 1px solid #e2e0da; font-size: 14px; vertical-align: top; }
    td:first-child { color: #5a6475; width: 140px; font-weight: 600; }
    td:last-child { color: #1A1A1A; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <h2>🦷 New Appointment</h2>
      <table>
        <tr><td>Patient</td><td>${booking.customer_name}</td></tr>
        <tr><td>Phone</td><td><a href="tel:${booking.customer_phone}">${booking.customer_phone}</a></td></tr>
        <tr><td>Email</td><td>${booking.customer_email}</td></tr>
        <tr><td>Service</td><td>${service.name} (${service.duration_minutes} min)</td></tr>
        <tr><td>Date</td><td>${date}</td></tr>
        <tr><td>Time</td><td>${time}</td></tr>
        ${booking.notes ? `<tr><td>Notes</td><td>${booking.notes}</td></tr>` : ''}
      </table>
    </div>
  </div>
</body>
</html>
    `,
  })
}
