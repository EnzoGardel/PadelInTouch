-- 03-mercadopago.sql
-- Adds Mercado Pago integration tables/columns and constraints

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending','approved','rejected','refunded','chargeback');
  END IF;
END $$;

-- Bookings additions (idempotent)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'ARS',
  ADD COLUMN IF NOT EXISTS mp_preference_id TEXT,
  ADD COLUMN IF NOT EXISTS mp_external_ref TEXT UNIQUE;

-- Ensure only one booking per slot
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'bookings_time_slot_unique'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_time_slot_unique UNIQUE (time_slot_id);
  END IF;
END $$;

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'mercado_pago',
  mp_payment_id TEXT UNIQUE,
  mp_merchant_order TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'ARS',
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- update timestamp trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- When a payment is approved, mark booking as confirmed
CREATE OR REPLACE FUNCTION public.apply_payment_on_booking()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE public.bookings
      SET state = 'confirmed'
      WHERE id = NEW.booking_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_to_booking ON public.payments;
CREATE TRIGGER trg_payment_to_booking
AFTER INSERT OR UPDATE OF status ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.apply_payment_on_booking();

-- ===== Seed: 3 sucursales (si no existían) con 3 canchas cada una =====
-- Centro, Norte, Sur (IDs fijos para idempotencia)
INSERT INTO public.clubs (id, name, address, tz) VALUES
  ('11111111-1111-1111-1111-111111111111','Sucursal Centro','Córdoba - Centro','America/Argentina/Cordoba'),
  ('22222222-2222-2222-2222-222222222222','Sucursal Norte','Córdoba - Zona Norte','America/Argentina/Cordoba'),
  ('33333333-3333-3333-3333-333333333333','Sucursal Sur','Córdoba - Zona Sur','America/Argentina/Cordoba')
ON CONFLICT (id) DO NOTHING;

-- 3 canchas por sucursal
INSERT INTO public.courts (id, club_id, name, surface, is_outdoor) VALUES
  ('11111111-1111-1111-1111-aaaaaaaaaaa1','11111111-1111-1111-1111-111111111111','Cancha 1','sintético',false),
  ('11111111-1111-1111-1111-aaaaaaaaaaa2','11111111-1111-1111-1111-111111111111','Cancha 2','sintético',false),
  ('11111111-1111-1111-1111-aaaaaaaaaaa3','11111111-1111-1111-1111-111111111111','Cancha 3','sintético',true),
  ('22222222-2222-2222-2222-bbbbbbbbbbb1','22222222-2222-2222-2222-222222222222','Cancha 1','sintético',false),
  ('22222222-2222-2222-2222-bbbbbbbbbbb2','22222222-2222-2222-2222-222222222222','Cancha 2','sintético',false),
  ('22222222-2222-2222-2222-bbbbbbbbbbb3','22222222-2222-2222-2222-222222222222','Cancha 3','sintético',true),
  ('33333333-3333-3333-3333-ccccccccccc1','33333333-3333-3333-3333-333333333333','Cancha 1','sintético',false),
  ('33333333-3333-3333-3333-ccccccccccc2','33333333-3333-3333-3333-333333333333','Cancha 2','sintético',false),
  ('33333333-3333-3333-3333-ccccccccccc3','33333333-3333-3333-3333-333333333333','Cancha 3','sintético',true)
ON CONFLICT (id) DO NOTHING;

-- Generar time_slots 90 min, 08:00-23:30 por 30 días para estas canchas si no existen
DO $$
DECLARE
  court_rec RECORD;
  start_date DATE := CURRENT_DATE;
  end_date DATE := CURRENT_DATE + INTERVAL '30 days';
  current_date DATE;
  start_time TIME := TIME '08:00';
  close_time TIME := TIME '23:30';
  current_start TIMESTAMP;
  current_end TIMESTAMP;
  base_price NUMERIC := 0; -- ajustá tus precios
BEGIN
  FOR court_rec IN
    SELECT id, club_id FROM public.courts
    WHERE club_id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333')
  LOOP
    current_date := start_date;
    WHILE current_date <= end_date LOOP
      current_start := (current_date + start_time) AT TIME ZONE 'America/Argentina/Cordoba';
      WHILE (current_start::time <= close_time - INTERVAL '90 minutes') LOOP
        current_end := current_start + INTERVAL '90 minutes';
        INSERT INTO public.time_slots (club_id, court_id, start_utc, end_utc, price, state)
        VALUES (court_rec.club_id, court_rec.id, current_start, current_end, base_price, 'available')
        ON CONFLICT (court_id, start_utc, end_utc) DO NOTHING;
        current_start := current_start + INTERVAL '90 minutes';
      END LOOP;
      current_date := current_date + INTERVAL '1 day';
    END LOOP;
  END LOOP;
END $$;