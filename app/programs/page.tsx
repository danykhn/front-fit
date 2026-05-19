'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Calendar,
  ChevronRight,
  Users,
  Clock,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Play,
  ChevronLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { ROUTES, DAY_TYPES } from '@/lib/constants';
import type { Program, DayType } from '@/types';

// Mock data para demo
const mockPrograms: (Program & { 
  athleteCount: number; 
  completedWeeks: number;
  status: 'active' | 'completed' | 'draft';
})[] = [
  {
    id: '1',
    trainerId: 'trainer-1',
    name: 'Hipertrofia Avanzada',
    description: 'Programa de 12 semanas para ganancia muscular',
    mesocycle: 'Acumulacion',
    totalWeeks: 12,
    isTemplate: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
    athleteCount: 5,
    completedWeeks: 8,
    status: 'active',
  },
  {
    id: '2',
    trainerId: 'trainer-1',
    name: 'Fuerza Base',
    description: 'Desarrollo de fuerza maxima',
    mesocycle: 'Intensificacion',
    totalWeeks: 8,
    isTemplate: true,
    createdAt: '2024-02-01',
    updatedAt: '2024-06-08',
    athleteCount: 0,
    completedWeeks: 0,
    status: 'draft',
  },
  {
    id: '3',
    trainerId: 'trainer-1',
    name: 'Definicion Verano',
    description: 'Perdida de grasa manteniendo masa muscular',
    mesocycle: 'Realizacion',
    totalWeeks: 10,
    isTemplate: false,
    createdAt: '2024-03-10',
    updatedAt: '2024-06-05',
    athleteCount: 3,
    completedWeeks: 10,
    status: 'completed',
  },
  {
    id: '4',
    trainerId: 'trainer-1',
    name: 'PPL Principiantes',
    description: 'Push Pull Legs para comenzar',
    mesocycle: 'Acumulacion',
    totalWeeks: 6,
    isTemplate: true,
    createdAt: '2024-04-01',
    updatedAt: '2024-06-01',
    athleteCount: 0,
    completedWeeks: 0,
    status: 'draft',
  },
];

const weekDays: { day: number; type: DayType; name: string }[] = [
  { day: 1, type: 'EMPUJE', name: 'Empuje A' },
  { day: 2, type: 'TIRON', name: 'Tiron A' },
  { day: 3, type: 'PIERNA', name: 'Pierna A' },
  { day: 4, type: 'DESCANSO', name: 'Descanso' },
  { day: 5, type: 'EMPUJE', name: 'Empuje B' },
  { day: 6, type: 'TIRON', name: 'Tiron B' },
  { day: 7, type: 'PIERNA', name: 'Pierna B' },
];

const statusColors = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  draft: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
};

const statusLabels = {
  active: 'Activo',
  completed: 'Completado',
  draft: 'Borrador',
};

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programs] = useState(mockPrograms);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(programs[0]?.id || null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentProgram = programs.find(p => p.id === selectedProgram);

  const handleSelectProgram = (id: string) => {
    setSelectedProgram(id);
    setShowDetail(true);
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-28 sm:w-40 bg-input/50 h-9 sm:h-10">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm">
            <Plus className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Programa</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        {/* Mobile: Show list or detail */}
        <div className="lg:hidden">
          {!showDetail ? (
            <div className="space-y-3">
              {filteredPrograms.map((program) => (
                <Card 
                  key={program.id}
                  className="border-border/50 cursor-pointer transition-all hover:border-primary/30 active:scale-[0.99]"
                  onClick={() => handleSelectProgram(program.id)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                          {program.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {program.description}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] sm:text-xs flex-shrink-0 ${statusColors[program.status]}`}
                      >
                        {statusLabels[program.status]}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{program.totalWeeks} sem</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{program.athleteCount}</span>
                      </div>
                      {program.isTemplate && (
                        <Badge variant="secondary" className="text-[10px]">Plantilla</Badge>
                      )}
                    </div>

                    {program.status === 'active' && (
                      <div className="mt-2">
                        <Progress 
                          value={(program.completedWeeks / program.totalWeeks) * 100} 
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : currentProgram ? (
            <div className="space-y-4">
              {/* Back button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDetail(false)}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>

              <Card className="border-border/50">
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-lg">{currentProgram.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {currentProgram.description}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className={`text-xs ${statusColors[currentProgram.status]}`}>
                      {statusLabels[currentProgram.status]}
                    </Badge>
                    {currentProgram.mesocycle && (
                      <Badge variant="secondary" className="text-xs">{currentProgram.mesocycle}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-3 rounded-lg bg-secondary/30 text-center">
                      <p className="text-lg sm:text-xl font-bold text-foreground">{currentProgram.totalWeeks}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Semanas</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30 text-center">
                      <p className="text-lg sm:text-xl font-bold text-foreground">{currentProgram.athleteCount}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Atletas</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30 text-center">
                      <p className="text-lg sm:text-xl font-bold text-foreground">7</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Sesiones</p>
                    </div>
                  </div>

                  {/* Weekly Schedule */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-foreground text-sm mb-2">Estructura Semanal</h4>
                    <div className="space-y-2">
                      {weekDays.map((day) => (
                        <Link 
                          key={day.day} 
                          href={ROUTES.WORKOUTS}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                              D{day.day}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{day.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {DAY_TYPES[day.type]}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-primary hover:bg-primary/90 h-9 text-sm">
                      <Play className="h-4 w-4 mr-1" />
                      Asignar
                    </Button>
                    <Button variant="outline" className="flex-1 h-9 text-sm">
                      Ver Detalle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>

        {/* Desktop: Side by side */}
        <div className="hidden lg:grid gap-6 lg:grid-cols-3">
          {/* Program List */}
          <div className="lg:col-span-1 space-y-3">
            {filteredPrograms.map((program) => (
              <Card 
                key={program.id}
                className={`border-border/50 cursor-pointer transition-all ${
                  selectedProgram === program.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/30'
                }`}
                onClick={() => setSelectedProgram(program.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {program.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {program.description}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={statusColors[program.status]}
                    >
                      {statusLabels[program.status]}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{program.totalWeeks} semanas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{program.athleteCount}</span>
                    </div>
                  </div>

                  {program.status === 'active' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="text-primary font-medium">
                          {Math.round((program.completedWeeks / program.totalWeeks) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(program.completedWeeks / program.totalWeeks) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {program.isTemplate && (
                    <Badge className="mt-3 bg-secondary text-secondary-foreground">
                      Plantilla
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Program Detail */}
          <div className="lg:col-span-2">
            {currentProgram ? (
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <div>
                    <CardTitle className="text-xl">{currentProgram.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentProgram.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <Badge variant="outline" className={statusColors[currentProgram.status]}>
                        {statusLabels[currentProgram.status]}
                      </Badge>
                      {currentProgram.mesocycle && (
                        <Badge variant="secondary">{currentProgram.mesocycle}</Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-secondary/30 text-center">
                      <p className="text-2xl font-bold text-foreground">{currentProgram.totalWeeks}</p>
                      <p className="text-xs text-muted-foreground">Semanas</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30 text-center">
                      <p className="text-2xl font-bold text-foreground">{currentProgram.athleteCount}</p>
                      <p className="text-xs text-muted-foreground">Atletas</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30 text-center">
                      <p className="text-2xl font-bold text-foreground">7</p>
                      <p className="text-xs text-muted-foreground">Sesiones/Semana</p>
                    </div>
                  </div>

                  {/* Weekly Schedule */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">Estructura Semanal</h4>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Sesion
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {weekDays.map((day) => (
                        <Link 
                          key={day.day} 
                          href={ROUTES.WORKOUTS}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                              D{day.day}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{day.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {DAY_TYPES[day.type]}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {day.type !== 'DESCANSO' && (
                              <>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>60 min</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  6 ejercicios
                                </Badge>
                              </>
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-primary hover:bg-primary/90">
                      <Play className="h-4 w-4 mr-2" />
                      Asignar a Atleta
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Ver Detalle Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50 h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Selecciona un programa para ver los detalles
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
