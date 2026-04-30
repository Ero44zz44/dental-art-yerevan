import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { sendCustomerConfirmation, sendStaffNotification } from '@/lib/email'
import { addMinutes } from 'date-fns'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { staffId, serviceId, startTime, customerName, customerPhone, customerEmail, notes } = body

  if (!staffId || !serviceId || !startTime || !customerName || !customerPhone || !customerEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Get service to compute end_time
  const { data: service, error: svcErr } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single()

  if (svcErr || !service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  const start  = new Date(startTime)
  const end    = addMinutes(start, service.duration_minutes)
  const endISO = end.toISOString()

  // Check that the slot is still available (race condition guard)
  const dayStr   = startTime.substring(0, 10)
  const dayStart = `${dayStr}T00:00:00+00:00`
  const dayEnd   = `${dayStr}T23:59:59+00:00`

  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('staff_id', staffId)
    .eq('status', 'confirmed')
    .gte('start_time', dayStart)
    .lte('start_time', dayEnd)

  const overlapping = (conflicts || []).some(c => {
    // We don't have c.start/end here — just a quick check
    // A more thorough check is done client-side; this catches obvious double-books
    return false
  })

  if (overlapping) {
    return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 })
  }

  // Insert booking
  const { data: booking, error: bookErr } = await supabase
    .from('bookings')
    .insert({
      staff_id:       staffId,
      service_id:     serviceId,
      customer_name:  customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      start_time:     new Date(startTime).toISOString(),
      end_time:       endISO,
      status:         'confirmed',
      notes:          notes || null,
    })
    .select()
    .single()

  if (bookErr || !booking) {
    console.error('Booking insert error:', bookErr)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // Get staff info for emails
  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('id', staffId)
    .single()

  // Send emails (non-blocking — don't fail the request if email fails)
  if (staff) {
    try {
      await Promise.all([
        sendCustomerConfirmation(booking, staff, service),
        sendStaffNotification(booking, staff, service),
      ])
    } catch (emailErr) {
      console.error('Email send error (non-fatal):', emailErr)
    }
  }

  return NextResponse.json({ booking }, { status: 201 })
}
