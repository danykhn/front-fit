'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Calendar,
  ChevronRight
} from 'lucide-react';
import type { Measurement } from '@/types';

// Mock data
const mockMeasurements: (Measurement & { athleteName: string })[] = [
  {
    id: '1',
    athleteId: 'athlete-1',
    athleteName: 'Carlos Martinez',
    weekNumber: 8,
    date: '2024-06-10',
    weightKg: 82.5,
    waistCm: 84,
    hipCm: 98,
    chestCm: 105,
    armCm: 38,
    thighCm: 58,
    calfCm: 38,
    bodyFatPct: 15.2,
    weightDiffPct: -0.8,
    notes: 'Buen progreso, aumentar calorias',
    createdAt: '2024-06-10',
    updatedAt: '2024-06-10',
  },
  {
    id: '2',
    athleteId: 'athlete-2',
    athleteName: 'Maria Rodriguez',
    weekNumber: 6,
    date: '2024-06-08',
    weightKg: 65.2,
    waistCm: 72,
    hipCm: 95,
    chestCm: 88,
    armCm: 28,
    thighCm: 54,
    calfCm: 35,
    bodyFatPct: 22.5,
    weightDiffPct: -1.2,
    createdAt: '2024-06-08',
    updatedAt: '2024-06-08',
  },
  {
    id: '3',
    athleteId: 'athlete-3',
    athleteName: 'Juan Perez',
    weekNumber: 10,
    date: '2024-06-05',
    weightKg: 90.0,
    waistCm: 92,
    hipCm: 102,
    chestCm: 112,
    armCm: 42,
    thighCm: 62,
    calfCm: 40,
    bodyFatPct: 18.0,
    weightDiffPct: 0.5,
    notes: 'Manteniendo peso, ajustar macros',
    createdAt: '2024-06-05',
    updatedAt: '2024-06-05',
  },
];

const athletes = [
  { id: 'athlete-1', name: 'Carlos Martinez' },
  { id: 'athlete-2', name: 'Maria Rodriguez' },
  { id: 'athlete-3', name: 'Juan Perez' },
  { id: 'athlete-4', name: 'Ana Garcia' },
];

export default function MeasurementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [athleteFilter, setAthleteFilter] = useState<string>('all');
  const [measurements] = useState(mockMeasurements);

  const filteredMeasurements = measurements.filter(m => {
    const matchesSearch = m.athleteName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAthlete = athleteFilter === 'all' || m.athleteId === athleteFilter;
    return matchesSearch && matchesAthlete;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{measurements.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Mediciones</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">-0.8%</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Peso Prom.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Ruler className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">82.6</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Cintura (cm)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">Hoy</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Ultima</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 sm:gap-4 flex-1">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-input/50 h-9 sm:h-10"
                  />
                </div>
                <Select value={athleteFilter} onValueChange={setAthleteFilter}>
                  <SelectTrigger className="w-28 sm:w-48 bg-input/50 h-9 sm:h-10">
                    <SelectValue placeholder="Atleta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {athletes.map((athlete) => (
                      <SelectItem key={athlete.id} value={athlete.id}>
                        {athlete.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm">
                <Plus className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Nueva Medicion</span>
                <span className="sm:hidden">Nueva</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Measurements List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredMeasurements.map((measurement) => (
            <Card key={measurement.id} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-primary">
                        {measurement.athleteName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm sm:text-base truncate">{measurement.athleteName}</CardTitle>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(measurement.date)}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          Sem {measurement.weekNumber}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary h-8 px-2 flex-shrink-0">
                    <span className="hidden sm:inline text-xs">Historial</span>
                    <ChevronRight className="h-4 w-4 sm:ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-2 sm:pt-2">
                {/* Mobile: 3 columns, Desktop: more */}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7 sm:gap-4">
                  {/* Weight */}
                  <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center">
                    <p className="text-base sm:text-lg font-bold text-foreground">{measurement.weightKg}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Peso (kg)</p>
                    {measurement.weightDiffPct !== undefined && (
                      <div className={`flex items-center justify-center gap-0.5 mt-0.5 ${
                        measurement.weightDiffPct < 0 ? 'text-green-500' : 
                        measurement.weightDiffPct > 0 ? 'text-red-500' : 
                        'text-muted-foreground'
                      }`}>
                        {measurement.weightDiffPct < 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : measurement.weightDiffPct > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : null}
                        <span className="text-[10px] sm:text-xs font-medium">{measurement.weightDiffPct}%</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Body Fat */}
                  {measurement.bodyFatPct && (
                    <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center">
                      <p className="text-base sm:text-lg font-bold text-foreground">{measurement.bodyFatPct}%</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Grasa</p>
                    </div>
                  )}

                  {/* Waist */}
                  {measurement.waistCm && (
                    <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center">
                      <p className="text-base sm:text-lg font-bold text-foreground">{measurement.waistCm}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Cintura</p>
                    </div>
                  )}

                  {/* Hip - hidden on mobile */}
                  {measurement.hipCm && (
                    <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center hidden sm:block">
                      <p className="text-base sm:text-lg font-bold text-foreground">{measurement.hipCm}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Cadera</p>
                    </div>
                  )}

                  {/* Chest - hidden on mobile */}
                  {measurement.chestCm && (
                    <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center hidden lg:block">
                      <p className="text-base sm:text-lg font-bold text-foreground">{measurement.chestCm}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Pecho</p>
                    </div>
                  )}

                  {/* Arm - hidden on mobile */}
                  {measurement.armCm && (
                    <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center hidden lg:block">
                      <p className="text-base sm:text-lg font-bold text-foreground">{measurement.armCm}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Brazo</p>
                    </div>
                  )}

                  {/* Thigh - hidden on mobile */}
                  {measurement.thighCm && (
                    <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center hidden lg:block">
                      <p className="text-base sm:text-lg font-bold text-foreground">{measurement.thighCm}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Muslo</p>
                    </div>
                  )}
                </div>

                {measurement.notes && (
                  <div className="mt-2 sm:mt-4 p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs sm:text-sm text-foreground">
                      <span className="font-medium text-primary">Notas:</span> {measurement.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          {filteredMeasurements.length} de {measurements.length} mediciones
        </p>
      </div>
    </AppLayout>
  );
}
