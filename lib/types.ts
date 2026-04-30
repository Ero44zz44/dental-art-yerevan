export interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
  description: string
  created_at: string
}

export interface Staff {
  id: string
  name: string
  photo_url: string | null
  email: string
  bio: string | null
  created_at: string
}

export interface WorkingHours {
  id: string
  staff_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
}

export interface StaffService {
  id: string
  staff_id: string
  service_id: string
}

export interface Booking {
  id: string
  staff_id: string
  service_id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  start_time: string
  end_time: string
  status: 'confirmed' | 'cancelled'
  notes: string | null
  created_at: string
  staff?: Staff
  service?: Service
}

export interface BlockedSlot {
  id: string
  staff_id: string
  start_time: string
  end_time: string
  reason: string | null
}
