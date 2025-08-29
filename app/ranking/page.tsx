import { Footer } from "@/components/shared/footer"
import { Navbar } from "@/components/shared/navbar";

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]"></div>
          <h1 className="text-3xl font-bold mb-6">Ranking</h1>
          <p className="text-slate-600">
            Próximamente: tabla de posiciones, puntos por torneo y más.
          </p>
        </main>
      <Footer />
    </>
  );
}