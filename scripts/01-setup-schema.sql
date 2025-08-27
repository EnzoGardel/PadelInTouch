-- Lavalle Padel Club Database Schema
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Clubs table
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  tz TEXT NOT NULL DEFAULT 'America/Argentina/Cordoba',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courts table
CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  surface TEXT,
  is_outdoor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time slots table
CREATE TYPE IF NOT EXISTS slot_state AS ENUM ('available', 'blocked', 'maintenance');

CREATE TABLE IF NOT EXISTS public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  start_utc TIMESTAMPTZ NOT NULL,
  end_utc TIMESTAMPTZ NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  state slot_state NOT NULL DEFAULT 'available',
  UNIQUE (court_id, start_utc, end_utc)
);

-- Bookings table
CREATE TYPE IF NOT EXISTS booking_state AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE RESTRICT,
  channel TEXT NOT NULL DEFAULT 'web',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  notes TEXT,
  price NUMERIC(10,2) NOT NULL,
  state booking_state NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_slots_lookup ON public.time_slots(club_id, court_id, start_utc);
CREATE INDEX IF NOT EXISTS idx_bookings_lookup ON public.bookings(club_id, time_slot_id, created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at);

-- Transactional function to prevent double bookings
CREATE OR REPLACE FUNCTION public.create_booking_locked(
  p_slot UUID,
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_notes TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_booking_id UUID;
  v_slot RECORD;
BEGIN
  -- Lock the slot for update
  SELECT * INTO v_slot
  FROM public.time_slots
  WHERE id = p_slot
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'slot_not_found';
  END IF;

  IF v_slot.state <> 'available' THEN
    RAISE EXCEPTION 'slot_unavailable';
  END IF;

  -- Block the slot
  UPDATE public.time_slots SET state = 'blocked' WHERE id = v_slot.id;

  -- Create the booking
  INSERT INTO public.bookings (
    id, club_id, time_slot_id, customer_name, customer_phone, 
    customer_email, notes, price, state
  )
  VALUES (
    gen_random_uuid(), v_slot.club_id, v_slot.id, p_name, p_phone, 
    p_email, p_notes, v_slot.price, 'confirmed'
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

-- Row Level Security (RLS) policies
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read access for clubs, courts, and available time slots
CREATE POLICY clubs_read_all ON public.clubs FOR SELECT USING (true);
CREATE POLICY courts_read_all ON public.courts FOR SELECT USING (true);
CREATE POLICY slots_read_all ON public.time_slots FOR SELECT USING (true);

-- No public access to bookings and contact messages (server-side only)
