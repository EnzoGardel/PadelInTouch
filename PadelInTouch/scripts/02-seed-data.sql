-- Seed data for Lavalle Padel Club

-- Insert the main club
INSERT INTO public.clubs (id, name, address, tz) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Lavalle Padel Club',
  'Av. Pellegrini 1234, Rosario, Santa Fe, Argentina',
  'America/Argentina/Cordoba'
) ON CONFLICT (id) DO NOTHING;

-- Insert courts
INSERT INTO public.courts (id, club_id, name, surface, is_outdoor) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Cancha 1', 'Césped sintético', false),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Cancha 2', 'Césped sintético', false),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Cancha 3', 'Césped sintético', true),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Cancha 4', 'Césped sintético', true)
ON CONFLICT (id) DO NOTHING;

-- Generate time slots for the next 30 days
DO $$
DECLARE
  court_record RECORD;
  slot_date DATE;
  slot_hour INTEGER;
  slot_start TIMESTAMPTZ;
  slot_end TIMESTAMPTZ;
  base_price NUMERIC(10,2);
BEGIN
  -- Loop through each court
  FOR court_record IN SELECT id FROM public.courts LOOP
    -- Loop through next 30 days
    FOR i IN 0..29 LOOP
      slot_date := CURRENT_DATE + i;
      
      -- Skip if slots already exist for this court and date
      IF EXISTS (
        SELECT 1 FROM public.time_slots 
        WHERE court_id = court_record.id 
        AND start_utc::date = slot_date
      ) THEN
        CONTINUE;
      END IF;
      
      -- Generate slots from 8 AM to 11 PM (15 hours = 15 slots)
      FOR slot_hour IN 8..22 LOOP
        slot_start := (slot_date + (slot_hour || ' hours')::interval) AT TIME ZONE 'America/Argentina/Cordoba';
        slot_end := slot_start + interval '1 hour';
        
        -- Dynamic pricing: peak hours (18-22) cost more
        IF slot_hour >= 18 THEN
          base_price := 8000.00; -- Peak hours
        ELSE
          base_price := 6000.00; -- Off-peak hours
        END IF;
        
        -- Weekend surcharge
        IF EXTRACT(dow FROM slot_date) IN (0, 6) THEN
          base_price := base_price * 1.2;
        END IF;
        
        INSERT INTO public.time_slots (club_id, court_id, start_utc, end_utc, price, state)
        VALUES (
          '550e8400-e29b-41d4-a716-446655440000',
          court_record.id,
          slot_start,
          slot_end,
          base_price,
          'available'
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
