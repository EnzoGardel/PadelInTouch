"use client";

import { useState } from "react";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Star } from "lucide-react";

// Tipos de datos
interface Player {
  id: string;
  name: string;
  position: number;
  points: number;
  tournaments: number;
  wins: number;
  losses: number;
  winRate: number;
  lastTournament: string;
  trend: "up" | "down" | "stable";
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  players: Player[];
}

// Datos de ejemplo para las categorías - Determinísticos para evitar errores de hidratación
const generateMockData = (categoryName: string, gender: "M" | "F"): Player[] => {
  const names = gender === "M" 
    ? ["Juan Pérez", "Carlos Rodríguez", "Miguel González", "Luis Martínez", "Diego López", "Andrés Silva", "Roberto Torres", "Fernando Ruiz", "Alejandro Morales", "Ricardo Vargas"]
    : ["María García", "Ana López", "Carmen Rodríguez", "Isabel Martínez", "Elena González", "Patricia Silva", "Rosa Torres", "Lucía Ruiz", "Sofia Morales", "Valentina Vargas"];

  // Datos determinísticos basados en el índice para evitar errores de hidratación
  const mockStats = [
    { tournaments: 15, wins: 45, losses: 8, winRate: 85 },
    { tournaments: 18, wins: 42, losses: 12, winRate: 78 },
    { tournaments: 12, wins: 38, losses: 15, winRate: 72 },
    { tournaments: 20, wins: 35, losses: 18, winRate: 66 },
    { tournaments: 14, wins: 32, losses: 22, winRate: 59 },
    { tournaments: 16, wins: 28, losses: 25, winRate: 53 },
    { tournaments: 10, wins: 25, losses: 28, winRate: 47 },
    { tournaments: 13, wins: 22, losses: 30, winRate: 42 },
    { tournaments: 11, wins: 18, losses: 32, winRate: 36 },
    { tournaments: 9, wins: 15, losses: 35, winRate: 30 },
  ];

  return names.map((name, index) => {
    const stats = mockStats[index] || mockStats[9]; // Fallback al último elemento
    return {
      id: `${categoryName}-${gender}-${index + 1}`,
      name,
      position: index + 1,
      points: Math.max(1000 - (index * 50), 100),
      tournaments: stats.tournaments,
      wins: stats.wins,
      losses: stats.losses,
      winRate: stats.winRate,
      lastTournament: "Torneo de Verano 2024",
      trend: index < 3 ? "up" : index > 7 ? "down" : "stable" as const,
    };
  });
};

const categories: Category[] = [
  {
    id: "primera",
    name: "Primera",
    description: "Nivel más alto - Jugadores profesionales",
    icon: <Trophy className="h-5 w-5 text-yellow-500" />,
    players: generateMockData("primera", "M"),
  },
  {
    id: "segunda",
    name: "Segunda",
    description: "Alto nivel - Jugadores avanzados",
    icon: <Medal className="h-5 w-5 text-gray-400" />,
    players: generateMockData("segunda", "M"),
  },
  {
    id: "tercera",
    name: "Tercera",
    description: "Nivel intermedio alto",
    icon: <Award className="h-5 w-5 text-amber-600" />,
    players: generateMockData("tercera", "M"),
  },
  {
    id: "cuarta",
    name: "Cuarta",
    description: "Nivel intermedio",
    icon: <Star className="h-5 w-5 text-white" />,
    players: generateMockData("cuarta", "M"),
  },
  {
    id: "quinta",
    name: "Quinta",
    description: "Nivel intermedio bajo",
    icon: <Star className="h-5 w-5 text-green-500" />,
    players: generateMockData("quinta", "M"),
  },
  {
    id: "sexta",
    name: "Sexta",
    description: "Nivel principiante avanzado",
    icon: <Star className="h-5 w-5 text-purple-500" />,
    players: generateMockData("sexta", "M"),
  },
  {
    id: "septima",
    name: "Séptima",
    description: "Nivel principiante",
    icon: <Star className="h-5 w-5 text-pink-500" />,
    players: generateMockData("septima", "M"),
  },
  {
    id: "octava",
    name: "Octava",
    description: "Nivel iniciación",
    icon: <Star className="h-5 w-5 text-red-500" />,
    players: generateMockData("octava", "M"),
  },
];

const femaleCategories: Category[] = [
  {
    id: "primera-f",
    name: "Primera",
    description: "Nivel más alto - Jugadoras profesionales",
    icon: <Trophy className="h-5 w-5 text-yellow-500" />,
    players: generateMockData("primera", "F"),
  },
  {
    id: "segunda-f",
    name: "Segunda",
    description: "Alto nivel - Jugadoras avanzadas",
    icon: <Medal className="h-5 w-5 text-gray-400" />,
    players: generateMockData("segunda", "F"),
  },
  {
    id: "tercera-f",
    name: "Tercera",
    description: "Nivel intermedio alto",
    icon: <Award className="h-5 w-5 text-amber-600" />,
    players: generateMockData("tercera", "F"),
  },
  {
    id: "cuarta-f",
    name: "Cuarta",
    description: "Nivel intermedio",
    icon: <Star className="h-5 w-5 text-white" />,
    players: generateMockData("cuarta", "F"),
  },
  {
    id: "quinta-f",
    name: "Quinta",
    description: "Nivel intermedio bajo",
    icon: <Star className="h-5 w-5 text-green-500" />,
    players: generateMockData("quinta", "F"),
  },
  {
    id: "sexta-f",
    name: "Sexta",
    description: "Nivel principiante avanzado",
    icon: <Star className="h-5 w-5 text-purple-500" />,
    players: generateMockData("sexta", "F"),
  },
  {
    id: "septima-f",
    name: "Séptima",
    description: "Nivel principiante",
    icon: <Star className="h-5 w-5 text-pink-500" />,
    players: generateMockData("septima", "F"),
  },
  {
    id: "octava-f",
    name: "Octava",
    description: "Nivel iniciación",
    icon: <Star className="h-5 w-5 text-red-500" />,
    players: generateMockData("octava", "F"),
  },
];

function RankingTable({ players }: { players: Player[] }) {
  const getPositionBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-yellow-500 text-white">🥇</Badge>;
    if (position === 2) return <Badge className="bg-gray-400 text-white">🥈</Badge>;
    if (position === 3) return <Badge className="bg-amber-600 text-white">🥉</Badge>;
    return <Badge variant="secondary">{position}</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <span className="text-green-500">↗️</span>;
      case "down": return <span className="text-red-500">↘️</span>;
      default: return <span className="text-gray-500">→</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold">Posición</th>
            <th className="text-left py-3 px-4 font-semibold">Jugador</th>
            <th className="text-center py-3 px-4 font-semibold">Puntos</th>
            <th className="text-center py-3 px-4 font-semibold">Torneos</th>
            <th className="text-center py-3 px-4 font-semibold">W/L</th>
            <th className="text-center py-3 px-4 font-semibold">% Victoria</th>
            <th className="text-center py-3 px-4 font-semibold">Último Torneo</th>
            <th className="text-center py-3 px-4 font-semibold">Tendencia</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
              <td className="py-3 px-4">
                {getPositionBadge(player.position)}
              </td>
              <td className="py-3 px-4 font-medium">{player.name}</td>
              <td className="py-3 px-4 text-center font-semibold text-primary">{player.points}</td>
              <td className="py-3 px-4 text-center">{player.tournaments}</td>
              <td className="py-3 px-4 text-center">{player.wins}/{player.losses}</td>
              <td className="py-3 px-4 text-center">
                <Badge variant="outline" className={player.winRate >= 80 ? "border-green-500 text-green-600" : ""}>
                  {player.winRate}%
                </Badge>
              </td>
              <td className="py-3 px-4 text-center text-sm text-gray-600">{player.lastTournament}</td>
              <td className="py-3 px-4 text-center text-lg">
                {getTrendIcon(player.trend)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RankingPage() {
  const [selectedGender, setSelectedGender] = useState<"M" | "F">("M");
  const [currentCategory, setCurrentCategory] = useState("primera");

  // Función para manejar el cambio de género
  const handleGenderChange = (gender: "M" | "F") => {
    setSelectedGender(gender);
    // Mantener la misma categoría al cambiar de género
  };

  // Función para obtener el ID de categoría correcto según el género
  const getCategoryId = (baseCategory: string) => {
    if (selectedGender === "M") {
      return baseCategory;
    } else {
      return `${baseCategory}-f`;
    }
  };

  // Función para obtener la categoría base (sin el sufijo -f)
  const getBaseCategory = (categoryId: string) => {
    return categoryId.replace("-f", "");
  };

  // Función para obtener el índice de la categoría
  const getCategoryIndex = (categoryId: string) => {
    const currentCategories = selectedGender === "M" ? categories : femaleCategories;
    return currentCategories.findIndex((cat: Category) => cat.id === categoryId);
  };

  // Función para manejar el cambio de categoría
  const handleCategoryChange = (category: string) => {
    const baseCategory = getBaseCategory(category);
    setCurrentCategory(baseCategory);
  };

  // Obtener el ID de categoría actual según el género
  const currentCategoryId = getCategoryId(currentCategory);

  // 👉 Nueva lógica para indicador responsivo
  const tabs = selectedGender === "M" ? categories : femaleCategories;
  const cols = tabs.length; // 8
  const activeIndex = getCategoryIndex(currentCategoryId); // 0..cols-1

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Ranking de Jugadores</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubre los mejores jugadores y jugadoras de cada categoría. 
              Desde la Primera hasta la Octava, cada nivel tiene sus campeones.
            </p>
          </div>

          {/* Selector de género */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-sm">
              <div
                className="relative grid grid-cols-2 bg-white/10 backdrop-blur-sm rounded-lg p-1"
                // el grid garantiza 2 columnas iguales en cualquier ancho
              >
                {/* Indicador deslizante (mitad exacta del contenedor) */}
                <span
                  className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-md shadow-lg bg-[#0084ff]
                            transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)] will-change-transform"
                  style={{
                    // p-1 = 0.25rem por lado => restamos 0.25rem a la mitad
                    width: "calc(50% - 0.25rem)",
                    transform: selectedGender === "M" ? "translateX(0%)" : "translateX(100%)",
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleGenderChange("M")}
                  className={`relative z-10 px-4 py-1.5 rounded-md font-medium transition-colors
                              ${selectedGender === "M" ? "text-white" : "text-gray-300 hover:text-white"}`}
                  aria-pressed={selectedGender === "M"}
                >
                  Masculino
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderChange("F")}
                  className={`relative z-10 px-4 py-1.5 rounded-md font-medium transition-colors
                              ${selectedGender === "F" ? "text-white" : "text-gray-300 hover:text-white"}`}
                  aria-pressed={selectedGender === "F"}
                >
                  Femenino
                </button>
              </div>
            </div>
          </div>

          {/* Tabs de categorías */}
          <Tabs value={currentCategoryId} onValueChange={handleCategoryChange} className="w-full">
            <TabsList
              className="relative w-full bg-white/10 backdrop-blur-sm overflow-hidden p-1
                         [&>button]:bg-transparent [&>button[data-state=active]]:bg-transparent"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gap: 0,
              }}
            >
              {/* Indicador deslizante para categorías — ancho 1 columna, responsivo */}
              <div
                className="absolute top-1 bottom-1 left-1 rounded-md shadow-lg transition-transform duration-500 ease-out"
                style={{
                  // p-1 = 0.25rem por lado => total 0.5rem
                  width: `calc((100% - 0.5rem) / ${cols})`,
                  transform: `translateX(calc(${activeIndex} * 100%))`,
                  backgroundColor: "#0084ff",
                }}
              />
              
              {tabs.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="relative flex items-center gap-2 text-white
                             data-[state=active]:text-white data-[state=active]:bg-transparent
                             transition-all duration-300 hover:scale-105 hover:bg-white/10 rounded-md"
                  style={{ backgroundColor: "transparent" }}
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
                
            {tabs.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl py-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {category.icon}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {category.name} {selectedGender === "M" ? "Masculino" : "Femenino"}
                        </h2>
                        <p className="text-gray-600 font-normal">{category.description}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RankingTable players={category.players} />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Información adicional */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">¿Cómo funciona el ranking?</h3>
                <p className="text-gray-600 text-sm">
                  Los puntos se otorgan según el rendimiento en torneos oficiales. 
                  Cuanto mejor sea tu posición, más puntos obtienes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Ascensos y descensos</h3>
                <p className="text-gray-600 text-sm">
                  Los jugadores pueden ascender o descender de categoría según 
                  su rendimiento en los torneos de fin de temporada.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Próximos torneos</h3>
                <p className="text-gray-600 text-sm">
                  Mantente atento a nuestros torneos mensuales para ganar puntos 
                  y mejorar tu posición en el ranking.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        </main>
      <Footer />
    </>
  );
}
