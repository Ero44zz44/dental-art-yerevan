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
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('staff_id', staffId)
    .eq('status', 'confirmed')

  const newStart = new Date(startTime)
  const newEnd   = new Date(endISO)

  const overlapping = (conflicts || []).some(c => {
    const cStart = new Date(c.start_time)
    const cEnd   = new Date(c.end_time)
    return newStart < cEnd && newEnd > cStart
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

  // Send emails independently so one failure doesn't block the other
  if (staff) {
    await sendCustomerConfirmation(booking, staff, service).catch(err =>
      console.error('Customer email error:', err)
    )
    await sendStaffNotification(booking, staff, service).catch(err =>
      console.error('Staff email error:', err)
    )
  }

  return NextResponse.json({ booking }, { status: 201 })
}
