import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { addMinutes, getDaysInMonth, isAfter } from 'date-fns'
import { TZ_OFFSET } from '@/lib/config'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const staffId   = searchParams.get('staffId')
  const serviceId = searchParams.get('serviceId')
  const year      = Number(searchParams.get('year'))
  const month     = Number(searchParams.get('month')) // 1-based

  if (!staffId || !serviceId || !year || !month) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const supabase  = createServerClient()

  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .single()

  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  const duration = service.duration_minutes

  const { data: allWH = [] } = await supabase
    .from('working_hours')
    .select('*')
    .eq('staff_id', staffId)

  const monthStart = `${year}-${String(month).padStart(2, '0')}-01T00:00:00+00:00`
  const lastDay    = getDaysInMonth(new Date(year, month - 1))
  const monthEnd   = `${year}-${String(month).padStart(2, '0')}-${lastDay}T23:59:59+00:00`

  const { data: bookings = [] } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('staff_id', staffId)
    .eq('status', 'confirmed')
    .gte('start_time', monthStart)
    .lte('start_time', monthEnd)

  const { data: blocked = [] } = await supabase
    .from('blocked_slots')
    .select('start_time, end_time')
    .eq('staff_id', staffId)
    .gte('start_time', monthStart)
    .lte('start_time', monthEnd)

  const availableDays: number[] = []
  const now = new Date()

  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`

    // Compare date strings in Armenia time — avoids UTC startOfDay() mismatch on Vercel
    const armeniaToday = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 10)
    if (dateStr < armeniaToday) continue

    const dayInLocalTZ = new Date(`${dateStr}T00:00:00${TZ_OFFSET}`)

    // day-of-week in Armenia local time
    const dow = dayInLocalTZ.getUTCDay()

    const wh = (allWH || []).find(w => w.day_of_week === dow)
    if (!wh || !wh.is_working) continue

    const startTimeStr = wh.start_time.substring(0, 5)
    const endTimeStr   = wh.end_time.substring(0, 5)

    // Build work window in Armenia local time (explicit offset → correct UTC timestamps)
    const workStart = new Date(`${dateStr}T${startTimeStr}:00${TZ_OFFSET}`)
    const workEnd   = new Date(`${dateStr}T${endTimeStr}:00${TZ_OFFSET}`)

    const busyItems = [
      ...(bookings || []).filter(b => b.start_time.startsWith(dateStr)),
      ...(blocked  || []).filter(b => b.start_time.startsWith(dateStr)),
    ]

    let cursor = new Date(workStart)
    let hasSlot = false

    while (true) {
      const slotEnd = addMinutes(cursor, duration)
      if (isAfter(slotEnd, workEnd)) break

      if (!isAfter(cursor, now)) {
        cursor = addMinutes(cursor, duration)
        continue
      }

      const overlaps = busyItems.some(item => {
        const bStart = new Date(item.start_time)
        const bEnd   = new Date(item.end_time)
        return cursor < bEnd && slotEnd > bStart
      })

      if (!overlaps) { hasSlot = true; break }
      cursor = addMinutes(cursor, duration)
    }

    if (hasSlot) availableDays.push(d)
  }

  return NextResponse.json({ availableDays })
}
