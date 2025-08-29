// ruta: app/page.tsx
import { Navbar } from "@/components/shared/navbar";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/shared/footer";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import SedeSection from "@/components/SedeSection";

// 🔒 Evita el prerender: esta página es intencionalmente dinámica
export const dynamic = "force-dynamic";
// Alternativa equivalente:
// export const revalidate = 0;

export default async function HomePage() {
  // cookies() es síncrono; no uses await
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from("todos").select();

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <SedeSection />
      <AboutSection />
      <ContactSection />
      <Footer />

      {/* Render defensivo de 'todos' */}
      <ul>
        {Array.isArray(todos) &&
          todos.map((todo: any, idx: number) => (
            <li key={todo?.id ?? idx}>
              {typeof todo === "string"
                ? todo
                : todo?.title ?? todo?.name ?? JSON.stringify(todo)}
            </li>
          ))}
      </ul>

      {/* Opcional: muestra error si existiera */}
      {error && (
        <p className="text-sm text-red-600 mt-4">
          Error cargando todos: {error.message}
        </p>
      )}
    </main>
  );
}
