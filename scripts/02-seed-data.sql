-- Insert the 3 Lavalle Padel locations in Rosario
INSERT INTO locations (name, address, phone, latitude, longitude, opening_hours) VALUES
(
  'Lavalle Padel Centro',
  'Av. Pellegrini 1234, Centro, Rosario, Santa Fe',
  '+54 341 123-4567',
  -32.9442,
  -60.6505,
  '{"monday": "08:00-23:00", "tuesday": "08:00-23:00", "wednesday": "08:00-23:00", "thursday": "08:00-23:00", "friday": "08:00-24:00", "saturday": "09:00-24:00", "sunday": "09:00-23:00"}'
),
(
  'Lavalle Padel Norte',
  'Bv. Oroño 2567, Barrio Norte, Rosario, Santa Fe',
  '+54 341 234-5678',
  -32.9200,
  -60.6800,
  '{"monday": "07:00-23:00", "tuesday": "07:00-23:00", "wednesday": "07:00-23:00", "thursday": "07:00-23:00", "friday": "07:00-24:00", "saturday": "08:00-24:00", "sunday": "08:00-23:00"}'
),
(
  'Lavalle Padel Sur',
  'Av. Circunvalación 3890, Zona Sur, Rosario, Santa Fe',
  '+54 341 345-6789',
  -32.9800,
  -60.6300,
  '{"monday": "08:00-22:30", "tuesday": "08:00-22:30", "wednesday": "08:00-22:30", "thursday": "08:00-22:30", "friday": "08:00-23:30", "saturday": "09:00-23:30", "sunday": "09:00-22:30"}'
);

-- Insert courts for each location
-- Centro location (4 courts)
INSERT INTO courts (location_id, name, court_type) VALUES
(1, 'Cancha 1', 'padel'),
(1, 'Cancha 2', 'padel'),
(1, 'Cancha 3', 'padel'),
(1, 'Cancha 4', 'padel');

-- Norte location (6 courts)
INSERT INTO courts (location_id, name, court_type) VALUES
(2, 'Cancha A', 'padel'),
(2, 'Cancha B', 'padel'),
(2, 'Cancha C', 'padel'),
(2, 'Cancha D', 'padel'),
(2, 'Cancha E', 'padel'),
(2, 'Cancha F', 'padel');

-- Sur location (5 courts)
INSERT INTO courts (location_id, name, court_type) VALUES
(3, 'Cancha Alpha', 'padel'),
(3, 'Cancha Beta', 'padel'),
(3, 'Cancha Gamma', 'padel'),
(3, 'Cancha Delta', 'padel'),
(3, 'Cancha Omega', 'padel');
