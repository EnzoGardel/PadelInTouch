-- Function to check court availability
CREATE OR REPLACE FUNCTION check_court_availability(
  p_court_id INTEGER,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM reservations
    WHERE court_id = p_court_id
    AND reservation_date = p_date
    AND status IN ('confirmed', 'pending')
    AND (
      (start_time <= p_start_time AND end_time > p_start_time) OR
      (start_time < p_end_time AND end_time >= p_end_time) OR
      (start_time >= p_start_time AND end_time <= p_end_time)
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get available time slots for a court on a specific date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_court_id INTEGER,
  p_date DATE,
  p_slot_duration INTEGER DEFAULT 90 -- 90 minutes default
) RETURNS TABLE(start_time TIME, end_time TIME) AS $$
DECLARE
  slot_start TIME;
  slot_end TIME;
  opening_time TIME := '08:00';
  closing_time TIME := '23:00';
BEGIN
  slot_start := opening_time;
  
  WHILE slot_start + (p_slot_duration || ' minutes')::INTERVAL <= closing_time LOOP
    slot_end := slot_start + (p_slot_duration || ' minutes')::INTERVAL;
    
    IF check_court_availability(p_court_id, p_date, slot_start, slot_end) THEN
      RETURN QUERY SELECT slot_start, slot_end;
    END IF;
    
    slot_start := slot_start + '30 minutes'::INTERVAL;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
