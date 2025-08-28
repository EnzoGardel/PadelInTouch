import { Navbar } from "@/components/shared/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/shared/footer"
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import SedeSection from '@/components/SedeSection'

export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    
    <main className="min-h-screen">  
      <Navbar />
      <HeroSection />
      <SedeSection />
      <AboutSection />
      <ContactSection />
      <Footer />
      <ul>
        {todos?.map((todo) => (
          <li>{todo}</li>
        ))}
    </ul>
    </main>
    
  )
}
