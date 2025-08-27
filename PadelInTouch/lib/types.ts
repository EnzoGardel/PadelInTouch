export interface Club {
  id: string
  name: string
  address: string | null
  tz: string
  created_at: string
}

export interface Court {
  id: string
  club_id: string
  name: string
  surface: string | null
  is_outdoor: boolean
  created_at: string
}

export interface TimeSlot {
  id: string
  club_id: string
  court_id: string
  start_utc: string
  end_utc: string
  price: number
  state: "available" | "blocked" | "maintenance"
}

export interface Booking {
  id: string
  club_id: string
  time_slot_id: string
  channel: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  notes: string | null
  price: number
  state: "pending" | "confirmed" | "cancelled"
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string | null
  phone: string | null
  message: string
  created_at: string
}

export interface BookingFormData {
  slotId: string
  name: string
  phone: string
  email?: string
  notes?: string
}
