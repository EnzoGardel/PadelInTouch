-- Seed data for Lavalle Padel Club
-- Insert main club
INSERT INTO public.clubs (id, name, address, tz) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Lavalle Padel Club',
  'Lavalle 123, Rosario, Santa Fe',
  'America/Argentina/Cordoba'
) ON CONFLICT (id) DO NOTHING;

-- Insert courts
INSERT INTO public.courts (id, club_id, name, surface, is_outdoor) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'Cancha 1',
  'Césped sintético',
  false
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  'Cancha 2',
  'Césped sintético',
  false
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440000',
  'Cancha 3 (Outdoor)',
  'Césped sintético',
  true
) ON CONFLICT (id) DO NOTHING;

-- Generate time slots for the next 30 days
-- This will create slots from 8:00 to 22:00 (every 1.5 hours) for all courts
DO $$
DECLARE
  club_uuid UUID := '550e8400-e29b-41d4-a716-446655440000';
  court_record RECORD;
  current_date DATE;
  slot_time TIME;
  start_datetime TIMESTAMPTZ;
  end_datetime TIMESTAMPTZ;
  base_price NUMERIC := 8000.00; -- Base price in ARS
  weekend_price NUMERIC := 10000.00; -- Weekend price in ARS
  slot_price NUMERIC;
BEGIN
  -- Loop through each court
  FOR court_record IN 
    SELECT id FROM public.courts WHERE club_id = club_uuid
  LOOP
    -- Loop through next 30 days
    FOR i IN 0..29 LOOP
      current_date := CURRENT_DATE + i;
      
      -- Create slots from 8:00 to 22:00 (every 1.5 hours)
      FOR hour_offset IN 0..9 LOOP
        slot_time := '08:00:00'::TIME + (hour_offset * INTERVAL '1.5 hours');
        
        -- Convert to UTC (Argentina is UTC-3)
        start_datetime := (current_date + slot_time) AT TIME ZONE 'America/Argentina/Cordoba';
        end_datetime := start_datetime + INTERVAL '1.5 hours';
        
        -- Set price based on day of week (weekend is more expensive)
        IF EXTRACT(DOW FROM current_date) IN (0, 6) THEN -- Sunday or Saturday
          slot_price := weekend_price;
        ELSE
          slot_price := base_price;
        END IF;
        
        -- Insert the time slot
        INSERT INTO public.time_slots (
          club_id, court_id, start_utc, end_utc, price, state
        ) VALUES (
          club_uuid, court_record.id, start_datetime, end_datetime, slot_price, 'available'
        ) ON CONFLICT (court_id, start_utc, end_utc) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
