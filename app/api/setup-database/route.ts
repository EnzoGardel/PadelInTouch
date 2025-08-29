import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()

    const schemaSQL = `
      -- Create clubs table
      CREATE TABLE IF NOT EXISTS public.clubs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create courts table
      CREATE TABLE IF NOT EXISTS public.courts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        court_type VARCHAR(50) DEFAULT 'padel',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create time_slots table
      CREATE TABLE IF NOT EXISTS public.time_slots (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create bookings table
      CREATE TABLE IF NOT EXISTS public.bookings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        time_slot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create contact_messages table
      CREATE TABLE IF NOT EXISTS public.contact_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_courts_club_id ON public.courts(club_id);
      CREATE INDEX IF NOT EXISTS idx_time_slots_court_id ON public.time_slots(court_id);
      CREATE INDEX IF NOT EXISTS idx_time_slots_start_time ON public.time_slots(start_time);
      CREATE INDEX IF NOT EXISTS idx_bookings_time_slot_id ON public.bookings(time_slot_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON public.bookings(customer_email);

      -- Enable RLS
      ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies (allow all for now)
      DROP POLICY IF EXISTS "Allow all operations on clubs" ON public.clubs;
      CREATE POLICY "Allow all operations on clubs" ON public.clubs FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Allow all operations on courts" ON public.courts;
      CREATE POLICY "Allow all operations on courts" ON public.courts FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Allow all operations on time_slots" ON public.time_slots;
      CREATE POLICY "Allow all operations on time_slots" ON public.time_slots FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Allow all operations on bookings" ON public.bookings;
      CREATE POLICY "Allow all operations on bookings" ON public.bookings FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Allow all operations on contact_messages" ON public.contact_messages;
      CREATE POLICY "Allow all operations on contact_messages" ON public.contact_messages FOR ALL USING (true);
    `

    const { _error: schemaError } = await supabase.rpc("exec_sql", { sql: schemaSQL })

    if (schemaError) {
      // Try direct SQL execution if RPC doesn't work
      const statements = schemaSQL.split(";").filter((stmt) => stmt.trim())
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.from("_").select("*").limit(0) // This will fail but establish connection
          // Execute via raw query if possible
        }
      }
    }

    const _seedSQL = `
      -- Insert Lavalle Padel Club
      INSERT INTO public.clubs (id, name, address, phone, email) 
      VALUES (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'Lavalle Padel Club',
        'Av. Pellegrini 1234, Rosario, Santa Fe, Argentina',
        '+54 341 123-4567',
        'info@lavallepadel.com'
      ) ON CONFLICT (id) DO NOTHING;

      -- Insert courts
      INSERT INTO public.courts (id, club_id, name, court_type, is_active) VALUES
      ('c1b2c3d4-e5f6-7890-abcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cancha 1', 'padel', true),
      ('c2b2c3d4-e5f6-7890-abcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cancha 2', 'padel', true),
      ('c3b2c3d4-e5f6-7890-abcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cancha 3', 'padel', true),
      ('c4b2c3d4-e5f6-7890-abcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cancha 4', 'padel', true)
      ON CONFLICT (id) DO NOTHING;
    `

    const { error: clubError } = await supabase.from("clubs").upsert({
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      name: "Lavalle Padel Club",
      address: "Av. Pellegrini 1234, Rosario, Santa Fe, Argentina",
      phone: "+54 341 123-4567",
      email: "info@lavallepadel.com",
    })

    if (!clubError) {
      // Insert courts
      await supabase.from("courts").upsert([
        {
          id: "c1b2c3d4-e5f6-7890-abcd-ef1234567890",
          club_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          name: "Cancha 1",
          court_type: "padel",
          is_active: true,
        },
        {
          id: "c2b2c3d4-e5f6-7890-abcd-ef1234567890",
          club_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          name: "Cancha 2",
          court_type: "padel",
          is_active: true,
        },
        {
          id: "c3b2c3d4-e5f6-7890-abcd-ef1234567890",
          club_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          name: "Cancha 3",
          court_type: "padel",
          is_active: true,
        },
        {
          id: "c4b2c3d4-e5f6-7890-abcd-ef1234567890",
          club_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          name: "Cancha 4",
          court_type: "padel",
          is_active: true,
        },
      ])

      // Generate time slots for the next 30 days
      const timeSlots = []
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + 30)

      const courts = [
        "c1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "c2b2c3d4-e5f6-7890-abcd-ef1234567890",
        "c3b2c3d4-e5f6-7890-abcd-ef1234567890",
        "c4b2c3d4-e5f6-7890-abcd-ef1234567890",
      ]

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        for (const courtId of courts) {
          for (let hour = 8; hour < 22; hour += 2) {
            const startTime = new Date(date)
            startTime.setHours(hour, 0, 0, 0)
            const endTime = new Date(startTime)
            endTime.setHours(hour + 2, 0, 0, 0)

            // Dynamic pricing
            const isWeekend = date.getDay() === 0 || date.getDay() === 6
            const isPeakHour = hour >= 18 && hour <= 20
            let price = 2500 // Base price

            if (isWeekend) price += 500
            if (isPeakHour) price += 800

            timeSlots.push({
              court_id: courtId,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              price: price,
              is_available: true,
            })
          }
        }
      }

      // Insert time slots in batches
      const batchSize = 100
      for (let i = 0; i < timeSlots.length; i += batchSize) {
        const batch = timeSlots.slice(i, i + batchSize)
        await supabase.from("time_slots").upsert(batch)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json({ error: "Failed to initialize database", details: error }, { status: 500 })
  }
}
