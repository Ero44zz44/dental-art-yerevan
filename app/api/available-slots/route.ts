import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { addMinutes, isAfter } from 'date-fns'
import { TZ_OFFSET } from '@/lib/config'

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
  // Parse date in Armenia local time to get the correct day-of-week
  const date = new Date(`${dateStr}T00:00:00${TZ_OFFSET}`)
  const dow  = date.getUTCDay() // use UTC since we constructed with explicit offset
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

  // 5. Generate slots in Armenia local time (working hours are local time)
  // e.g. "09:00:00" Armenia = 05:00 UTC — build with explicit offset so
  // the resulting Date is a correct UTC timestamp regardless of server timezone
  const startTimeStr = wh.start_time.substring(0, 5) // "09:00"
  const endTimeStr   = wh.end_time.substring(0, 5)   // "18:00"

  const workStart = new Date(`${dateStr}T${startTimeStr}:00${TZ_OFFSET}`)
  const workEnd   = new Date(`${dateStr}T${endTimeStr}:00${TZ_OFFSET}`)

  const now = new Date()
  const slots: string[] = []
  const busySlots: string[] = []
  let cursor = new Date(workStart)
  const busyItems = [...(bookings || []), ...(blocked || [])]

  while (true) {
    const slotEnd = addMinutes(cursor, duration)
    if (isAfter(slotEnd, workEnd)) break

    // Skip past slots — don't show them at all
    if (!isAfter(cursor, now)) {
      cursor = addMinutes(cursor, duration)
      continue
    }

    // Check overlap with bookings or blocked slots
    const overlaps = busyItems.some(item => {
      const bStart = new Date(item.start_time)
      const bEnd   = new Date(item.end_time)
      return cursor < bEnd && slotEnd > bStart
    })

    const isoSlot = cursor.toISOString()
    if (overlaps) {
      busySlots.push(isoSlot)
    } else {
      slots.push(isoSlot)
    }

    cursor = addMinutes(cursor, duration)
  }

  return NextResponse.json({ slots, busySlots })
}
