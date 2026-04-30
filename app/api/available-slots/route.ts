import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { parseISO, format, addMinutes, isAfter } from 'date-fns'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const staffId   = searchParams.get('staffId')
  const dateStr   = searchParams.get('date')       // YYYY-MM-DD
  const serviceId = searchParams.get('serviceId')

  if (!staffId || !dateStr || !serviceId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const supabase = createServerClient()

  // 1. Get service duration
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .single()

  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  const duration = service.duration_minutes

  // 2. Get working hours for this staff on this day of week
  const date    = parseISO(dateStr)
  const dow     = date.getDay() // 0=Sunday
  const { data: wh } = await supabase
    .from('working_hours')
    .select('*')
    .eq('staff_id', staffId)
    .eq('day_of_week', dow)
    .single()

  if (!wh || !wh.is_working) {
    return NextResponse.json({ slots: [] })
  }

  // 3. Get existing confirmed bookings for this staff on this date
  const dayStart = `${dateStr}T00:00:00+00:00`
  const dayEnd   = `${dateStr}T23:59:59+00:00`

  const { data: bookings = [] } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('staff_id', staffId)
    .eq('status', 'confirmed')
    .gte('start_time', dayStart)
    .lte('start_time', dayEnd)

  // 4. Get blocked slots for this staff on this date
  const { data: blocked = [] } = await supabase
    .from('blocked_slots')
    .select('start_time, end_time')
    .eq('staff_id', staffId)
    .gte('start_time', dayStart)
    .lte('start_time', dayEnd)

  // 5. Generate slots
  const [startH, startM] = wh.start_time.split(':').map(Number)
  const [endH, endM]     = wh.end_time.split(':').map(Number)

  const workStart = new Date(date)
  workStart.setHours(startH, startM, 0, 0)

  const workEnd = new Date(date)
  workEnd.setHours(endH, endM, 0, 0)

  const now = new Date()
  const slots: string[] = []
  let cursor = new Date(workStart)

  while (true) {
    const slotEnd = addMinutes(cursor, duration)
    if (isAfter(slotEnd, workEnd)) break

    // Skip past slots
    if (!isAfter(cursor, now)) {
      cursor = addMinutes(cursor, duration)
      continue
    }

    // Check overlap with bookings or blocked slots
    const busyItems = [...(bookings || []), ...(blocked || [])]
    const overlaps = busyItems.some(item => {
      const bStart = new Date(item.start_time)
      const bEnd   = new Date(item.end_time)
      return cursor < bEnd && slotEnd > bStart
    })

    if (!overlaps) {
      slots.push(format(cursor, "yyyy-MM-dd'T'HH:mm:ss"))
    }

    cursor = addMinutes(cursor, duration)
  }

  return NextResponse.json({ slots })
}
