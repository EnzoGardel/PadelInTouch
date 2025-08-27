"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Club, Court } from "@/lib/types";

interface BookingSearchProps {
  onSearch: (clubId: string, courtId: string, date: string) => void;
  isLoading?: boolean;
}

export function BookingSearch({ onSearch, isLoading }: BookingSearchProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [loadingCourts, setLoadingCourts] = useState(false);

  // Cargar sucursales
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/clubs");
        const data = await res.json();
        if (data?.clubs?.length) {
          setClubs(data.clubs);
          if (data.clubs.length === 1) setSelectedClub(data.clubs[0].id);
        }
      } catch (e) {
        console.error("Error loading clubs:", e);
      }
    })();
  }, []);

  // Cargar canchas por sucursal
  useEffect(() => {
    if (!selectedClub) return;
    setLoadingCourts(true);
    setSelectedCourt("");
    setCourts([]);
    (async () => {
      try {
        const res = await fetch(`/api/courts?clubId=${selectedClub}`);
        const data = await res.json();
        if (data?.courts) setCourts(data.courts);
      } catch (e) {
        console.error("Error loading courts:", e);
      } finally {
        setLoadingCourts(false);
      }
    })();
  }, [selectedClub]);

  const handleSearch = () => {
    if (selectedClub && selectedCourt && selectedDate) {
      onSearch(selectedClub, selectedCourt, format(selectedDate, "yyyy-MM-dd"));
    }
  };

  const canSearch = !!selectedClub && !!selectedCourt && !!selectedDate && !isLoading;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Reservá tu cancha</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sucursal */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sucursal</label>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sucursal" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cancha */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Cancha</label>
            <Select
              value={selectedCourt}
              onValueChange={setSelectedCourt}
              disabled={!selectedClub || loadingCourts}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingCourts ? "Cargando..." : "Seleccionar cancha"} />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name} {court.is_outdoor && "(Outdoor)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Fecha</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) =>
                    date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  }
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleSearch} disabled={!canSearch} size="lg" className="px-8">
            <SearchIcon className="mr-2 h-4 w-4" />
            {isLoading ? "Buscando..." : "Buscar disponibilidad"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
