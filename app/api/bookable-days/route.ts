import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { parseISO, format, addMinutes, getDaysInMonth, startOfDay, isAfter } from 'date-fns'

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
    const date    = parseISO(dateStr)
    const dow     = date.getDay()

    if (startOfDay(date) <= startOfDay(now)) continue

    const wh = (allWH || []).find(w => w.day_of_week === dow)
    if (!wh || !wh.is_working) continue

    const [startH, startM] = wh.start_time.split(':').map(Number)
    const [endH, endM]     = wh.end_time.split(':').map(Number)

    const workStart = new Date(date)
    workStart.setHours(startH, startM, 0, 0)
    const workEnd = new Date(date)
    workEnd.setHours(endH, endM, 0, 0)

    const busyItems = [
      ...(bookings || []).filter(b => b.start_time.startsWith(dateStr)),
      ...(blocked  || []).filter(b => b.start_time.startsWith(dateStr)),
    ]

    let cursor = new Date(workStart)
    let hasSlot = false

    while (true) {
      const slotEnd = addMinutes(cursor, duration)
      if (isAfter(slotEnd, workEnd)) break

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
